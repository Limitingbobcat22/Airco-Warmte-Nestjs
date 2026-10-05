-- Alleen nodig als de klantkolommen nog op onderhoud_offertes staan.
-- sql/migrate-onderhoud-offerte-overview.sql doet deze backfill en haalt die kolommen daarna weg.
-- Bestaande onderhoudoffertes zonder klant_id krijgen een rij in klanten.
-- Zelfde e-mailadres wordt één klant. Draai dit op de server na de deploy.
-- De kolom klant_id moet al bestaan (sql/migrate-onderhoud-offerte-klant.sql).

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
