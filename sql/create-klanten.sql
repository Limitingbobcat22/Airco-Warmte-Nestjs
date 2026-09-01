-- Tabel: klanten
-- NAW-gegevens. Offerteaanvragen (gekozen airco) staan in offertes.

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
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY IDX_klanten_email (email),
  KEY IDX_klanten_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
