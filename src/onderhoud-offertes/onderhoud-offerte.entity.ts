import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Klant } from '../klanten/klant.entity';
import { OnderhoudOfferteImage } from './onderhoud-offerte-image.entity';
import { OnderhoudOfferteTypeLink } from './onderhoud-offerte-type-link.entity';

@Entity('onderhoud_offertes')
export class OnderhoudOfferte {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Index()
  @Column({ name: 'klant_id', type: 'char', length: 36, nullable: true })
  klantId!: string | null;

  @ManyToOne(() => Klant, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'klant_id' })
  klant?: Klant | null;

  @OneToMany(() => OnderhoudOfferteTypeLink, (link) => link.offerte)
  typeLinks!: OnderhoudOfferteTypeLink[];

  @OneToMany(() => OnderhoudOfferteImage, (image) => image.offerte)
  images!: OnderhoudOfferteImage[];

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
