import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AircoImage } from './airco-image.entity';
import { decimalTransformer } from './decimal.transformer';

@Entity('aircos')
export class Airco {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 80 })
  brand!: string;

  @Column({ type: 'varchar', length: 80 })
  series!: string;

  /** Kort model, bijv. Wandmodel of MSZ-LN. */
  @Column({ type: 'varchar', length: 80 })
  model!: string;

  /** Spec-regel Type, bijv. Wandmodel (split). */
  @Column({ name: 'unit_type', type: 'varchar', length: 80 })
  unitType!: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  tag!: string;

  @Column({ type: 'text' })
  description!: string;

  /** Spec-regel Functie, bijv. Koelen en verwarmen. */
  @Column({ name: 'product_function', type: 'varchar', length: 80 })
  productFunction!: string;

  @Column({ name: 'trust_points', type: 'json' })
  trustPoints!: string[];

  @Column({
    name: 'cooling_kw',
    type: 'decimal',
    precision: 4,
    scale: 1,
    transformer: decimalTransformer,
  })
  coolingKw!: number;

  @Column({
    name: 'heating_kw',
    type: 'decimal',
    precision: 4,
    scale: 1,
    transformer: decimalTransformer,
  })
  heatingKw!: number;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    transformer: decimalTransformer,
  })
  seer!: number;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    transformer: decimalTransformer,
  })
  scop!: number;

  @Column({ name: 'energy_class_cooling', type: 'varchar', length: 8 })
  energyClassCooling!: string;

  @Column({ name: 'energy_class_heating', type: 'varchar', length: 8 })
  energyClassHeating!: string;

  @Column({ name: 'noise_silent_dba', type: 'int' })
  noiseSilentDba!: number;

  @Column({ type: 'varchar', length: 16, default: 'R32' })
  refrigerant!: string;

  @Column({ name: 'room_m2', type: 'varchar', length: 40 })
  roomM2!: string;

  @Column({
    name: 'heating_coverage',
    type: 'decimal',
    precision: 3,
    scale: 2,
    transformer: decimalTransformer,
  })
  heatingCoverage!: number;

  @Column({
    name: 'price_eur',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  priceEur!: number;

  @Column({ type: 'varchar', length: 16, default: '#005A9C' })
  accent!: string;

  @OneToMany(() => AircoImage, (image) => image.airco, { cascade: true })
  images!: AircoImage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
