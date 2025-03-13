import p5 from 'p5';
import { GameState } from '../state/GameState';
import { TERRAIN_TYPES } from '../map/Terrain';

export class MinimapSystem {
  private minimapBuffer: p5.Graphics | null = null;
  private radarAngle: number = 0;

  constructor(
    private p: p5,
    private gameState: GameState,
    private minimapSize: number
  ) {
    this.initializeBuffer();
  }

  private initializeBuffer(): void {
    this.minimapBuffer = this.p.createGraphics(this.minimapSize, this.minimapSize);
    this.updateTerrainBuffer();
  }

  private updateTerrainBuffer(): void {
    if (!this.minimapBuffer) return;
    
    const buffer = this.minimapBuffer;
    const tileSize = this.minimapSize / this.gameState.map.tiles.length;
    
    buffer.background(20);
    
    // Draw terrain
    for (let i = 0; i < this.gameState.map.tiles.length; i++) {
      for (let j = 0; j < this.gameState.map.tiles[i].length; j++) {
        const terrainId = this.gameState.map.tiles[i][j];
        const terrain = Object.values(TERRAIN_TYPES).find(t => t.id === terrainId);
        if (terrain) {
          buffer.fill(terrain.color);
          buffer.noStroke();
          buffer.rect(j * tileSize, i * tileSize, tileSize + 1, tileSize + 1);
        }
      }
    }
  }

  public render(x: number, y: number): void {
    const hasOperationalRadar = this.gameState.buildings.some(b => 
      b.definition.name === 'Radar' && 
      b.isAlive() && 
      !this.gameState.isPowerShortage
    );

    this.p.push();
    
    this.p.fill(20);
    this.p.noStroke();
    this.p.rect(x, y, this.minimapSize, this.minimapSize);
    
    this.p.stroke(40);
    this.p.strokeWeight(2);
    this.p.noFill();
    this.p.rect(x + 1, y + 1, this.minimapSize - 2, this.minimapSize - 2);
    
    if (this.minimapBuffer) {
      this.p.image(this.minimapBuffer, x, y);
      
      if (!this.minimapBuffer.get(0, 0)[3]) {
        this.updateTerrainBuffer();
      }
    }
    
    if (hasOperationalRadar) {
      this.renderRadarView(x, y);
    } else {
      this.renderNoRadarState(x, y);
    }
    
    this.p.pop();
  }

  private renderRadarView(x: number, y: number): void {
    this.radarAngle = (this.radarAngle + 0.03) % (Math.PI * 2);
    const scanGradient = this.p.drawingContext.createConicGradient(
      this.radarAngle,
      x + this.minimapSize / 2,
      y + this.minimapSize / 2
    );
    scanGradient.addColorStop(0, 'rgba(0, 255, 0, 0.2)');
    scanGradient.addColorStop(0.1, 'rgba(0, 255, 0, 0)');
    this.p.drawingContext.fillStyle = scanGradient;
    this.p.rect(x, y, this.minimapSize, this.minimapSize);

    this.renderEntities(x, y);
    this.renderViewport(x, y);
  }

  private renderEntities(x: number, y: number): void {
    // Render buildings
    this.gameState.buildings.forEach(building => {
      if (!building.isAlive()) return;
      const miniX = x + (building.position.x / this.gameState.map.worldWidth) * this.minimapSize;
      const miniY = y + (building.position.y / this.gameState.map.worldHeight) * this.minimapSize;
      
      this.p.fill(building.playerId === 'player1' ? '#4a9fff' : '#ff4a4a');
      this.p.noStroke();
      this.p.rect(miniX - 3, miniY - 3, 6, 6);
    });

    // Render units
    this.gameState.units.forEach(unit => {
      const miniX = x + (unit.position.x / this.gameState.map.worldWidth) * this.minimapSize;
      const miniY = y + (unit.position.y / this.gameState.map.worldHeight) * this.minimapSize;
      
      this.p.fill(unit.playerId === 'player1' ? '#4a9fff' : '#ff4a4a');
      this.p.noStroke();
      this.p.circle(miniX, miniY, 3);
    });
  }

  private renderViewport(x: number, y: number): void {
    const viewX = x + (this.gameState.camera.position.x / this.gameState.map.worldWidth) * this.minimapSize;
    const viewY = y + (this.gameState.camera.position.y / this.gameState.map.worldHeight) * this.minimapSize;
    const viewW = (this.p.width / this.gameState.map.worldWidth) * this.minimapSize;
    const viewH = (this.p.height / this.gameState.map.worldHeight) * this.minimapSize;
    
    this.p.noFill();
    this.p.stroke(255, 100);
    this.p.strokeWeight(1);
    this.p.rect(viewX, viewY, viewW, viewH);
  }

  private renderNoRadarState(x: number, y: number): void {
    const radarExists = this.gameState.buildings.some(b => b.definition.name === 'Radar' && b.isAlive());
    const message = this.gameState.isPowerShortage && radarExists ? 'RADAR OFFLINE' : 'NO RADAR';
    
    this.p.fill(255, 100);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(14);
    this.p.text(message, x + this.minimapSize / 2, y + this.minimapSize / 2);
    
    this.p.fill(0, 0, 0, 25);
    this.p.noStroke();
    this.p.rect(x, y, this.minimapSize, this.minimapSize);
  }
}