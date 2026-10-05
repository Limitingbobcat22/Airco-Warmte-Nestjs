-- Onderhoudoffertes: klantgegevens, gekozen types en foto's.
-- Foto's staan in onderhoud_offerte_fotos (maximaal 3, evenveel als gekozen types tot een maximum van 3).
-- Gekozen types staan in onderhoud_offerte_types.

CREATE TABLE IF NOT EXISTS onderhoud_offertes (
  id CHAR(36) NOT NULL,
  klant_id CHAR(36) NULL,
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
  consent_terms TINYINT(1) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY IDX_onderhoud_offertes_email (email),
  KEY IDX_onderhoud_offertes_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS onderhoud_offerte_types (
  offerte_id CHAR(36) NOT NULL,
  type_id CHAR(36) NOT NULL,
  PRIMARY KEY (offerte_id, type_id),
  CONSTRAINT FK_onderhoud_offerte_types_offerte
    FOREIGN KEY (offerte_id) REFERENCES onderhoud_offertes (id) ON DELETE CASCADE,
  CONSTRAINT FK_onderhoud_offerte_types_type
    FOREIGN KEY (type_id) REFERENCES onderhoud_types (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS onderhoud_offerte_fotos (
  id CHAR(36) NOT NULL,
  offerte_id CHAR(36) NOT NULL,
  sort_order TINYINT NOT NULL,
  mime_type VARCHAR(80) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  data LONGBLOB NOT NULL,
  PRIMARY KEY (id),
  KEY IDX_onderhoud_offerte_fotos_offerte (offerte_id),
  CONSTRAINT FK_onderhoud_offerte_fotos_offerte
    FOREIGN KEY (offerte_id) REFERENCES onderhoud_offertes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
