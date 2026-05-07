import { EmailTemplate } from '@/entities/email-template.entity';
import { User } from '@/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum SendStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('email_sends')
@Index(['template.id'])
@Index(['sent_by.id'])
@Index(['sent_at'])
export class EmailSend {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => EmailTemplate)
  @JoinColumn({ name: 'template_id' })
  template!: EmailTemplate;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sent_by' })
  sent_by!: User;

  @Column({ type: 'text', array: true })
  recipient_emails!: string[];

  @Column()
  subject!: string;

  @Column({ type: 'enum', enum: SendStatus, default: SendStatus.QUEUED })
  status!: SendStatus;

  @Column({ nullable: true, type: 'timestamp' })
  sent_at!: Date | null;

  @Column({ nullable: true, type: 'text' })
  error_message!: string | null;
}
