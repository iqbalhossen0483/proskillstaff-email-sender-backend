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
@Index(['template_id'])
@Index(['sent_by'])
@Index(['sent_at'])
export class EmailSend {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true, type: 'int' })
  template_id!: number | null;

  @ManyToOne(() => EmailTemplate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'template_id' })
  template!: EmailTemplate | null;

  @Column({ nullable: true, type: 'int' })
  sent_by!: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sent_by' })
  sender!: User | null;

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
