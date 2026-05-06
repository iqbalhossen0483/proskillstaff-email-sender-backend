import { User } from '@/entities/user.entity';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

export interface JwtPayload {
  sub: number;
  role: string;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('JWT_SECRET'),
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload) {
    const blacklisted = await this.redis.get(`bl:${payload.jti}`);
    if (blacklisted) throw new UnauthorizedException('Token has been revoked');

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      jti: payload.jti,
    };
  }
}
