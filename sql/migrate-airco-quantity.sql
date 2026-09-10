-- Migratie: voorraad (quantity) op aircos.
-- In development doet TypeORM synchronize dit automatisch.

ALTER TABLE aircos
  ADD COLUMN quantity INT NOT NULL DEFAULT 0 AFTER price_eur;
