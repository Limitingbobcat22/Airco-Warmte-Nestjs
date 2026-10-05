-- Haalt de gekopieerde klantgegevens van onderhoud_offertes af.
-- Bestaande offertes zonder klant_id krijgen eerst een klant (zelfde e-mail = één klant).
-- Daarna komt de view onderhoud_offerte_overview voor de beheertabel.
-- Draai dit eenmalig op de server. De kolom klant_id moet al bestaan.

DROP PROCEDURE IF EXISTS migrate_onderhoud_offerte_overview;

DELIMITER $$

CREATE PROCEDURE migrate_onderhoud_offerte_overview()
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'onderhoud_offertes'
      AND COLUMN_NAME = 'first_name'
  ) THEN
    INSERT INTO klanten (
      id,
      first_name,
      last_name,
      email,
      phone,
      street,
      house_number,
      postal_code,
      city,
      note,
      consent_contact,
      consent_terms
    )
    SELECT
      UUID(),
      o.first_name,
      o.last_name,
      o.email,
      o.phone,
      o.street,
      o.house_number,
      o.postal_code,
      o.city,
      o.note,
      o.consent_contact,
      o.consent_terms
    FROM onderhoud_offertes o
    INNER JOIN (
      SELECT MIN(id) AS id
      FROM onderhoud_offertes
      WHERE klant_id IS NULL
      GROUP BY LOWER(email)
    ) eerste ON eerste.id = o.id
    WHERE NOT EXISTS (
      SELECT 1 FROM klanten k WHERE LOWER(k.email) = LOWER(o.email)
    );

    UPDATE onderhoud_offertes o
    INNER JOIN klanten k ON LOWER(k.email) = LOWER(o.email)
    SET o.klant_id = k.id
    WHERE o.klant_id IS NULL;

    ALTER TABLE onderhoud_offertes
      DROP COLUMN first_name,
      DROP COLUMN last_name,
      DROP COLUMN email,
      DROP COLUMN phone,
      DROP COLUMN street,
      DROP COLUMN house_number,
      DROP COLUMN postal_code,
      DROP COLUMN city,
      DROP COLUMN note,
      DROP COLUMN consent_contact,
      DROP COLUMN consent_terms;
  END IF;
END$$

DELIMITER ;

CALL migrate_onderhoud_offerte_overview();

DROP PROCEDURE IF EXISTS migrate_onderhoud_offerte_overview;

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
  o.created_at AS created_at,
  o.updated_at AS updated_at
FROM onderhoud_offertes o
LEFT JOIN klanten k ON k.id = o.klant_id;
