-- Tabel: onderhoud_types
-- Vaste catalogus van onderhoudtypes die de klant kan kiezen.

CREATE TABLE IF NOT EXISTS onderhoud_types (
  id CHAR(36) NOT NULL,
  name VARCHAR(120) NOT NULL,
  sort_order INT NOT NULL,
  description TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY UQ_onderhoud_types_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO onderhoud_types (id, name, sort_order, description)
VALUES
  (
    '11111111-1111-4111-8111-000000000001',
    'Ketels',
    1,
    'Controle van de ketel, rookgasafvoer en leidingen\nMeten van de gasdruk en het verbrandingsrendement\nReinigen van de brander en de warmtewisselaar\nControleren van ontsteking, sensoren en beveiligingen\nControleren en zo nodig bijvullen van de waterdruk'
  ),
  (
    '11111111-1111-4111-8111-000000000002',
    'Mechanische Ventilatie',
    2,
    'Controleren van de ventilatiebox en de kanalen\nReinigen van de ventilatiebox en de ventielen\nMeten van de luchthoeveelheid\nControleren van de bediening en het geluidsniveau'
  ),
  (
    '11111111-1111-4111-8111-000000000003',
    'Warmte terugwin ventilatie (Met filter)',
    3,
    'Vervangen of reinigen van de filters\nControleren en reinigen van de warmtewisselaar\nControleren van de condensafvoer\nMeten van de toevoer- en afvoerlucht\nControleren van de bypass en de vorstbeveiliging'
  ),
  (
    '11111111-1111-4111-8111-000000000004',
    'Aircos',
    4,
    'Reinigen van de filters van de binnenunit\nControleren en reinigen van de buitenunit\nMeten van de temperatuur en de werking van het systeem\nControleren van de condensafvoer\nNakijken van de bediening en de instellingen'
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sort_order = VALUES(sort_order),
  description = IF(description IS NULL OR description = '', VALUES(description), description);
