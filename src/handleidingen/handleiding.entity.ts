import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('handleidingen')
export class Handleiding {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'original_filename', type: 'varchar', length: 255 })
  originalFilename!: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 80 })
  mimeType!: string;

  @Column({ type: 'longblob', select: false })
  data!: Buffer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
