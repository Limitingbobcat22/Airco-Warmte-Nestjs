-- Onderhoudoffertes verwijzen naar een klant.
-- Gekozen types staan in onderhoud_offerte_types, zodat één offerte meerdere types kan hebben.
-- Afbeeldingen staan in onderhoud_offerte_images (maximaal 3).
-- Het beheeroverzicht leest de view onderhoud_offerte_overview.

CREATE TABLE IF NOT EXISTS onderhoud_offertes (
  id CHAR(36) NOT NULL,
  klant_id CHAR(36) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY IDX_onderhoud_offertes_klant_id (klant_id),
  KEY IDX_onderhoud_offertes_created_at (created_at),
  CONSTRAINT FK_onderhoud_offertes_klant
    FOREIGN KEY (klant_id) REFERENCES klanten (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS onderhoud_offerte_types (
  offerte_id CHAR(36) NOT NULL,
  type_id CHAR(36) NOT NULL,
  PRIMARY KEY (offerte_id, type_id),
  CONSTRAINT FK_onderhoud_offerte_types_offerte
    FOREIGN KEY (offerte_id) REFERENCES onderhoud_offertes (id) ON DELETE CASCADE,
  CONSTRAINT FK_onderhoud_offerte_types_type
    FOREIGN KEY (type_id) REFERENCES onderhoud_types (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS onderhoud_offerte_images (
  id CHAR(36) NOT NULL,
  offerte_id CHAR(36) NOT NULL,
  sort_order TINYINT NOT NULL,
  mime_type VARCHAR(80) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  data LONGBLOB NOT NULL,
  PRIMARY KEY (id),
  KEY IDX_onderhoud_offerte_images_offerte (offerte_id),
  CONSTRAINT FK_onderhoud_offerte_images_offerte
    FOREIGN KEY (offerte_id) REFERENCES onderhoud_offertes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE OR REPLACE VIEW onderhoud_offerte_overview AS
SELECT
  o.id AS id,
  o.klant_id AS klant_id,
  CASE
    WHEN k.id IS NULL THEN NULL
    ELSE TRIM(CONCAT(k.first_name, ' ', k.last_name))
  END AS name,
  k.email AS email,
  k.phone AS phone,
  k.city AS city,
  (
    SELECT GROUP_CONCAT(t.name ORDER BY t.sort_order ASC, t.name ASC SEPARATOR ', ')
    FROM onderhoud_offerte_types ot
    INNER JOIN onderhoud_types t ON t.id = ot.type_id
    WHERE ot.offerte_id = o.id
  ) AS type_names,
  (
    SELECT COUNT(*)
    FROM onderhoud_offerte_images i
    WHERE i.offerte_id = o.id
  ) AS image_count,
  o.is_read AS is_read,
  o.created_at AS created_at,
  o.updated_at AS updated_at
FROM onderhoud_offertes o
LEFT JOIN klanten k ON k.id = o.klant_id;
