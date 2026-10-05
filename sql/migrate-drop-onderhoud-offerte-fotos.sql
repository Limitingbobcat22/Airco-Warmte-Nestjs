-- Verwijdert de vervangen tabel onderhoud_offerte_fotos.
-- Afbeeldingen staan in onderhoud_offerte_images.
-- Eenmalig draaien op de server na git pull.

DROP TABLE IF EXISTS onderhoud_offerte_fotos;
