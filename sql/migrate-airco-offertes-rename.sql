-- Hernoem de airco-offertetabel.
-- Bestaande rijen blijven staan. Eenmalig draaien op een database
-- waar de tabel nog offertes heet.
-- De view airco_offerte_overzicht maakt de API zelf bij de volgende start.
-- Maak die view hier niet alvast aan: TypeORM synchronize maakt hem anders dubbel.

RENAME TABLE offertes TO airco_offertes;

DROP VIEW IF EXISTS offerte_overzicht;
DROP VIEW IF EXISTS airco_offerte_overzicht;
