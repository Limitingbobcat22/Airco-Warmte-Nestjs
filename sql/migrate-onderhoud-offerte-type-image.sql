-- Niet meer draaien: een offerte moet meerdere types kunnen hebben.
-- Gebruik sql/migrate-restore-onderhoud-offerte-types.sql.
-- Oude inhoud hieronder zette één onderhoudtype op de offerte en hernoemt de fototabel naar images.
-- De koppeltabel onderhoud_offerte_types verdwijnt.
-- Bij meerdere types blijft het type met de laagste sorteervolgorde staan.
-- Draai dit eenmalig op de server, vóór of samen met de nieuwe API.

DROP VIEW IF EXISTS onderhoud_offerte_overview;

DROP PROCEDURE IF EXISTS migrate_onderhoud_offerte_type_image;

DELIMITER $$

CREATE PROCEDURE migrate_onderhoud_offerte_type_image()
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'onderhoud_offerte_fotos'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'onderhoud_offerte_images'
  ) THEN
    IF (SELECT COUNT(*) FROM onderhoud_offerte_images) = 0 THEN
      DROP TABLE onderhoud_offerte_images;
      RENAME TABLE onderhoud_offerte_fotos TO onderhoud_offerte_images;
    END IF;
  ELSEIF EXISTS (
    SELECT 1 FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'onderhoud_offerte_fotos'
  ) THEN
    RENAME TABLE onderhoud_offerte_fotos TO onderhoud_offerte_images;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'onderhoud_offertes'
      AND COLUMN_NAME = 'onderhoud_type_id'
  ) THEN
    ALTER TABLE onderhoud_offertes
      ADD COLUMN onderhoud_type_id CHAR(36) NULL AFTER klant_id,
      ADD KEY IDX_onderhoud_offertes_type_id (onderhoud_type_id),
      ADD CONSTRAINT FK_onderhoud_offertes_type
        FOREIGN KEY (onderhoud_type_id) REFERENCES onderhoud_types (id) ON DELETE RESTRICT;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'onderhoud_offerte_types'
  ) THEN
    UPDATE onderhoud_offertes o
    INNER JOIN (
      SELECT offerte_id, type_id
      FROM (
        SELECT
          ot.offerte_id,
          ot.type_id,
          ROW_NUMBER() OVER (
            PARTITION BY ot.offerte_id
            ORDER BY t.sort_order ASC, t.name ASC
          ) AS rn
        FROM onderhoud_offerte_types ot
        INNER JOIN onderhoud_types t ON t.id = ot.type_id
      ) ranked
      WHERE rn = 1
    ) picked ON picked.offerte_id = o.id
    SET o.onderhoud_type_id = picked.type_id
    WHERE o.onderhoud_type_id IS NULL;

    DROP TABLE onderhoud_offerte_types;
  END IF;
END$$

DELIMITER ;

CALL migrate_onderhoud_offerte_type_image();

DROP PROCEDURE IF EXISTS migrate_onderhoud_offerte_type_image;

CREATE OR REPLACE VIEW onderhoud_offerte_overview AS
SELECT
  o.id AS id,
  o.klant_id AS klant_id,
  o.onderhoud_type_id AS onderhoud_type_id,
  CASE
    WHEN k.id IS NULL THEN NULL
    ELSE TRIM(CONCAT(k.first_name, ' ', k.last_name))
  END AS name,
  k.email AS email,
  k.phone AS phone,
  k.city AS city,
  t.name AS type_name,
  (
    SELECT COUNT(*)
    FROM onderhoud_offerte_images i
    WHERE i.offerte_id = o.id
  ) AS image_count,
  o.created_at AS created_at,
  o.updated_at AS updated_at
FROM onderhoud_offertes o
LEFT JOIN klanten k ON k.id = o.klant_id
LEFT JOIN onderhoud_types t ON t.id = o.onderhoud_type_id;
