-- Migratie: beschrijving met handelingen op onderhoud_types.
-- In development voegt TypeORM synchronize de kolom ook toe bij herstart.

ALTER TABLE onderhoud_types
  ADD COLUMN description TEXT NULL AFTER sort_order;
