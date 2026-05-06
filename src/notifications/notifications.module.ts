import { NotificationsProcessor } from '@/notifications/notifications.processor';
import { NotificationsService } from '@/notifications/notifications.service';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

@Module({
  imports: [BullModule.registerQueue({ name: 'notifications' })],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
