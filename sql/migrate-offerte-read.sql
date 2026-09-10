-- Migratie: gelezen-status op offertes.
-- In development doet TypeORM synchronize dit automatisch.
-- Daarna herstart de API zodat onModuleInit de view offerte_overzicht ververst.

ALTER TABLE offertes
  ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0 AFTER net_euro_saved_yearly;
