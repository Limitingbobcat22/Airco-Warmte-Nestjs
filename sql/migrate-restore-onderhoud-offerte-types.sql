-- Zet meerdere onderhoudtypes per offerte terug via onderhoud_offerte_types.
-- Bestaat onderhoud_type_id nog, dan wordt die ene waarde eerst overgezet.
-- Draai dit op de server als migrate-onderhoud-offerte-type-image.sql al is gedraaid.

CREATE TABLE IF NOT EXISTS onderhoud_offerte_types (
  offerte_id CHAR(36) NOT NULL,
  type_id CHAR(36) NOT NULL,
  PRIMARY KEY (offerte_id, type_id),
  CONSTRAINT FK_onderhoud_offerte_types_offerte
    FOREIGN KEY (offerte_id) REFERENCES onderhoud_offertes (id) ON DELETE CASCADE,
  CONSTRAINT FK_onderhoud_offerte_types_type
    FOREIGN KEY (type_id) REFERENCES onderhoud_types (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP PROCEDURE IF EXISTS restore_onderhoud_offerte_types;

DELIMITER $$

CREATE PROCEDURE restore_onderhoud_offerte_types()
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'onderhoud_offertes'
      AND COLUMN_NAME = 'onderhoud_type_id'
  ) THEN
    INSERT IGNORE INTO onderhoud_offerte_types (offerte_id, type_id)
    SELECT id, onderhoud_type_id
    FROM onderhoud_offertes
    WHERE onderhoud_type_id IS NOT NULL;

    DROP VIEW IF EXISTS onderhoud_offerte_overview;

    BEGIN
      DECLARE done INT DEFAULT 0;
      DECLARE fk_name VARCHAR(64);
      DECLARE fk_cursor CURSOR FOR
        SELECT CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'onderhoud_offertes'
          AND COLUMN_NAME = 'onderhoud_type_id'
          AND REFERENCED_TABLE_NAME IS NOT NULL;
      DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

      OPEN fk_cursor;
      drop_fk: LOOP
        FETCH fk_cursor INTO fk_name;
        IF done = 1 THEN
          LEAVE drop_fk;
        END IF;
        SET @drop_fk = CONCAT(
          'ALTER TABLE onderhoud_offertes DROP FOREIGN KEY `',
          fk_name,
          '`'
        );
        PREPARE drop_stmt FROM @drop_fk;
        EXECUTE drop_stmt;
        DEALLOCATE PREPARE drop_stmt;
      END LOOP;
      CLOSE fk_cursor;
    END;

    ALTER TABLE onderhoud_offertes DROP COLUMN onderhoud_type_id;
  END IF;
END$$

DELIMITER ;

CALL restore_onderhoud_offerte_types();

DROP PROCEDURE IF EXISTS restore_onderhoud_offerte_types;

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
