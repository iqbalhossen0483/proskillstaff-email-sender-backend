import { PasswordReset } from '@/entities/password-reset.entity';
import { User, UserStatus } from '@/entities/user.entity';
import { InjectQueue } from '@nestjs/bullmq';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';
import Redis from 'ioredis';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(PasswordReset)
    private readonly resetRepo: Repository<PasswordReset>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (user.status === UserStatus.SUSPENDED)
      throw new ForbiddenException('Account is suspended');

    await this.userRepo.update(user.id, { last_login_at: new Date() });

    const jti = uuidv4();
    const payload = { sub: user.id, role: user.role, jti };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return; // never reveal whether email exists

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await this.resetRepo.save(
      this.resetRepo.create({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      }),
    );

    const resetLink = `${this.config.getOrThrow('FRONTEND_URL')}/reset-password?token=${rawToken}`;
    await this.notificationsQueue.add('password-reset', {
      email: user.email,
      name: user.name,
      resetLink,
    });
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const reset = await this.resetRepo.findOne({
      where: { token_hash: tokenHash, used_at: undefined },
      relations: ['user'],
    });

    if (!reset || reset.expires_at < new Date() || reset.used_at) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    const rounds = this.config.get<number>('BCRYPT_ROUNDS') ?? 12;
    const hash = await bcrypt.hash(newPassword, rounds);

    await this.userRepo.update(reset.user_id, { password_hash: hash });
    await this.resetRepo.update(reset.id, { used_at: new Date() });
  }

  async logout(jti: string, exp: number) {
    const ttl = Math.max(exp - Math.floor(Date.now() / 1000), 1);
    await this.redis.set(`bl:${jti}`, '1', 'EX', ttl);
  }

  getMe(user: { id: number; email: string; role: string }) {
    return user;
  }
}
