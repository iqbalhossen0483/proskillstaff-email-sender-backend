import { Layout } from '@/entities/layout.entity';
import { User } from '@/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('email_templates')
@Index(['name'])
@Index(['layout.id'])
@Index(['created_by.id'])
@Index(['deleted_at'])
export class EmailTemplate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string | null;

  @ManyToOne(() => Layout, { eager: true })
  @JoinColumn({ name: 'layout_id' })
  layout!: Layout;

  @Column({ type: 'jsonb' })
  content_json!: Record<string, unknown>;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  created_by!: User;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date | null;

  @Column({ type: 'int', default: 0 })
  send_count!: number;
}
