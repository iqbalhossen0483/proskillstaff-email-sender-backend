import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@/entities/user.entity';

@Entity('password_resets')
export class PasswordReset {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  token_hash!: string;

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @Column({ nullable: true, type: 'timestamp' })
  used_at!: Date | null;
}
