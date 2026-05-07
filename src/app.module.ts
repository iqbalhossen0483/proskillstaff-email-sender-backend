import { AuthModule } from '@/auth/auth.module';
import { validate } from '@/config/env.validation';
import { CsvModule } from '@/csv/csv.module';
import { DashboardModule } from '@/dashboard/dashboard.module';
import { EmailSend } from '@/entities/email-send.entity';
import { EmailTemplate } from '@/entities/email-template.entity';
import { Layout } from '@/entities/layout.entity';
import { PasswordReset } from '@/entities/password-reset.entity';
import { User } from '@/entities/user.entity';
import { HealthController } from '@/health/health.controller';
import { LayoutsModule } from '@/layouts/layouts.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { RedisModule } from '@/redis/redis.module';
import { SendsModule } from '@/sends/sends.module';
import { TemplatesModule } from '@/templates/templates.module';
import { UploadsModule } from '@/uploads/uploads.module';
import { UsersModule } from '@/users/users.module';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    RedisModule,

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow('DATABASE_URL'),
        entities: [User, Layout, EmailTemplate, EmailSend, PasswordReset],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.getOrThrow('REDIS_URL') },
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    LayoutsModule,
    NotificationsModule,
    TemplatesModule,
    SendsModule,
    DashboardModule,
    UsersModule,
    UploadsModule,
    CsvModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
