export interface TerrainAsset {
  url: string;
  type: 'desert' | 'fauna';
  zone: 1 | 2 | 3;
}

export const TERRAIN_ASSETS: TerrainAsset[] = [
  // Desert Zone 1 - Main buildable area
  {
    url: 'https://lex-au.github.io/Shadow-Steel/Terrain%20Assets/Desert%20tiles%20zone%202/tile_5_13.png',
    type: 'desert',
    zone: 1
  },
  
  // Desert Zone 2 - Secondary terrain
  {
    url: 'https://lex-au.github.io/Shadow-Steel/Terrain%20Assets/Desert%20tiles%20zone%201/tile_0_18.png',
    type: 'desert',
    zone: 2
  },
  
  // Desert Zone 3 - Rough terrain
  {
    url: 'https://lex-au.github.io/Shadow-Steel/Terrain%20Assets/Rock%20Terrain/tile_7_5.png',
    type: 'desert',
    zone: 3
  },
  
  // Fauna overlay
  {
    url: 'https://lex-au.github.io/Shadow-Steel/Terrain%20Assets/Fauna/tile_21_10.png',
    type: 'fauna',
    zone: 1
  }
];