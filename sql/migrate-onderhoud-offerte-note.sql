-- Extra toelichting op de onderhoudofferte, los van klanten.note.
-- In development voegt de API deze kolom ook toe bij het starten.

ALTER TABLE onderhoud_offertes
  ADD COLUMN note TEXT NULL AFTER is_read;
