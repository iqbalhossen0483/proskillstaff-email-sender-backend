import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { PasswordReset } from '@/entities/password-reset.entity';
import { User } from '@/entities/user.entity';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') ?? '1h' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, PasswordReset]),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
