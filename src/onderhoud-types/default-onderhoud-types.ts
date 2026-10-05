export type DefaultOnderhoudType = {
  id: string;
  name: string;
  sortOrder: number;
  description: string;
};

export const DEFAULT_ONDERHOUD_TYPES: DefaultOnderhoudType[] = [
  {
    id: '11111111-1111-4111-8111-000000000001',
    name: 'Ketels',
    sortOrder: 1,
    description: [
      'Controle van de ketel, rookgasafvoer en leidingen',
      'Meten van de gasdruk en het verbrandingsrendement',
      'Reinigen van de brander en de warmtewisselaar',
      'Controleren van ontsteking, sensoren en beveiligingen',
      'Controleren en zo nodig bijvullen van de waterdruk',
    ].join('\n'),
  },
  {
    id: '11111111-1111-4111-8111-000000000002',
    name: 'Mechanische Ventilatie',
    sortOrder: 2,
    description: [
      'Controleren van de ventilatiebox en de kanalen',
      'Reinigen van de ventilatiebox en de ventielen',
      'Meten van de luchthoeveelheid',
      'Controleren van de bediening en het geluidsniveau',
    ].join('\n'),
  },
  {
    id: '11111111-1111-4111-8111-000000000003',
    name: 'Warmte terugwin ventilatie (Met filter)',
    sortOrder: 3,
    description: [
      'Vervangen of reinigen van de filters',
      'Controleren en reinigen van de warmtewisselaar',
      'Controleren van de condensafvoer',
      'Meten van de toevoer- en afvoerlucht',
      'Controleren van de bypass en de vorstbeveiliging',
    ].join('\n'),
  },
  {
    id: '11111111-1111-4111-8111-000000000004',
    name: 'Aircos',
    sortOrder: 4,
    description: [
      'Reinigen van de filters van de binnenunit',
      'Controleren en reinigen van de buitenunit',
      'Meten van de temperatuur en de werking van het systeem',
      'Controleren van de condensafvoer',
      'Nakijken van de bediening en de instellingen',
    ].join('\n'),
  },
];
