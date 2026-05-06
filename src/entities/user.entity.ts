import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  @Exclude()
  password_hash!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ADMIN })
  role!: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date | null;

  @Column({ nullable: true, type: 'timestamp' })
  last_login_at!: Date | null;
}
