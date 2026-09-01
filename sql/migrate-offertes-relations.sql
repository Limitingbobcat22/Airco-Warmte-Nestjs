-- Offertes: snapshot-kolommen weg; klant- en aircodata via klant_id / airco_id.
-- In development doet TypeORM synchronize dit automatisch.

ALTER TABLE offertes
  DROP COLUMN first_name,
  DROP COLUMN last_name,
  DROP COLUMN email,
  DROP COLUMN phone,
  DROP COLUMN street,
  DROP COLUMN house_number,
  DROP COLUMN postal_code,
  DROP COLUMN city,
  DROP COLUMN note,
  DROP COLUMN airco_brand,
  DROP COLUMN airco_model,
  DROP COLUMN airco_label,
  DROP COLUMN cooling_kw,
  DROP COLUMN heating_kw,
  DROP COLUMN price_eur;
