import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { OnderhoudType } from '../onderhoud-types/onderhoud-type.entity';
import { OnderhoudOfferte } from './onderhoud-offerte.entity';

@Entity('onderhoud_offerte_types')
export class OnderhoudOfferteTypeLink {
  @PrimaryColumn({ name: 'offerte_id', type: 'char', length: 36 })
  offerteId!: string;

  @PrimaryColumn({ name: 'type_id', type: 'char', length: 36 })
  typeId!: string;

  @ManyToOne(() => OnderhoudOfferte, (offerte) => offerte.typeLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'offerte_id' })
  offerte!: OnderhoudOfferte;

  @ManyToOne(() => OnderhoudType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'type_id' })
  type!: OnderhoudType;
}
