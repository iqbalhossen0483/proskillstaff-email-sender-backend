import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum LayoutSlug {
  LAYOUT_A = 'layout_a',
  LAYOUT_B = 'layout_b',
}

@Entity('layouts')
export class Layout {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  slug!: string;

  @Column()
  name!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string | null;
}
