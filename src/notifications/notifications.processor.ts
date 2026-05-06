import { NotificationsService } from '@/notifications/notifications.service';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

interface PasswordResetJobData {
  email: string;
  name: string;
  resetLink: string;
}

interface InviteJobData {
  email: string;
  name: string;
  resetLink: string;
}

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'password-reset': {
        const data = job.data as PasswordResetJobData;
        await this.notificationsService.sendPasswordReset(
          data.email,
          data.resetLink,
        );
        break;
      }
      case 'invite': {
        const data = job.data as InviteJobData;
        await this.notificationsService.sendInvite(
          data.email,
          data.name,
          data.resetLink,
        );
        break;
      }
      default:
        this.logger.warn(`Unknown notifications job: ${job.name}`);
    }
  }
}
