import p5 from 'p5';
import { BuildingDefinition } from '../factions/buildings';

export class TooltipSystem {
  constructor(private p: p5) {}

  public renderBuildingTooltip(
    building: BuildingDefinition,
    x: number,
    y: number,
    width: number = 180,
    padding: number = 10
  ): void {
    const height = 120;
    
    this.p.push();
    // Draw shadow
    this.p.fill(0, 0, 0, 30);
    this.p.noStroke();
    this.p.rect(x + 2, y + 2, width, height, 4);

    // Main background
    this.p.fill(40);
    this.p.stroke(60);
    this.p.strokeWeight(1);
    this.p.rect(x, y, width, height, 4);
    
    // Building name and requirements
    this.p.fill(255);
    this.p.noStroke();
    this.p.textAlign(this.p.LEFT, this.p.TOP);
    this.p.textSize(14);
    this.p.text(building.name, x + padding, y + padding);
    
    // Power usage
    if (building.powerUsage !== 0) {
      this.p.textAlign(this.p.RIGHT);
      this.p.textSize(12);
      this.p.fill(180);
      this.p.text(
        `⚡ ${building.powerUsage < 0 ? '+' : ''}${Math.abs(building.powerUsage)}`,
        x + width - padding,
        y + padding
      );
    }

    // Divider line
    this.p.stroke(60);
    this.p.strokeWeight(1);
    this.p.line(
      x + padding,
      y + padding * 3,
      x + width - padding,
      y + padding * 3
    );
    
    // Description
    this.p.fill(200);
    this.p.noStroke();
    this.p.textSize(12);
    this.p.textAlign(this.p.LEFT);
    this.p.text(building.description, x + padding, y + padding * 4, width - padding * 2);
    
    // Stats
    const statsY = y + height - 35;
    
    // Stats background
    this.p.fill(30);
    this.p.noStroke();
    this.p.rect(x + padding, statsY - padding/2, width - padding * 2, 28, 2);
    
    // Stats text
    this.p.textSize(12);
    this.p.fill(180);
    
    // Left column
    this.p.textAlign(this.p.LEFT);
    this.p.text(`💰 $${building.cost}`, x + padding * 2, statsY);
    
    // Right column
    this.p.textAlign(this.p.RIGHT);
    this.p.text(`⏱️ ${building.buildTime}s`, x + width - padding * 2, statsY);
    
    this.p.pop();
  }
}