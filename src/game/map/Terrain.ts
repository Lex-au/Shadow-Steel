export interface TerrainType {
  id: number;
  name: string;
  color: string;
  movementCost: number;
  buildable: boolean;
  defensiveBonus: number;
  visibilityBonus: number;
  resourceModifier: number;
  description: string;
}

export const TERRAIN_TYPES: { [key: string]: TerrainType } = {
  PLAINS: {
    id: 0,
    name: 'Desert Plains',
    color: '#d4b37c',
    movementCost: 1,
    buildable: true,
    defensiveBonus: 1,
    visibilityBonus: 0,
    resourceModifier: 1,
    description: 'Primary buildable desert terrain'
  },
  HABITAL_1: {
    id: 1,
    name: 'Desert Habital Zone 1',
    color: '#c4a375',
    movementCost: 1,
    buildable: true,
    defensiveBonus: 1,
    visibilityBonus: 0.5,
    resourceModifier: 1,
    description: 'Secondary buildable desert terrain'
  },
  HABITAL_2: {
    id: 2,
    name: 'Desert Habital Zone 2',
    color: '#b39268',
    movementCost: 1,
    buildable: true,
    defensiveBonus: 1,
    visibilityBonus: 1,
    resourceModifier: 1,
    description: 'Tertiary buildable desert terrain'
  },
  ROCK: {
    id: 3,
    name: 'Rocky Terrain',
    color: '#96573d',
    movementCost: 2,
    buildable: false,
    defensiveBonus: 1.5,
    visibilityBonus: 1.5,
    resourceModifier: 0.5,
    description: 'Rough rocky terrain, unsuitable for construction'
  }
}