import { PasswordReset } from '@/entities/password-reset.entity';
import { User, UserRole, UserStatus } from '@/entities/user.entity';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { ListUsersDto } from '@/users/dto/list-users.dto';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { InjectQueue } from '@nestjs/bullmq';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(PasswordReset)
    private readonly resetRepo: Repository<PasswordReset>,
    private readonly config: ConfigService,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  async findAll(dto: ListUsersDto) {
    const qb = this.userRepo.createQueryBuilder('u');

    if (dto.search) {
      qb.andWhere('(u.name ILIKE :q OR u.email ILIKE :q)', {
        q: `%${dto.search}%`,
      });
    }
    if (dto.role) qb.andWhere('u.role = :role', { role: dto.role });
    if (dto.status) qb.andWhere('u.status = :status', { status: dto.status });

    const [data, total] = await qb
      .orderBy('u.created_at', 'DESC')
      .skip((dto.page - 1) * dto.limit)
      .take(dto.limit)
      .getManyAndCount();

    return { data, total, page: dto.page, limit: dto.limit };
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const rounds = this.config.get<number>('BCRYPT_ROUNDS') ?? 12;
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const password_hash = await bcrypt.hash(tempPassword, rounds);

    const user = await this.userRepo.save(
      this.userRepo.create({
        ...dto,
        password_hash,
        status: UserStatus.ACTIVE,
      }),
    );

    await this.issueInvite(user);
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (
      dto.role &&
      dto.role !== UserRole.SUPER_ADMIN &&
      user.role === UserRole.SUPER_ADMIN
    ) {
      await this.assertNotLastSuperAdmin(id);
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({
        where: { email: dto.email },
      });
      if (existing) throw new ConflictException('Email already in use');
    }

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async suspend(id: number) {
    const user = await this.findOne(id);
    await this.userRepo.update(id, { status: UserStatus.SUSPENDED });
    return { ...user, status: UserStatus.SUSPENDED };
  }

  async reactivate(id: number) {
    const user = await this.findOne(id);
    await this.userRepo.update(id, { status: UserStatus.ACTIVE });
    return { ...user, status: UserStatus.ACTIVE };
  }

  async softDelete(id: number) {
    await this.findOne(id);
    await this.assertNotLastSuperAdmin(id);
    await this.userRepo.softDelete(id);
  }

  async triggerPasswordReset(id: number) {
    const user = await this.findOne(id);
    await this.issueInvite(user);
  }

  private async issueInvite(user: User) {
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

    const resetLink = `${this.config.getOrThrow<string>('FRONTEND_URL')}/reset-password?token=${rawToken}`;
    await this.notificationsQueue.add('invite', {
      email: user.email,
      name: user.name,
      resetLink,
    });
  }

  private async assertNotLastSuperAdmin(excludeId: number) {
    const count = await this.userRepo
      .createQueryBuilder('u')
      .where('u.role = :role', { role: UserRole.SUPER_ADMIN })
      .andWhere('u.id != :id', { id: excludeId })
      .getCount();

    if (count === 0) {
      throw new UnprocessableEntityException(
        'Cannot remove the last super_admin',
      );
    }
  }
}
