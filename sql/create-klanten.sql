-- Tabel: klanten
-- Offerteaanvragen / NAW-gegevens vanuit de popup.
-- Draai dit handmatig als TypeORM synchronize de tabel niet aanmaakt.

CREATE TABLE IF NOT EXISTS klanten (
  id CHAR(36) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  street VARCHAR(120) NOT NULL,
  house_number VARCHAR(16) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  city VARCHAR(80) NOT NULL,
  note TEXT NULL,
  consent_contact TINYINT(1) NOT NULL,
  airco_id CHAR(36) NULL,
  airco_label VARCHAR(160) NULL,
  cooling_kw DECIMAL(4,1) NULL,
  heating_kw DECIMAL(4,1) NULL,
  net_euro_saved_yearly DECIMAL(10,2) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY IDX_klanten_email (email),
  KEY IDX_klanten_created_at (created_at),
  CONSTRAINT FK_klanten_airco
    FOREIGN KEY (airco_id) REFERENCES aircos (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
