-- Koppelt een onderhoudofferte aan een klant. Gegevens blijven bij de klant horen.
ALTER TABLE onderhoud_offertes
  ADD COLUMN klant_id CHAR(36) NULL AFTER id,
  ADD KEY IDX_onderhoud_offertes_klant_id (klant_id),
  ADD CONSTRAINT FK_onderhoud_offertes_klant
    FOREIGN KEY (klant_id) REFERENCES klanten (id) ON DELETE SET NULL;
