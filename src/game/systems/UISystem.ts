import p5 from 'p5';
import { GameState } from '../state/GameState';
import { BuildingDefinition, RAVEN_BUILDINGS } from '../factions/buildings';
import { TERRAIN_TYPES } from '../map/Terrain';
import { MenuSystem } from './MenuSystem';
import { GridSystem } from '../ui/GridSystem';
import { TooltipSystem } from '../ui/TooltipSystem';
import { MinimapSystem } from '../ui/MinimapSystem';

export class UISystem {
  private readonly SIDEBAR_WIDTH = 200;
  private readonly MINIMAP_SIZE = 200;
  private readonly CATEGORY_SIZE = 40;
  private readonly OPTIONS_BAR_HEIGHT = 30;
  private readonly GRID_SIZE = 90; // Slightly smaller to fit grid better
  private readonly CELL_PADDING = 8;
  private readonly INFO_PANEL_HEIGHT = 50;
  private radarAngle = 0;
  private minimapBuffer: p5.Graphics | null = null;
  private selectedCategory: 'construction' | 'infantry' | 'vehicles' | 'defense' = 'construction';
  private scrollY = 0;
  private isDragging = false;
  private isMinimapDragging = false;
  private hoveredBuildingDef: BuildingDefinition | null = null;
  private lastMouseY = 0;
  private overlayInfo: { building: BuildingDefinition; x: number; y: number } | null = null;
  private menuSystem: MenuSystem;
  private gridSystem: GridSystem;
  private tooltipSystem: TooltipSystem;
  private minimapSystem: MinimapSystem;

  constructor(private p: p5, private gameState: GameState) {
    this.setupInputHandlers();
    this.menuSystem = new MenuSystem(p, gameState);
    this.gridSystem = new GridSystem(p);
    this.tooltipSystem = new TooltipSystem(p);
    this.minimapSystem = new MinimapSystem(p, gameState, this.MINIMAP_SIZE);
  }

  private initializeMinimapBuffer(): void {
    this.minimapBuffer = this.p.createGraphics(this.MINIMAP_SIZE, this.MINIMAP_SIZE);
    this.updateTerrainBuffer();
  }

  private updateTerrainBuffer(): void {
    if (!this.minimapBuffer) return;
    
    const buffer = this.minimapBuffer;
    const tileSize = this.MINIMAP_SIZE / this.gameState.map.tiles.length;
    
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

  private setupInputHandlers(): void {
    this.p.mouseWheel = (event) => {
      if (this.isOverBuildMenu(this.p.mouseX, this.p.mouseY)) {
        const maxScroll = this.calculateMaxScroll();
        this.scrollY = Math.min(
          Math.max(-maxScroll, this.scrollY - event.delta),
          0
        );
        return false;
      }
    };

    this.p.mousePressed = () => {
      if (this.isOverBuildMenu(this.p.mouseX, this.p.mouseY)) {
        this.isDragging = true;
        this.lastMouseY = this.p.mouseY;
        return;
      }

      const mapX = this.p.width - this.SIDEBAR_WIDTH;
      
      if (this.p.mouseX >= mapX && this.p.mouseX <= mapX + this.MINIMAP_SIZE &&
          this.p.mouseY >= 0 && this.p.mouseY <= this.MINIMAP_SIZE) {
        
        const hasRadar = this.gameState.buildings.some(b => b.definition.name === 'Radar' && b.isAlive());
        if (hasRadar) {
          this.isMinimapDragging = true;
          this.updateMinimapPosition();
        }
      }
    };

    this.p.mouseReleased = () => {
      this.isDragging = false;
      this.isMinimapDragging = false;
    };
  }

  private updateMinimapPosition(): void {
    if (!this.isMinimapDragging) return;
    
    const mapX = this.p.width - this.SIDEBAR_WIDTH;
    const worldX = ((this.p.mouseX - mapX) / this.MINIMAP_SIZE) * this.gameState.map.worldWidth;
    const worldY = (this.p.mouseY / this.MINIMAP_SIZE) * this.gameState.map.worldHeight;
    
    this.gameState.camera.position.x = Math.max(0, Math.min(
      worldX - this.p.width / 2,
      this.gameState.map.worldWidth - this.p.width
    ));
    this.gameState.camera.position.y = Math.max(0, Math.min(
      worldY - this.p.height / 2,
      this.gameState.map.worldHeight - this.p.height
    ));
  }

  private calculateMaxScroll(): number {
    const totalContentHeight = Math.ceil(RAVEN_BUILDINGS.length / 2) * this.GRID_SIZE;
    const startY = this.MINIMAP_SIZE + this.INFO_PANEL_HEIGHT + (2 * this.CATEGORY_SIZE);
    const visibleHeight = this.p.height - startY - this.OPTIONS_BAR_HEIGHT - 4;
    return Math.max(0, totalContentHeight - visibleHeight);
  }

  private isOverBuildMenu(x: number, y: number): boolean {
    const menuX = this.p.width - this.SIDEBAR_WIDTH;
    const menuY = this.MINIMAP_SIZE + this.INFO_PANEL_HEIGHT + this.TAB_HEIGHT;
    const menuHeight = this.p.height - menuY - this.OPTIONS_BAR_HEIGHT;
    return x >= menuX && x <= this.p.width && y >= menuY && y <= menuY + menuHeight;
  }

  private handleScroll(): void {
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

  public update(): void {
    const requiredBuildingHighlights: { x: number; y: number }[] = [];
    
    this.renderSidebar();
    this.renderMinimap();
    if (this.isMinimapDragging) {
      this.updateMinimapPosition();
    }
    
    this.overlayInfo = null;
    
    this.renderTabBar();
    this.renderBuildButtons(requiredBuildingHighlights);
    
    requiredBuildingHighlights.forEach(pos => {
      this.p.stroke('#fa4a4a');
      this.p.strokeWeight(2);
      this.p.noFill();
      this.p.rect(pos.x - 2, pos.y - 2, this.GRID_SIZE + 4, this.GRID_SIZE + 4, 6);
    });
    
    this.renderSelectionInfo();
    this.renderOptionsBar();
    
    if (this.gameState.isMenuOpen) {
      this.menuSystem.render();
    }
    
    if (this.overlayInfo) {
      this.renderBuildingStatsOverlay(
        this.overlayInfo.building,
        this.overlayInfo.x,
        this.overlayInfo.y
      );
    }
  }

  private renderSidebar(): void {
    this.p.push();
    this.p.fill(20);
    this.p.noStroke();
    this.p.rect(this.p.width - this.SIDEBAR_WIDTH, 0, this.SIDEBAR_WIDTH, this.p.height);

    // Info panel background
    this.p.fill(30);
    this.p.rect(
      this.p.width - this.SIDEBAR_WIDTH,
      this.MINIMAP_SIZE,
      this.SIDEBAR_WIDTH,
      this.INFO_PANEL_HEIGHT + (this.gameState.selectedEntities.length > 0 ? 60 : 0)
    );

    // Money and power info
    this.p.fill(200);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(14);
    const x = this.p.width - this.SIDEBAR_WIDTH;
    const infoY = this.MINIMAP_SIZE + this.INFO_PANEL_HEIGHT / 2;
    
    this.p.text(`💰 ${this.gameState.money.toLocaleString()}`, x + this.SIDEBAR_WIDTH / 4, infoY);
    
    const powerText = `⚡ ${this.gameState.powerUsed}/${this.gameState.powerGenerated}`;
    const powerColor = this.gameState.powerUsed > this.gameState.powerGenerated ? '#ff4a4a' : '#ffffff';
    this.p.fill(powerColor);
    this.p.text(powerText, x + (this.SIDEBAR_WIDTH * 3) / 4, infoY);

    // Selection info
    if (this.gameState.selectedEntities.length > 0) {
      this.p.fill(200);
      this.p.textAlign(this.p.LEFT, this.p.TOP);
      this.p.textSize(12);
      
      this.gameState.selectedEntities.forEach((entity, index) => {
        const health = `${entity.health}/${entity.maxHealth}`;
        this.p.text(
          `Unit ${index + 1} - Health: ${health}`,
          x + 10,
          this.MINIMAP_SIZE + this.INFO_PANEL_HEIGHT + 10 + index * 20
        );
      });
    }
    this.p.pop();
  }

  private renderOptionsBar(): void {
    this.p.push();
    this.p.fill(20);
    this.p.noStroke();
    this.p.rect(0, this.p.height - 30, this.p.width - this.SIDEBAR_WIDTH, 30);

    this.p.fill(200);
    this.p.textAlign(this.p.LEFT, this.p.CENTER);
    this.p.textSize(12);
    this.p.text('Options: [ESC] Menu  [H]alt  [B]uild', 10, this.p.height - 15);
    this.p.pop();
  }

  private renderMinimap(): void {
    const x = this.p.width - this.SIDEBAR_WIDTH;
    const y = 0;
    this.minimapSystem.render(x, y);
  }

  private renderSelectionInfo(): void {
    // Selection info now handled in renderSidebar
  }

  private renderTabBar(): void {
    const x = this.p.width - this.SIDEBAR_WIDTH;
    const y = this.MINIMAP_SIZE + this.INFO_PANEL_HEIGHT;
    
    const categories = [
      { id: 'construction', label: 'Construction', icon: '🏗️', emoji: '🏗️' },
      { id: 'infantry', label: 'Infantry', icon: '👥', emoji: '👥' },
      { id: 'vehicles', label: 'Vehicles', icon: '🚛', emoji: '🚛' },
      { id: 'defense', label: 'Defense', icon: '🛡️', emoji: '🛡️' }
    ];

    this.p.push();
    // Render category tabs in 2x2 grid
    categories.forEach((category, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const categoryX = x + (col * (this.SIDEBAR_WIDTH / 2));
      const categoryY = y + (row * this.CATEGORY_SIZE);
      this.renderCategoryTab(categoryX, categoryY, category.label, category.id as any);
    });
    
    this.p.pop();
  }

  private renderCategoryTab(
    x: number, 
    y: number, 
    label: string,
    category: 'construction' | 'infantry' | 'vehicles' | 'defense'
  ): void {
    // Check if mouse is over tab
    const isHovered = this.p.mouseX >= x && this.p.mouseX < x + this.SIDEBAR_WIDTH / 2 &&
                     this.p.mouseY >= y && this.p.mouseY < y + this.CATEGORY_SIZE;
    
    // Handle click
    if (isHovered && this.p.mouseIsPressed && this.p.mouseButton === this.p.LEFT) {
      this.selectedCategory = category;
      this.scrollY = 0; // Reset scroll position when switching tabs
    }

    this.p.fill(this.selectedCategory === category ? 40 : 20);
    if (isHovered) this.p.fill(this.selectedCategory === category ? 50 : 30);
    this.p.noStroke();
    this.p.rect(x, y, this.SIDEBAR_WIDTH / 2 + (x === this.p.width - this.SIDEBAR_WIDTH ? 1 : 0), this.CATEGORY_SIZE);

    this.p.fill(255);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(11);

    // Draw icon and text with proper spacing
    const iconX = x + this.SIDEBAR_WIDTH / 4 - 20;
    const textX = x + this.SIDEBAR_WIDTH / 4 + 10;
    const centerY = y + this.CATEGORY_SIZE / 2;
    
    this.p.textSize(16);
    const emoji = this.getCategoryEmoji(category);
    this.p.text(emoji, iconX, centerY);
    
    this.p.textSize(11);
    this.p.text(label, textX, centerY);
  }

  private getCategoryEmoji(category: string): string {
    switch (category) {
      case 'construction':
        return '🏗️';
      case 'infantry':
        return '👥';
      case 'vehicles':
        return '🚛';
      case 'defense':
        return '🛡️';
      default:
        return '🏗️';
    }
  }

  private renderBuildingButton(
    x: number, 
    y: number, 
    width: number,
    height: number,
    building: BuildingDefinition, 
    requiredBuildingHighlights: { x: number; y: number }[]
  ): void {
    const isSelected = this.gameState.buildingToPlace === building;
    
    this.p.fill(isSelected ? 40 : 20);
    this.p.noStroke();
    this.p.rect(x, y, width, height, 4);

    const isHovered = this.p.mouseX > x && this.p.mouseX < x + width &&
                     this.p.mouseY > y && this.p.mouseY < y + height;

    if (isHovered) {
      this.hoveredBuildingDef = building;
      this.overlayInfo = {
        building,
        x: x - 190, // Position tooltip to the left of the button
        y: Math.min(y, this.p.height - 160) // Keep tooltip in view
      };
    }

    const isAvailable = this.isBuildingAvailable(building);
    if (!isAvailable) {
      this.p.fill(0, 0, 0, 150);
      this.p.rect(x, y, width, height, 4);
    }

    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(32);
    const emoji = this.getBuildingEmoji(building.name);
    
    // Center the emoji vertically
    const emojiY = y + height / 2 - 10;
    this.p.fill(isAvailable ? 255 : 100);
    this.p.text(emoji, x + width / 2, emojiY);

    this.p.fill(isAvailable ? 200 : 100);
    this.p.noStroke();
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(10);
    this.p.text(building.name, x + width / 2, y + height - 25);
    
    this.p.textSize(10);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    
    // Adjust cost and build time spacing
    const statsY = y + height - 10;
    this.p.text(`$${building.cost}`, x + width / 2 - 20, statsY);
    this.p.text(`⏱️${building.buildTime}s`, x + width / 2 + 15, statsY);
    
    if (this.p.mouseIsPressed && 
        this.p.mouseX > x && this.p.mouseX < x + width &&
        this.p.mouseY > y && this.p.mouseY < y + height &&
        isAvailable &&
        this.gameState.money >= building.cost) {
      this.gameState.buildingToPlace = building;
    }
  }

  private renderBuildingStatsOverlay(
    building: BuildingDefinition,
    x: number,
    y: number
  ): void {
    this.tooltipSystem.renderBuildingTooltip(building, x, y);
  }

  private getBuildingEmoji(buildingName: string): string {
    switch (buildingName) {
      case 'Power Plant':
        return '⚡';
      case 'Barracks':
        return '🏰';
      case 'Factory':
        return '🏭';
      case 'Turret':
        return '🗼';
      case 'Radar':
        return '📡';
      case 'Lab':
        return '🔬';
      case 'Refinery':
        return '⛽';
      case 'Silo':
        return '🏢';
      default:
        return '🏗️';
    }
  }

  private isBuildingAvailable(building: BuildingDefinition): boolean {
    if (!this.gameState.isBaseDeployed) return false;
    if (this.gameState.money < building.cost) return false;
    if (building.name === 'Power Plant') return true;
    if (!building.requirements) return true;
    return building.requirements.every(req => {
      return this.gameState.buildings.some(b => 
        b.definition.name === req && 
        b.isAlive()
      );
    });
  }

  private renderBuildButtons(requiredBuildingHighlights: { x: number; y: number }[]): void {
    const startX = this.p.width - this.SIDEBAR_WIDTH;
    const startY = this.MINIMAP_SIZE + this.INFO_PANEL_HEIGHT + (2 * this.CATEGORY_SIZE);
    const visibleHeight = this.p.height - startY - this.OPTIONS_BAR_HEIGHT - 4;

    // Handle scrolling
    this.handleScroll();

    this.p.push();
    this.p.fill(20);
    this.p.noStroke();
    this.p.rect(startX, startY, this.SIDEBAR_WIDTH, visibleHeight);

    // Create clipping mask for content
    this.p.beginShape();
    this.p.vertex(startX, startY);
    this.p.vertex(startX + this.SIDEBAR_WIDTH, startY);
    this.p.vertex(startX + this.SIDEBAR_WIDTH, startY + visibleHeight);
    this.p.vertex(startX, startY + visibleHeight);
    this.p.endShape(this.p.CLOSE);
    this.p.drawingContext.clip();

    switch (this.selectedCategory) {
      case 'construction':
        this.renderConstructionButtons(startX, startY, visibleHeight, requiredBuildingHighlights);
        break;
      case 'infantry':
        this.renderInfantryButtons(startX, startY, visibleHeight);
        break;
      case 'vehicles':
        this.renderVehicleButtons(startX, startY, visibleHeight);
        break;
      case 'defense':
        this.renderDefenseButtons(startX, startY, visibleHeight);
        break;
    }

    this.p.pop();
  }

  private renderConstructionButtons(
    startX: number,
    startY: number,
    visibleHeight: number,
    requiredBuildingHighlights: { x: number; y: number }[]
  ): void {
    const grid = this.gridSystem.calculateGrid({
      columns: 2,
      width: this.SIDEBAR_WIDTH,
      cellHeight: this.GRID_SIZE,
      padding: this.CELL_PADDING
    });

    RAVEN_BUILDINGS.forEach((building, index) => {
      const cell = grid.getCellPosition(index, this.scrollY);
      const y = startY + cell.y;

      if (y < startY - this.GRID_SIZE || y > startY + visibleHeight) return;

      this.renderBuildingButton(
        startX + cell.x,
        y,
        cell.width,
        cell.height,
        building,
        requiredBuildingHighlights
      );
    });
  }

  private renderInfantryButtons(startX: number, startY: number, visibleHeight: number): void {
    const infantry = [
      { name: 'Scout', cost: 400, buildTime: 15, icon: '👁️' },
      { name: 'Infantry', cost: 600, buildTime: 20, icon: '🔫' },
      { name: 'Engineer', cost: 700, buildTime: 20, icon: '🔧' },
      { name: 'Medic', cost: 500, buildTime: 15, icon: '💉' },
      { name: 'Sniper', cost: 800, buildTime: 25, icon: '🎯' }
    ];

    this.renderUnitGrid(infantry, startX, startY, visibleHeight);
  }

  private renderVehicleButtons(startX: number, startY: number, visibleHeight: number): void {
    const vehicles = [
      { name: 'Tank', cost: 1200, buildTime: 30, icon: '🚀' },
      { name: 'APC', cost: 900, buildTime: 25, icon: '🚛' },
      { name: 'Artillery', cost: 1500, buildTime: 35, icon: '💥' }
    ];

    this.renderUnitGrid(vehicles, startX, startY, visibleHeight);
  }

  private renderDefenseButtons(startX: number, startY: number, visibleHeight: number): void {
    const defenses = [
      { name: 'Turret', cost: 600, buildTime: 20, icon: '🗼' },
      { name: 'AA Gun', cost: 800, buildTime: 25, icon: '🎯' },
      { name: 'Bunker', cost: 1000, buildTime: 30, icon: '🏰' }
    ];

    this.renderUnitGrid(defenses, startX, startY, visibleHeight);
  }

  private renderUnitGrid(units: Array<{ name: string; cost: number; buildTime: number; icon: string }>, 
                        startX: number, startY: number, visibleHeight: number): void {
    const columns = 2;
    const gridWidth = this.SIDEBAR_WIDTH;
    const cellWidth = gridWidth / columns;
    const cellHeight = this.GRID_SIZE;
    const cellPadding = 5;

    for (let i = 0; i < units.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + col * cellWidth + cellPadding;
      const y = startY + row * cellHeight + this.scrollY + cellPadding;
      const effectiveWidth = cellWidth - (cellPadding * 2);
      const effectiveHeight = cellHeight - (cellPadding * 2);

      if (y < startY - this.GRID_SIZE || y > startY + visibleHeight) continue;

      const unit = units[i];
      
      this.p.fill(20);
      this.p.noStroke();
      this.p.rect(x, y, effectiveWidth, effectiveHeight, 4);

      // Hover effect
      const isHovered = this.p.mouseX > x && this.p.mouseX < x + effectiveWidth &&
                       this.p.mouseY > y && this.p.mouseY < y + effectiveHeight;
      if (isHovered) {
        this.p.fill(30);
        this.p.rect(x, y, effectiveWidth, effectiveHeight, 4);
      }

      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.textSize(32);
      this.p.fill(255);
      this.p.text(unit.icon, x + effectiveWidth / 2, y + effectiveHeight / 2 - 15);

      this.p.fill(200);
      this.p.textSize(12);
      this.p.text(unit.name, x + effectiveWidth / 2, y + effectiveHeight - 30);
      
      this.p.textSize(10);
      this.p.fill(180);
      this.p.text(`$${unit.cost}`, x + effectiveWidth / 2 - 15, y + effectiveHeight - 15);
      this.p.text(`⏱️${unit.buildTime}s`, x + effectiveWidth / 2 + 15, y + effectiveHeight - 15);
    }
  }
}