import { EmailSend, SendStatus } from '@/entities/email-send.entity';
import {
  EmailRendererService,
  LayoutAContent,
  LayoutBContent,
} from '@/sends/email-renderer.service';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Resend } from 'resend';
import { Repository } from 'typeorm';

interface DispatchJobData {
  sendId: number;
  recipientEmails: string[];
  subject: string;
  contentJson: Record<string, unknown>;
  layoutSlug: string;
}

@Processor('email-dispatch', {
  limiter: { max: 10, duration: 1000 },
})
export class EmailDispatchProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailDispatchProcessor.name);
  private readonly resend: Resend | null;
  private readonly fromAddress = 'noreply@proskill.app';

  constructor(
    @InjectRepository(EmailSend)
    private readonly sendRepo: Repository<EmailSend>,
    private readonly renderer: EmailRendererService,
    config: ConfigService,
  ) {
    super();
    const apiKey = config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
  }

  async process(job: Job<DispatchJobData>): Promise<void> {
    const { sendId, recipientEmails, subject, contentJson, layoutSlug } =
      job.data;

    try {
      const html =
        layoutSlug === 'layout_a'
          ? this.renderer.renderLayoutA(
              contentJson as unknown as LayoutAContent,
            )
          : this.renderer.renderLayoutB(
              contentJson as unknown as LayoutBContent,
            );

      if (!this.resend) {
        this.logger.warn(
          `[RESEND_API_KEY not set] Would send "${subject}" to ${recipientEmails.join(', ')}`,
        );
      } else {
        const { error } = await this.resend.emails.send({
          from: this.fromAddress,
          to: recipientEmails,
          subject,
          html,
        });
        if (error) throw new Error(error.message);
      }

      await this.sendRepo.update(sendId, {
        status: SendStatus.SENT,
        sent_at: new Date(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to dispatch send ${sendId}: ${message}`);
      await this.sendRepo.update(sendId, {
        status: SendStatus.FAILED,
        error_message: message,
      });
      throw err;
    }
  }
}
