import p5 from 'p5';
import { TERRAIN_TYPES, TerrainType } from './Terrain';
import { Vector } from '../utils/Vector';
import { GameState } from '../state/GameState';

export class GameMap {
  private tileSize = 24; // Classic C&C tile size
  private mapWidth = 128;  // Classic C&C map size
  private mapHeight = 128; // Keep square map
  private terrainColors: { [key: string]: p5.Color } = {};
  public readonly worldWidth: number;
  public readonly worldHeight: number;
  public tiles: number[][] = [];
  private heightMap: number[][] = [];
  private moisture: number[][] = [];
  private seed: number;

  constructor(p: p5, private gameState: GameState) {
    this.worldWidth = this.mapWidth * this.tileSize;
    this.worldHeight = this.mapHeight * this.tileSize;
    this.seed = Math.random() * 10000;
    this.initializeTerrainColors(p);
    this.generateMap();
  }

  private initializeTerrainColors(p: p5): void {
    Object.values(TERRAIN_TYPES).forEach(terrain => {
      this.terrainColors[terrain.id] = p.color(terrain.color);
    });
  }

  private generateMap(): void {
    // Initialize empty map
    for (let y = 0; y < this.mapHeight; y++) {
      this.tiles[y] = [];
      this.heightMap[y] = [];
      this.moisture[y] = [];
      for (let x = 0; x < this.mapWidth; x++) {
        // Generate terrain data
        let height = this.generateHeight(x, y);
        this.heightMap[y][x] = height;
        
        let moisture = this.generateMoisture(x, y);
        this.moisture[y][x] = moisture;
        
        // Determine terrain type based on height and moisture
        this.tiles[y][x] = this.determineTerrainType(height, moisture);
      }
    }
  }

  private generateHeight(x: number, y: number): number {
    // Combine multiple noise frequencies for more natural terrain
    const scale1 = 0.04; // Larger scale for more gradual changes
    const scale2 = 0.08;
    const h1 = this.noise(x * scale1 + this.seed, y * scale1 + this.seed);
    const h2 = this.noise(x * scale2 + this.seed * 2, y * scale2 + this.seed * 2) * 0.5;
    return (h1 + h2) / 1.5; // Simplified noise combination for smoother terrain
  }

  private generateMoisture(x: number, y: number): number {
    const scale1 = 0.06;
    const m1 = this.noise(x * scale1 + this.seed * 4, y * scale1 + this.seed * 4);
    return m1; // Simplified moisture for more consistent regions
  }

  private noise(x: number, y: number): number {
    // Improved Perlin-like noise
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    return this.lerp(
      this.lerp(this.grad(X, Y), this.grad(X + 1, Y), u),
      this.lerp(this.grad(X, Y + 1), this.grad(X + 1, Y + 1), u),
      v
    );
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private grad(x: number, y: number): number {
    const h = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
    return h - Math.floor(h);
  }

  private determineTerrainType(height: number, moisture: number): number {
    if (height < 0.6) return TERRAIN_TYPES.PLAINS.id; // Significantly more buildable terrain
    if (height < 0.7) return TERRAIN_TYPES.ROUGH.id;
    if (height < 0.8) {
      return moisture > 0.8 ? TERRAIN_TYPES.FOREST.id : TERRAIN_TYPES.HILLS.id;
    }
    if (height < 0.9) return TERRAIN_TYPES.WATER.id;
    return TERRAIN_TYPES.MOUNTAINS.id;
  }

  public getTerrainAt(position: Vector): TerrainType {
    const x = Math.floor(position.x / this.tileSize);
    const y = Math.floor(position.y / this.tileSize);
    if (x < 0 || x >= this.tiles[0].length || y < 0 || y >= this.tiles.length) {
      return TERRAIN_TYPES.MOUNTAINS; // Out of bounds is impassable
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
    const viewportX = Math.floor(this.gameState.camera.position.x / this.tileSize);
    const viewportY = Math.floor(this.gameState.camera.position.y / this.tileSize);
    const tilesX = Math.ceil(p.width / this.tileSize) + 1;
    const tilesY = Math.ceil(p.height / this.tileSize) + 1;

    // Only render visible tiles
    for (let y = viewportY; y < Math.min(viewportY + tilesY, this.mapHeight); y++) {
      for (let x = viewportX; x < Math.min(viewportX + tilesX, this.mapWidth); x++) {
        if (y < 0 || x < 0) continue;
        
        const tile = this.tiles[y][x];
        const nextTile = x < this.mapWidth - 1 ? this.tiles[y][x + 1] : tile;
        const bottomTile = y < this.mapHeight - 1 ? this.tiles[y + 1][x] : tile;
        
        const tileX = x * this.tileSize;
        const tileY = y * this.tileSize;
        
        // Draw terrain with optimized batching
        p.noStroke();
        p.fill(this.terrainColors[tile]);
        p.rect(tileX, tileY, this.tileSize, this.tileSize);
        
        // Add terrain edge highlights
        if (tile !== nextTile || tile !== bottomTile) {
          p.stroke(255, 255, 255, 40);
          p.strokeWeight(1);
          tile !== nextTile && p.line(tileX + this.tileSize, tileY, tileX + this.tileSize, tileY + this.tileSize);
          tile !== bottomTile && p.line(tileX, tileY + this.tileSize, tileX + this.tileSize, tileY + this.tileSize);
        }
      }
    }
  }
}