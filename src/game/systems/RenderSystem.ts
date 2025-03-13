import p5 from 'p5';
import { GameState } from '../state/GameState';
import { Vector } from '../utils/Vector';

export class RenderSystem {
  constructor(
    private p: p5,
    private gameState: GameState
  ) {}

  public update(): void {
    // Apply camera transform
    this.gameState.camera.begin();
    
    // Render map
    this.gameState.map.render(this.p);
    
    // Render crystal nodes first (they should be behind resources)
    this.gameState.nodes.forEach(node => node.render(this.p));
    
    // Render building placement preview
    if (this.gameState.buildingToPlace) {
      const worldX = this.p.mouseX + this.gameState.camera.position.x;
      const worldY = this.p.mouseY + this.gameState.camera.position.y;
      const position = new Vector(worldX, worldY);
      const hasOverlap = this.gameState.isBuildingOverlap(position);
      
      // Draw placement outline
      this.p.push();
      this.p.translate(worldX, worldY);
      
      const isBuildable = this.gameState.map.isBuildable(position) && !hasOverlap;
      this.p.stroke(isBuildable ? '#00ff00' : '#ff0000');
      this.p.strokeWeight(2);
      this.p.noFill();
      this.p.rect(0, 0, 48, 48);
      
      // Show overlap warning
      if (hasOverlap) {
        this.p.fill(255, 0, 0, 100);
        this.p.noStroke();
        this.p.rect(0, 0, 48, 48);
      }
      
      // Draw grid snapping lines
      this.p.stroke(255, 255, 255, 50);
      this.p.line(-24, 0, 72, 0);
      this.p.line(0, -24, 0, 72);
      
      this.p.pop();
    }
    
    // Render resources
    this.gameState.resources.forEach(resource => resource.render(this.p));
    
    // Render buildings
    this.gameState.buildings.forEach(building => building.render(this.p));
    
    // Render MCV
    if (this.gameState.mcv) {
      this.gameState.mcv.render(this.p);
      this.gameState.mcv.update();
    }
    
    // Render units
    this.gameState.units.forEach(unit => unit.render(this.p));
    
    // Render selection box
    const inputSystem = this.gameState.systems.input;
    if (inputSystem && inputSystem.selectionBox) {
      const { start, end } = inputSystem.selectionBox;
      this.p.stroke('#4a9fff');
      this.p.strokeWeight(1);
      this.p.fill(74, 159, 255, 30);
      this.p.rect(
        start.x,
        start.y,
        end.x - start.x,
        end.y - start.y
      );
    }
    
    // Render waypoint lines for selected units
    this.gameState.selectedEntities.forEach(entity => {
      if ('target' in entity && entity.target) {
        this.p.stroke('#4a9fff');
        this.p.strokeWeight(2);
        this.p.line(
          entity.position.x + 24,
          entity.position.y + 24,
          entity.target.x,
          entity.target.y
        );
        
        // Draw target marker
        this.p.noFill();
        this.p.circle(entity.target.x, entity.target.y, 10);
        this.p.line(
          entity.target.x - 10,
          entity.target.y,
          entity.target.x + 10,
          entity.target.y
        );
        this.p.line(
          entity.target.x,
          entity.target.y - 10,
          entity.target.x,
          entity.target.y + 10
        );
      }
    });
    
    this.gameState.camera.end();
  }
}