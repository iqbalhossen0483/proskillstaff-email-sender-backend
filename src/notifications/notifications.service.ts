import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly resend: Resend | null;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromAddress =
      config.get<string>('FROM_EMAIL_ADDRESS') ?? 'info@proskillstaff.com';
  }

  async sendPasswordReset(email: string, resetLink: string) {
    const subject = 'Reset your password';
    const html = `
      <p>You requested a password reset. Click the link below to set a new password.</p>
      <p><a href="${resetLink}">Reset password</a></p>
      <p>This link expires in 30 minutes. If you did not request this, ignore this email.</p>
    `;
    await this.send(email, subject, html);
  }

  async sendInvite(email: string, name: string, resetLink: string) {
    const subject = "You've been invited";
    const html = `
      <p>Hi ${name},</p>
      <p>You have been invited to Email Sender. Click the link below to set your password and get started.</p>
      <p><a href="${resetLink}">Set password</a></p>
      <p>This link expires in 30 minutes.</p>
    `;
    await this.send(email, subject, html);
  }

  private async send(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.warn(
        `[RESEND_API_KEY not set] Would send "${subject}" to ${to}`,
      );
      return;
    }
    const { error } = await this.resend.emails.send({
      from: this.fromAddress,
      to,
      subject,
      html,
    });
    if (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(error.message);
    }
  }
}
