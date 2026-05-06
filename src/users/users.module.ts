import { PasswordReset } from '@/entities/password-reset.entity';
import { User } from '@/entities/user.entity';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PasswordReset]),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
