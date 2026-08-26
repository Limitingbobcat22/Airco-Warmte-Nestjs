-- Migratie: capaciteiten-tabel weg, min/max koelvermogen op aircos.
-- Draai dit handmatig als TypeORM synchronize de oude kolommen niet netjes opruimt.

-- 1) Nieuwe kolommen
ALTER TABLE aircos
  ADD COLUMN cooling_kw_min DECIMAL(4,1) NOT NULL DEFAULT 0 AFTER trust_points,
  ADD COLUMN cooling_kw_max DECIMAL(4,1) NOT NULL DEFAULT 0 AFTER cooling_kw_min;

-- 2) Bestaande data overnemen (indien cooling_kw / size_code nog bestaan)
UPDATE aircos
SET
  cooling_kw_max = COALESCE(cooling_kw, cooling_kw_max),
  cooling_kw_min = COALESCE(cooling_kw, cooling_kw_min);

-- Optioneel: min uit de oude capaciteiten-tabel als die nog data heeft
UPDATE aircos a
JOIN (
  SELECT airco_id, MIN(cooling_kw) AS min_kw, MAX(cooling_kw) AS max_kw
  FROM airco_capacities
  GROUP BY airco_id
) c ON c.airco_id = a.id
SET
  a.cooling_kw_min = c.min_kw,
  a.cooling_kw_max = c.max_kw;

-- 3) Oude kolommen weg
ALTER TABLE aircos
  DROP COLUMN size_code,
  DROP COLUMN cooling_kw;

-- 4) Capaciteiten-tabel weg
DROP TABLE IF EXISTS airco_capacities;
