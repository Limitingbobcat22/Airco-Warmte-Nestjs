-- Migratie: acceptatie van de algemene voorwaarden op klanten.
-- Bestaande klanten krijgen 0 (niet geaccepteerd).
-- In development voegt TypeORM synchronize de kolom ook toe bij herstart.
-- Herstart daarna de API zodat onModuleInit de view offerte_overzicht ververst.

ALTER TABLE klanten
  ADD COLUMN consent_terms TINYINT(1) NOT NULL DEFAULT 0 AFTER consent_contact;
