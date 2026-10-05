-- Migratie: gelezen-status op onderhoud_offertes.
-- In development doet TypeORM synchronize dit automatisch.
-- Daarna herstart de API zodat onModuleInit de view onderhoud_offerte_overview ververst.

ALTER TABLE onderhoud_offertes
  ADD COLUMN is_read TINYINT(1) NOT NULL DEFAULT 0 AFTER klant_id;
