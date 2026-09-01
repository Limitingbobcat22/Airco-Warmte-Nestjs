import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { decimalTransformer } from '../aircos/decimal.transformer';
import { OFFERTE_OVERZICHT_SELECT_SQL } from './offerte-overzicht.sql';

@ViewEntity({
  name: 'offerte_overzicht',
  expression: OFFERTE_OVERZICHT_SELECT_SQL,
})
export class OfferteOverzicht {
  @ViewColumn()
  @PrimaryColumn()
  id!: string;

  @ViewColumn({ name: 'klant_id' })
  klantId!: string | null;

  @ViewColumn({ name: 'airco_id' })
  aircoId!: string | null;

  @ViewColumn({
    name: 'area_m2',
    transformer: decimalTransformer,
  })
  areaM2!: number | null;

  @ViewColumn({
    name: 'height_m',
    transformer: decimalTransformer,
  })
  heightM!: number | null;

  @ViewColumn({
    name: 'heating_share_pct',
    transformer: decimalTransformer,
  })
  heatingSharePct!: number | null;

  @ViewColumn({
    name: 'required_kw',
    transformer: decimalTransformer,
  })
  requiredKw!: number | null;

  @ViewColumn({
    name: 'yearly_gas_m3',
    transformer: decimalTransformer,
  })
  yearlyGasM3!: number | null;

  @ViewColumn({
    name: 'gas_price_eur',
    transformer: decimalTransformer,
  })
  gasPriceEur!: number | null;

  @ViewColumn({
    name: 'elec_price_eur',
    transformer: decimalTransformer,
  })
  elecPriceEur!: number | null;

  @ViewColumn({
    name: 'net_euro_saved_yearly',
    transformer: decimalTransformer,
  })
  netEuroSavedYearly!: number | null;

  @ViewColumn({ name: 'created_at' })
  createdAt!: Date;

  @ViewColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ViewColumn({ name: 'klant_first_name' })
  klantFirstName!: string | null;

  @ViewColumn({ name: 'klant_last_name' })
  klantLastName!: string | null;

  @ViewColumn({ name: 'klant_email' })
  klantEmail!: string | null;

  @ViewColumn({ name: 'klant_phone' })
  klantPhone!: string | null;

  @ViewColumn({ name: 'klant_street' })
  klantStreet!: string | null;

  @ViewColumn({ name: 'klant_house_number' })
  klantHouseNumber!: string | null;

  @ViewColumn({ name: 'klant_postal_code' })
  klantPostalCode!: string | null;

  @ViewColumn({ name: 'klant_city' })
  klantCity!: string | null;

  @ViewColumn({ name: 'klant_note' })
  klantNote!: string | null;

  @ViewColumn({ name: 'klant_consent_contact' })
  klantConsentContact!: boolean | number | null;

  @ViewColumn({ name: 'klant_created_at' })
  klantCreatedAt!: Date | null;

  @ViewColumn({ name: 'klant_updated_at' })
  klantUpdatedAt!: Date | null;

  @ViewColumn({ name: 'airco_brand' })
  aircoBrand!: string | null;

  @ViewColumn({ name: 'airco_model' })
  aircoModel!: string | null;

  @ViewColumn({ name: 'airco_unit_type' })
  aircoUnitType!: string | null;

  @ViewColumn({ name: 'airco_tag' })
  aircoTag!: string | null;

  @ViewColumn({ name: 'airco_description' })
  aircoDescription!: string | null;

  @ViewColumn({ name: 'airco_product_function' })
  aircoProductFunction!: string | null;

  @ViewColumn({ name: 'airco_trust_points' })
  aircoTrustPoints!: string[] | string | null;

  @ViewColumn({
    name: 'airco_cooling_kw',
    transformer: decimalTransformer,
  })
  aircoCoolingKw!: number | null;

  @ViewColumn({
    name: 'airco_heating_kw',
    transformer: decimalTransformer,
  })
  aircoHeatingKw!: number | null;

  @ViewColumn({
    name: 'airco_seer',
    transformer: decimalTransformer,
  })
  aircoSeer!: number | null;

  @ViewColumn({
    name: 'airco_scop',
    transformer: decimalTransformer,
  })
  aircoScop!: number | null;

  @ViewColumn({ name: 'airco_energy_class_cooling' })
  aircoEnergyClassCooling!: string | null;

  @ViewColumn({ name: 'airco_energy_class_heating' })
  aircoEnergyClassHeating!: string | null;

  @ViewColumn({ name: 'airco_noise_dba_inside' })
  aircoNoiseDbaInside!: number | null;

  @ViewColumn({ name: 'airco_noise_dba_outside' })
  aircoNoiseDbaOutside!: number | null;

  @ViewColumn({ name: 'airco_net_size_inside' })
  aircoNetSizeInside!: string | null;

  @ViewColumn({ name: 'airco_net_size_outside' })
  aircoNetSizeOutside!: string | null;

  @ViewColumn({ name: 'airco_refrigerant' })
  aircoRefrigerant!: string | null;

  @ViewColumn({ name: 'airco_room_m2' })
  aircoRoomM2!: string | null;

  @ViewColumn({
    name: 'airco_heating_coverage',
    transformer: decimalTransformer,
  })
  aircoHeatingCoverage!: number | null;

  @ViewColumn({
    name: 'airco_price_eur',
    transformer: decimalTransformer,
  })
  aircoPriceEur!: number | null;

  @ViewColumn({ name: 'airco_accent' })
  aircoAccent!: string | null;
}
