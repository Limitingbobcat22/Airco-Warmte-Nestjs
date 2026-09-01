import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('klanten')
export class Klant {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
