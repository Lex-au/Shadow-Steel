export interface BuildingDefinition {
  name: string;
  cost: number;
  description: string;
  powerUsage: number;
  buildTime: number;
  requirements?: string[];
}

export interface FactionBuildings {
  [key: string]: BuildingDefinition[];
}

export const RAVEN_BUILDINGS: BuildingDefinition[] = [
  {
    name: 'Power Plant',
    cost: 300,
    description: 'Generates power for your base',
    powerUsage: -50, // Negative means it generates power
    buildTime: 15
  },
  {
    name: 'Barracks',
    cost: 400,
    description: 'Trains infantry units',
    powerUsage: 20,
    buildTime: 20,
    requirements: ['Power Plant']
  },
  {
    name: 'Refinery',
    cost: 2000,
    description: 'High-tech resource processing center',
    powerUsage: 35,
    buildTime: 55,
    requirements: ['Power Plant']
  },
  {
    name: 'Factory',
    cost: 2000,
    description: 'Produces vehicles',
    powerUsage: 30,
    buildTime: 60,
    requirements: ['Refinery']
  },
  {
    name: 'Radar',
    cost: 1500,
    description: 'Advanced scanning facility with long-range detection',
    powerUsage: 25,
    buildTime: 40,
    requirements: ['Refinery']
  },
  {
    name: 'Turret',
    cost: 600,
    description: 'Basic defensive structure',
    powerUsage: 15,
    buildTime: 15,
    requirements: ['Radar']
  },
  {
    name: 'Lab',
    cost: 2500,
    description: 'Advanced research facility with experimental tech',
    powerUsage: 40,
    buildTime: 70,
    requirements: ['Radar']
  },
  {
    name: 'Silo',
    cost: 150,
    description: 'Fortified storage bunker for resources',
    powerUsage: 10,
    buildTime: 10,
    requirements: ['Power Plant']
  }
];