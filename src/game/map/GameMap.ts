import p5 from 'p5';
import { TERRAIN_TYPES, TerrainType } from './Terrain';
import { Vector } from '../utils/Vector';
import { GameState } from '../state/GameState';
import { TERRAIN_ASSETS, TerrainAsset } from '../config/terrain';

export class GameMap {
  private tileSize = 24; // Classic C&C tile size
  private mapWidth = 128;  // Classic C&C map size
  private mapHeight = 128; // Keep square map
  private terrainImages: { [key: string]: p5.Image } = {};
  private faunaImage: p5.Image | null = null;
  public readonly worldWidth: number;
  public readonly worldHeight: number;
  public tiles: number[][] = [];
  private imagesLoaded = 0;
  private totalImages = TERRAIN_ASSETS.filter(asset => asset.type === 'desert').length;
  private seed: number;
  private faunaOpacity: number[][] = [];
  private readonly NOISE_SCALE = 0.03;
  private faunaPositions: boolean[][] = [];
  private readonly OCTAVES = 4;
  private readonly PERSISTENCE = 0.6;
  private readonly LACUNARITY = 2.2;

  constructor(p: p5, private gameState: GameState) {
    this.worldWidth = this.mapWidth * this.tileSize;
    this.worldHeight = this.mapHeight * this.tileSize;
    this.seed = Math.random() * 10000;
    this.generateMap();
    this.loadTerrainAssets(p);
  }

  private noise(nx: number, ny: number): number {
    // Generate a pseudo-random value based on coordinates and seed
    const x = Math.sin(nx * 12.9898 + ny * 78.233 + this.seed) * 43758.5453123;
    return x - Math.floor(x);
  }

  private interpolate(a0: number, a1: number, w: number): number {
    // Smooth interpolation
    return (a1 - a0) * ((w * (w * 6.0 - 15.0) + 10.0) * w * w * w) + a0;
  }

  private generateNoise(x: number, y: number): number {
    const x0 = Math.floor(x);
    const x1 = x0 + 1;
    const y0 = Math.floor(y);
    const y1 = y0 + 1;

    const sx = x - x0;
    const sy = y - y0;

    const n0 = this.noise(x0, y0);
    const n1 = this.noise(x1, y0);
    const ix0 = this.interpolate(n0, n1, sx);

    const n2 = this.noise(x0, y1);
    const n3 = this.noise(x1, y1);
    const ix1 = this.interpolate(n2, n3, sx);

    return this.interpolate(ix0, ix1, sy);
  }

  private generateOctave(x: number, y: number, octave: number): number {
    const frequency = Math.pow(this.LACUNARITY, octave);
    const amplitude = Math.pow(this.PERSISTENCE, octave);
    return this.generateNoise(x * frequency, y * frequency) * amplitude;
  }

  private loadTerrainAssets(p: p5): void {
    TERRAIN_ASSETS.forEach(asset => {
      p.loadImage(asset.url, (img) => {
        if (asset.type === 'desert') {
          this.terrainImages[`zone${asset.zone}`] = img;
          this.imagesLoaded++;
        } else if (asset.type === 'fauna') {
          this.faunaImage = img;
        }
      });
    });
  }

  private generateMap(): void {
    this.tiles = [];
    this.faunaPositions = [];
    this.faunaOpacity = [];
    
    for (let y = 0; y < this.mapHeight; y++) {
      this.tiles[y] = [];
      this.faunaPositions[y] = [];
      this.faunaOpacity[y] = [];
      
      for (let x = 0; x < this.mapWidth; x++) {
        let value = 0;
        
        // Generate multiple octaves of noise
        for (let o = 0; o < this.OCTAVES; o++) {
          value += this.generateOctave(
            x * this.NOISE_SCALE,
            y * this.NOISE_SCALE,
            o
          );
        }
        
        // Normalize value between 0 and 1
        value = value / (2 - Math.pow(this.PERSISTENCE, this.OCTAVES));
        
        // Improved terrain distribution for better gameplay
        // 70% Plains (main buildable area)
        // 15% Habital Zone 1 (secondary buildable)
        // 10% Habital Zone 2 (tertiary buildable)
        // 5% Rock (strategic obstacles)
        if (value < 0.70) {
          this.tiles[y][x] = TERRAIN_TYPES.PLAINS.id;
        } else if (value < 0.10) {
          this.tiles[y][x] = TERRAIN_TYPES.HABITAL_1.id;
        } else if (value < 0.95) {
          this.tiles[y][x] = TERRAIN_TYPES.HABITAL_2.id;
        } else {
          this.tiles[y][x] = TERRAIN_TYPES.ROCK.id;
        }

        // Only place fauna on buildable terrain with 5% chance
        const terrain = Object.values(TERRAIN_TYPES).find(t => t.id === this.tiles[y][x])!;
        this.faunaPositions[y][x] = terrain.buildable && Math.random() < 0.01;
        
        // Pre-calculate fauna opacity
        const baseAlpha = 140; // Base opacity ~55%
        const edgeFade = 0.7; // Edge fade 30%
        this.faunaOpacity[y][x] = baseAlpha * (1 - edgeFade + Math.random() * edgeFade);
      }
    }
  }

  public getTerrainAt(position: Vector): TerrainType {
    const x = Math.floor(position.x / this.tileSize);
    const y = Math.floor(position.y / this.tileSize);
    
    // Default to PLAINS for out of bounds
    if (x < 0 || x >= this.tiles[0].length || y < 0 || y >= this.tiles.length) {
      return TERRAIN_TYPES.PLAINS;
    }
    
    const terrainId = this.tiles[y][x];
    return Object.values(TERRAIN_TYPES).find(t => t.id === terrainId)!;
  }

  public isPassable(position: Vector): boolean {
    const terrain = this.getTerrainAt(position);
    return terrain.movementCost !== Infinity;
  }

  public isBuildable(position: Vector): boolean {
    const terrain = this.getTerrainAt(position);
    return terrain.buildable;
  }

  public getDefenseMultiplier(position: Vector): number {
    const terrain = this.getTerrainAt(position);
    return terrain.defensiveBonus;
  }

  public getVisibilityBonus(position: Vector): number {
    const terrain = this.getTerrainAt(position);
    return terrain.visibilityBonus;
  }

  public update(): void {
    // Update map state if needed
  }

  public render(p: p5): void {
    if (this.imagesLoaded < this.totalImages) {
      p.fill(255);
      p.textSize(12);
      p.text('Loading terrain...', 10, 20);
      return;
    }

    const viewportX = Math.floor(this.gameState.camera.position.x / this.tileSize);
    const viewportY = Math.floor(this.gameState.camera.position.y / this.tileSize);
    const tilesX = Math.ceil(p.width / this.tileSize) + 1;
    const tilesY = Math.ceil(p.height / this.tileSize) + 1;

    for (let y = viewportY; y < Math.min(viewportY + tilesY, this.mapHeight); y++) {
      for (let x = viewportX; x < Math.min(viewportX + tilesX, this.mapWidth); x++) {
        if (y < 0 || x < 0) continue;
        
        const tile = this.tiles[y][x];
        const tileX = x * this.tileSize;
        const tileY = y * this.tileSize;

        let tileImage = null;
        
        switch (tile) {
          case TERRAIN_TYPES.PLAINS.id:
            tileImage = this.terrainImages.zone1;
            break;
          case TERRAIN_TYPES.HABITAL_1.id:
            tileImage = this.terrainImages.zone2;
            break;
          case TERRAIN_TYPES.HABITAL_2.id:
            tileImage = this.terrainImages.zone3;
            break;
          case TERRAIN_TYPES.ROCK.id:
            tileImage = this.terrainImages.zone1; // Fallback to zone1 for now
            break;
        }

        if (tileImage) {
          p.image(tileImage, tileX, tileY, this.tileSize, this.tileSize);
          
          // Add fauna at pre-determined positions
          if (this.faunaImage && this.faunaPositions[y][x]) {
            // Set blend mode for better integration
            p.push();
            p.blendMode(p.SOFT_LIGHT);
            p.tint(255, this.faunaOpacity[y][x]);
            p.image(this.faunaImage, tileX, tileY, this.tileSize, this.tileSize);
            p.pop();
          }
        } else {
          // Fallback to color if image not loaded
          p.noStroke();
          const terrain = Object.values(TERRAIN_TYPES).find(t => t.id === tile);
          p.fill(terrain ? terrain.color : '#000000');
          p.rect(tileX, tileY, this.tileSize, this.tileSize);
        }
      }
    }
  }
}