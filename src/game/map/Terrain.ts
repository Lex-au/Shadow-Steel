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
    name: 'Desert Sand',
    color: '#d4b37c', // More saturated sand color
    movementCost: 1,
    buildable: true, // Flat desert sand is perfect for building
    defensiveBonus: 1,
    visibilityBonus: 0,
    resourceModifier: 1,
    description: 'Flat desert sand, suitable for building and movement'
  },
  ROUGH: {
    id: 1,
    name: 'Rocky Sand',
    color: '#c4a375', // Lighter rocky terrain for better visibility
    movementCost: 1.5,
    buildable: false, // Too rocky for stable foundations
    defensiveBonus: 1.2,
    visibilityBonus: 0.5,
    resourceModifier: 1.2,
    description: 'Rocky desert terrain, unsuitable for building'
  },
  HILLS: {
    id: 2,
    name: 'Dunes',
    color: '#b38f5d', // Darker dunes for contrast with buildable areas
    movementCost: 2,
    buildable: false,
    defensiveBonus: 1.5,
    visibilityBonus: 2,
    resourceModifier: 0.8,
    description: 'Sand dunes, provides visibility bonus'
  },
  WATER: {
    id: 3,
    name: 'Quicksand',
    color: '#8b7355', // Darker quicksand
    movementCost: Infinity,
    buildable: false,
    defensiveBonus: 0,
    visibilityBonus: 0,
    resourceModifier: 0,
    description: 'Dangerous quicksand, impassable terrain'
  },
  FOREST: {
    id: 4,
    name: 'Oasis',
    color: '#5a8f60', // More vibrant oasis
    movementCost: 1.5,
    buildable: false,
    defensiveBonus: 2,
    visibilityBonus: -1,
    resourceModifier: 1.5,
    description: 'Rare oasis with palm trees, provides cover'
  },
  MOUNTAINS: {
    id: 5,
    name: 'Mesa',
    color: '#96573d', // Reddish mesa color
    movementCost: Infinity,
    buildable: false,
    defensiveBonus: 2,
    visibilityBonus: 3,
    resourceModifier: 0.5,
    description: 'Impassable mesa formations'
  }
}