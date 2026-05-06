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
import { Layout } from '@/entities/layout.entity';
import { User } from '@/entities/user.entity';

@Entity('email_templates')
@Index(['name'])
@Index(['layout_id'])
@Index(['created_by'])
@Index(['deleted_at'])
export class EmailTemplate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string | null;

  @Column()
  layout_id!: number;

  @ManyToOne(() => Layout, { eager: true })
  @JoinColumn({ name: 'layout_id' })
  layout!: Layout;

  @Column({ type: 'jsonb' })
  content_json!: Record<string, unknown>;

  @Column({ nullable: true, type: 'int' })
  created_by!: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'created_by' })
  creator!: User | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date | null;

  @Column({ type: 'int', default: 0 })
  send_count!: number;
}
