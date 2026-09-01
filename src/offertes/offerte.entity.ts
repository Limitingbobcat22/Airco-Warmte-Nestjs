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
import { Klant } from '../klanten/klant.entity';

@Entity('offertes')
export class Offerte {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Index()
  @Column({ name: 'klant_id', type: 'char', length: 36, nullable: true })
  klantId!: string | null;

  @ManyToOne(() => Klant, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'klant_id' })
  klant?: Klant | null;

  @Index()
  @Column({ name: 'airco_id', type: 'char', length: 36, nullable: true })
  aircoId!: string | null;

  @ManyToOne(() => Airco, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'airco_id' })
  airco?: Airco | null;

  @Column({
    name: 'area_m2',
    type: 'decimal',
    precision: 6,
    scale: 1,
    nullable: true,
    transformer: decimalTransformer,
  })
  areaM2!: number | null;

  @Column({
    name: 'height_m',
    type: 'decimal',
    precision: 3,
    scale: 1,
    nullable: true,
    transformer: decimalTransformer,
  })
  heightM!: number | null;

  @Column({
    name: 'heating_share_pct',
    type: 'decimal',
    precision: 5,
    scale: 1,
    nullable: true,
    transformer: decimalTransformer,
  })
  heatingSharePct!: number | null;

  @Column({
    name: 'required_kw',
    type: 'decimal',
    precision: 4,
    scale: 1,
    nullable: true,
    transformer: decimalTransformer,
  })
  requiredKw!: number | null;

  @Column({
    name: 'yearly_gas_m3',
    type: 'decimal',
    precision: 8,
    scale: 1,
    nullable: true,
    transformer: decimalTransformer,
  })
  yearlyGasM3!: number | null;

  @Column({
    name: 'gas_price_eur',
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  gasPriceEur!: number | null;

  @Column({
    name: 'elec_price_eur',
    type: 'decimal',
    precision: 6,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  elecPriceEur!: number | null;

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
