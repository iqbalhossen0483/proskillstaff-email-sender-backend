import { EmailSend, SendStatus } from '@/entities/email-send.entity';
import { EmailTemplate } from '@/entities/email-template.entity';
import { CreateSendDto } from '@/sends/dto/create-send.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class SendsService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly templateRepo: Repository<EmailTemplate>,
    @InjectRepository(EmailSend)
    private readonly sendRepo: Repository<EmailSend>,
    @InjectQueue('email-dispatch') private readonly dispatchQueue: Queue,
  ) {}

  async send(dto: CreateSendDto, userId: number) {
    const template = await this.templateRepo.findOne({
      where: { id: dto.template_id, deleted_at: IsNull() },
      relations: ['layout'],
    });
    if (!template) {
      throw new NotFoundException(`Template ${dto.template_id} not found`);
    }

    const subject = dto.subject ?? template.name;

    const emailSend = await this.sendRepo.save(
      this.sendRepo.create({
        template_id: template.id,
        sent_by: userId,
        recipient_emails: dto.recipient_emails,
        subject,
        status: SendStatus.QUEUED,
      }),
    );

    await this.templateRepo
      .createQueryBuilder()
      .update(EmailTemplate)
      .set({ send_count: () => 'send_count + 1' })
      .where('id = :id', { id: template.id })
      .execute();

    await this.dispatchQueue.add(
      'dispatch',
      {
        sendId: emailSend.id,
        recipientEmails: dto.recipient_emails,
        subject,
        contentJson: template.content_json,
        layoutSlug: template.layout.slug,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );

    return { sendId: emailSend.id, status: SendStatus.QUEUED };
  }
}
