import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('onderhoud_types')
export class OnderhoudType {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  name!: string;

  @Column({ name: 'sort_order', type: 'int' })
  sortOrder!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
