import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Airco } from '../aircos/airco.entity';
import { decimalTransformer } from '../aircos/decimal.transformer';

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

  @Column({ name: 'airco_id', type: 'char', length: 36, nullable: true })
  aircoId!: string | null;

  @ManyToOne(() => Airco, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'airco_id' })
  airco?: Airco | null;

  /** Snapshot van het gekozen model, blijft staan als de airco later verdwijnt. */
  @Column({ name: 'airco_label', type: 'varchar', length: 160, nullable: true })
  aircoLabel!: string | null;

  @Column({
    name: 'cooling_kw',
    type: 'decimal',
    precision: 4,
    scale: 1,
    nullable: true,
    transformer: decimalTransformer,
  })
  coolingKw!: number | null;

  @Column({
    name: 'heating_kw',
    type: 'decimal',
    precision: 4,
    scale: 1,
    nullable: true,
    transformer: decimalTransformer,
  })
  heatingKw!: number | null;

  @Column({
    name: 'net_euro_saved_yearly',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  netEuroSavedYearly!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
