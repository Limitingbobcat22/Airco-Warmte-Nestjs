-- Hernoem tabellen van onderhouds_* naar onderhoud_*.
-- Alleen nodig als de database nog de oude namen heeft.

RENAME TABLE
  onderhouds_types TO onderhoud_types,
  onderhouds_offertes TO onderhoud_offertes,
  onderhouds_offerte_types TO onderhoud_offerte_types,
  onderhouds_offerte_fotos TO onderhoud_offerte_fotos;
