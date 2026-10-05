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
import { OnderhoudOfferteFoto } from './onderhoud-offerte-foto.entity';
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

  @Column({ name: 'first_name', type: 'varchar', length: 80 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 80 })
  lastName!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 30 })
  phone!: string;

  @Column({ type: 'varchar', length: 120 })
  street!: string;

  @Column({ name: 'house_number', type: 'varchar', length: 16 })
  houseNumber!: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 10 })
  postalCode!: string;

  @Column({ type: 'varchar', length: 80 })
  city!: string;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ name: 'consent_contact', type: 'tinyint', width: 1 })
  consentContact!: boolean;

  @Column({ name: 'consent_terms', type: 'tinyint', width: 1 })
  consentTerms!: boolean;

  @OneToMany(() => OnderhoudOfferteTypeLink, (link) => link.offerte)
  typeLinks!: OnderhoudOfferteTypeLink[];

  @OneToMany(() => OnderhoudOfferteFoto, (foto) => foto.offerte)
  fotos!: OnderhoudOfferteFoto[];

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
