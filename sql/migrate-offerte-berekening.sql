-- Invoer van de frontend-berekening op offertes.
-- In development doet TypeORM synchronize dit automatisch.

ALTER TABLE offertes
  ADD COLUMN area_m2 DECIMAL(6,1) NULL AFTER airco_id,
  ADD COLUMN height_m DECIMAL(3,1) NULL AFTER area_m2,
  ADD COLUMN heating_share_pct DECIMAL(5,1) NULL AFTER height_m,
  ADD COLUMN required_kw DECIMAL(4,1) NULL AFTER heating_share_pct,
  ADD COLUMN yearly_gas_m3 DECIMAL(8,1) NULL AFTER required_kw,
  ADD COLUMN gas_price_eur DECIMAL(6,2) NULL AFTER yearly_gas_m3,
  ADD COLUMN elec_price_eur DECIMAL(6,2) NULL AFTER gas_price_eur;
