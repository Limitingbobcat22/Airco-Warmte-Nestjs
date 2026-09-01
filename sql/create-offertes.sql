-- Offertes: koppeling naar klant + airco, plus berekend jaarvoordeel.
-- Klant- en aircogegevens komen uit de gerelateerde tabellen via klant_id / airco_id.

CREATE TABLE IF NOT EXISTS offertes (
  id CHAR(36) NOT NULL,
  klant_id CHAR(36) NULL,
  airco_id CHAR(36) NULL,
  area_m2 DECIMAL(6,1) NULL,
  height_m DECIMAL(3,1) NULL,
  heating_share_pct DECIMAL(5,1) NULL,
  required_kw DECIMAL(4,1) NULL,
  yearly_gas_m3 DECIMAL(8,1) NULL,
  gas_price_eur DECIMAL(6,2) NULL,
  elec_price_eur DECIMAL(6,2) NULL,
  net_euro_saved_yearly DECIMAL(10,2) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY IDX_offertes_klant_id (klant_id),
  KEY IDX_offertes_airco_id (airco_id),
  KEY IDX_offertes_created_at (created_at),
  CONSTRAINT FK_offertes_klant
    FOREIGN KEY (klant_id) REFERENCES klanten (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT FK_offertes_airco
    FOREIGN KEY (airco_id) REFERENCES aircos (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lezen van offertes + klant + airco: zie create-offerte-overzicht-view.sql
