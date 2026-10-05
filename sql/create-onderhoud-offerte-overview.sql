-- View voor de beheertabel van onderhoudoffertes.
-- Veilig opnieuw te draaien. Tabellen onderhoud_offertes, onderhoud_offerte_types,
-- onderhoud_offerte_images en klanten moeten al bestaan.
-- De API maakt deze view ook aan bij het starten.

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
