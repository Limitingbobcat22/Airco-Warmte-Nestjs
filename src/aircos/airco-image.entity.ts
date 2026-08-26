import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { Airco } from './airco.entity';

@Entity('airco_images')
@Unique(['aircoId', 'sortOrder'])
export class AircoImage {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'airco_id', type: 'char', length: 36 })
  aircoId!: string;

  @ManyToOne(() => Airco, (airco) => airco.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'airco_id' })
  airco!: Airco;

  /** 0, 1 of 2 — max 3 foto's per airco. */
  @Column({ name: 'sort_order', type: 'tinyint' })
  sortOrder!: number;

  @Column({ type: 'varchar', length: 80 })
  label!: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 80 })
  mimeType!: string;

  @Column({ name: 'original_filename', type: 'varchar', length: 255 })
  originalFilename!: string;

  @Column({ type: 'longblob', select: false })
  data!: Buffer;
}
