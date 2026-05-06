import { DashboardController } from '@/dashboard/dashboard.controller';
import { DashboardService } from '@/dashboard/dashboard.service';
import { EmailSend } from '@/entities/email-send.entity';
import { EmailTemplate } from '@/entities/email-template.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([EmailSend, EmailTemplate])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
