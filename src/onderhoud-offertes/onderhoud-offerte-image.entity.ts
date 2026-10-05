import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { OnderhoudOfferte } from './onderhoud-offerte.entity';

@Entity('onderhoud_offerte_images')
export class OnderhoudOfferteImage {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ name: 'offerte_id', type: 'char', length: 36 })
  offerteId!: string;

  @ManyToOne(() => OnderhoudOfferte, (offerte) => offerte.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'offerte_id' })
  offerte!: OnderhoudOfferte;

  @Column({ name: 'sort_order', type: 'tinyint' })
  sortOrder!: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 80 })
  mimeType!: string;

  @Column({ name: 'original_filename', type: 'varchar', length: 255 })
  originalFilename!: string;

  @Column({ type: 'longblob', select: false })
  data!: Buffer;
}
