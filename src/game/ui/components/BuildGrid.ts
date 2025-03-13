import p5 from 'p5';
import { UIComponent, Dimensions } from '../types';
import { GameState } from '../../state/GameState';
import { GridSystem } from '../GridSystem';
import { TooltipSystem } from '../TooltipSystem';
import { RAVEN_BUILDINGS } from '../../factions/buildings';

export class BuildGrid implements UIComponent {
  private gridSystem: GridSystem;
  private tooltipSystem: TooltipSystem;
  private scrollY: number = 0;
  private isDragging: boolean = false;
  private lastMouseY: number = 0;

  constructor(
    private p: p5,
    private gameState: GameState,
    private dimensions: Dimensions
  ) {
    this.gridSystem = new GridSystem(p);
    this.tooltipSystem = new TooltipSystem(p);
    this.setupScrollHandling();
  }

  private setupScrollHandling(): void {
    this.p.mouseWheel = (event) => {
      if (this.isOverGrid(this.p.mouseX, this.p.mouseY)) {
        const maxScroll = this.calculateMaxScroll();
        this.scrollY = Math.min(
          Math.max(-maxScroll, this.scrollY - event.delta),
          0
        );
        return false;
      }
    };
  }

  private isOverGrid(x: number, y: number): boolean {
    return x >= this.dimensions.x &&
           x <= this.dimensions.x + this.dimensions.width &&
           y >= this.dimensions.y &&
           y <= this.dimensions.y + this.dimensions.height;
  }

  private calculateMaxScroll(): number {
    const totalContentHeight = Math.ceil(RAVEN_BUILDINGS.length / 2) * 90;
    return Math.max(0, totalContentHeight - this.dimensions.height);
  }

  public render(): void {
    this.p.push();
    
    // Create clipping mask
    this.p.clip(
      this.dimensions.x,
      this.dimensions.y,
      this.dimensions.width,
      this.dimensions.height
    );

    const grid = this.gridSystem.calculateGrid({
      columns: 2,
      width: this.dimensions.width,
      cellHeight: 90,
      padding: 5
    });

    RAVEN_BUILDINGS.forEach((building, index) => {
      const cell = grid.getCellPosition(index, this.scrollY);
      const x = this.dimensions.x + cell.x;
      const y = this.dimensions.y + cell.y;

      if (y < this.dimensions.y - cell.height || y > this.dimensions.y + this.dimensions.height) {
        return;
      }

      this.renderBuildingCell(building, x, y, cell.width, cell.height);
    });

    this.p.pop();
  }

  private renderBuildingCell(building: any, x: number, y: number, width: number, height: number): void {
    const isSelected = this.gameState.buildingToPlace === building;
    const isHovered = this.isOverCell(x, y, width, height);
    const isAvailable = this.isBuildingAvailable(building);

    // Modern card background with glass effect
    this.p.drawingContext.save();
    this.p.fill(isSelected ? UI_CONSTANTS.COLORS.BACKGROUND_ACTIVE : 
                isHovered ? UI_CONSTANTS.COLORS.BACKGROUND_HOVER : 
                UI_CONSTANTS.COLORS.BACKGROUND_LIGHT);
    this.p.rect(x, y, width, height, UI_CONSTANTS.SIZES.BORDER_RADIUS.MD);

    // Add subtle border
    this.p.stroke(UI_CONSTANTS.COLORS.BORDER);
    this.p.strokeWeight(1);
    this.p.noFill();
    this.p.rect(x, y, width, height, UI_CONSTANTS.SIZES.BORDER_RADIUS.MD);

    // Add glow effect for selected items
    if (isSelected) {
      this.p.drawingContext.shadowColor = UI_CONSTANTS.COLORS.ACCENT;
      this.p.drawingContext.shadowBlur = 10;
    }

    // Unavailable state
    if (!isAvailable) {
      this.p.fill(UI_CONSTANTS.COLORS.BACKGROUND_OVERLAY);
      this.p.rect(x, y, width, height, UI_CONSTANTS.SIZES.BORDER_RADIUS.MD);
    }

    // Content layout
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    
    // Icon with animation
    this.p.textSize(UI_CONSTANTS.FONTS.SIZES.XXXL);
    if (isHovered && isAvailable) {
      this.p.drawingContext.shadowColor = UI_CONSTANTS.COLORS.ACCENT;
      this.p.drawingContext.shadowBlur = 15;
    }
    this.p.fill(isAvailable ? UI_CONSTANTS.COLORS.TEXT : UI_CONSTANTS.COLORS.TEXT_MUTED);
    this.p.text(this.getBuildingEmoji(building.name), x + width / 2, y + height / 2 - 10);

    // Name with better typography
    this.p.fill(isAvailable ? UI_CONSTANTS.COLORS.TEXT : UI_CONSTANTS.COLORS.TEXT_MUTED);
    this.p.textSize(UI_CONSTANTS.FONTS.SIZES.SM);
    this.p.textStyle(UI_CONSTANTS.FONTS.WEIGHTS.MEDIUM);
    this.p.text(building.name, x + width / 2, y + height - 25);

    // Stats with improved layout
    this.p.textSize(UI_CONSTANTS.FONTS.SIZES.XS);
    this.p.textStyle(UI_CONSTANTS.FONTS.WEIGHTS.NORMAL);
    this.p.fill(isAvailable ? UI_CONSTANTS.COLORS.TEXT_DIM : UI_CONSTANTS.COLORS.TEXT_MUTED);
    
    // Cost with color indication
    const costColor = this.gameState.money >= building.cost 
      ? UI_CONSTANTS.COLORS.SUCCESS 
      : UI_CONSTANTS.COLORS.ERROR;
    this.p.fill(isAvailable ? costColor : UI_CONSTANTS.COLORS.TEXT_MUTED);
    this.p.text(`$${building.cost}`, x + width / 2 - 25, y + height - 10);
    
    // Build time
    this.p.fill(isAvailable ? UI_CONSTANTS.COLORS.TEXT_DIM : UI_CONSTANTS.COLORS.TEXT_MUTED);
    this.p.text(`⏱️${building.buildTime}s`, x + width / 2 + 25, y + height - 10);

    if (isHovered && isAvailable) {
      this.tooltipSystem.renderBuildingTooltip(
        building,
        x - 190,
        Math.min(y, this.p.height - 160),
        200,
        12
      );
    }
    
    this.p.drawingContext.restore();
  }

  private isOverCell(x: number, y: number, width: number, height: number): boolean {
    return this.p.mouseX >= x && this.p.mouseX <= x + width &&
           this.p.mouseY >= y && this.p.mouseY <= y + height;
  }

  private isBuildingAvailable(building: any): boolean {
    if (!this.gameState.isBaseDeployed) return false;
    if (this.gameState.money < building.cost) return false;
    if (building.name === 'Power Plant') return true;
    if (!building.requirements) return true;
    return building.requirements.every((req: string) =>
      this.gameState.buildings.some(b => 
        b.definition.name === req && 
        b.isAlive()
      )
    );
  }

  private getBuildingEmoji(name: string): string {
    const emojiMap: { [key: string]: string } = {
      'Power Plant': '⚡',
      'Barracks': '🏰',
      'Factory': '🏭',
      'Turret': '🗼',
      'Radar': '📡',
      'Lab': '🔬',
      'Refinery': '⛽',
      'Silo': '🏢'
    };
    return emojiMap[name] || '🏗️';
  }

  public update(): void {
    if (this.isDragging) {
      const deltaY = this.p.mouseY - this.lastMouseY;
      const maxScroll = this.calculateMaxScroll();
      this.scrollY = Math.max(
        Math.min(0, this.scrollY + deltaY),
        -maxScroll
      );
      this.lastMouseY = this.p.mouseY;
    }
  }
}