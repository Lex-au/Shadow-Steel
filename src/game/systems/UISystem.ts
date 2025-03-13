import p5 from 'p5';
import { GameState } from '../state/GameState';
import { BuildingDefinition, RAVEN_BUILDINGS } from '../factions/buildings';
import { TERRAIN_TYPES } from '../map/Terrain';

export class UISystem {
  // Configuration constants
  private readonly SIDEBAR_WIDTH = 200;
  private readonly MINIMAP_SIZE = 200;
  private readonly TAB_HEIGHT = 25;
  private readonly OPTIONS_BAR_HEIGHT = 26;
  private readonly GRID_SIZE = 95;
  private readonly GRID_GAP = 2.5;
  private readonly INFO_PANEL_HEIGHT = 50;
  private radarAngle = 0;
  private minimapBuffer: p5.Graphics | null = null;

  // UI State
  private selectedTab: 'construction' | 'units' = 'construction';
  private scrollY = 0;
  private isDragging = false;
  private isMinimapDragging = false;
  private hoveredBuildingDef: BuildingDefinition | null = null;
  private lastMouseY = 0;
  private overlayInfo: { building: BuildingDefinition; x: number; y: number } | null = null;

  constructor(private p: p5, private gameState: GameState) {
    this.setupInputHandlers();
    this.initializeMinimapBuffer();
  }

  private initializeMinimapBuffer(): void {
    this.minimapBuffer = this.p.createGraphics(this.MINIMAP_SIZE, this.MINIMAP_SIZE);
    this.updateTerrainBuffer();
  }

  private updateTerrainBuffer(): void {
    if (!this.minimapBuffer) return;
    
    // Clear the buffer completely before redrawing
    this.minimapBuffer.clear();
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
        return false; // Prevent default scrolling
      }
    };

    this.p.mousePressed = () => {
      if (this.isOverBuildMenu(this.p.mouseX, this.p.mouseY)) {
        this.isDragging = true;
        this.lastMouseY = this.p.mouseY;
        return;
      }

      const mapX = this.p.width - this.SIDEBAR_WIDTH;
      
      // Check if click is within minimap bounds
      if (this.p.mouseX >= mapX && this.p.mouseX <= mapX + this.MINIMAP_SIZE &&
          this.p.mouseY >= 0 && this.p.mouseY <= this.MINIMAP_SIZE) {
        
        // Only allow minimap interaction if radar exists
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
    
    // Center the camera on the clicked/dragged position
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
    const totalContentHeight = Math.ceil(RAVEN_BUILDINGS.length / 2) * (this.GRID_SIZE + this.GRID_GAP);
    const startY = this.MINIMAP_SIZE + this.INFO_PANEL_HEIGHT + this.TAB_HEIGHT;
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
    // Store any required building highlights we need to draw
    const requiredBuildingHighlights: { x: number; y: number }[] = [];
    
    this.renderSidebar();
    this.renderMinimap();
    if (this.isMinimapDragging) {
      this.updateMinimapPosition();
    }
    
    // Reset overlay info before rendering buttons
    this.overlayInfo = null;
    
    this.renderTabBar();
    this.renderBuildButtons(requiredBuildingHighlights);
    
    // Draw requirement highlights under everything else
    requiredBuildingHighlights.forEach(pos => {
      this.p.stroke('#fa4a4a');
      this.p.strokeWeight(2);
      this.p.noFill();
      this.p.rect(pos.x - 2, pos.y - 2, this.GRID_SIZE + 4, this.GRID_SIZE + 4, 6);
    });
    
    this.renderSelectionInfo();
    this.renderOptionsBar();
    
    // Render overlay last, on top of everything
    if (this.overlayInfo) {
      this.renderBuildingStatsOverlay(
        this.overlayInfo.building,
        this.overlayInfo.x,
        this.overlayInfo.y,
        requiredBuildingHighlights
      );
    }
  }

  private renderTabBar(): void {
    const x = this.p.width - this.SIDEBAR_WIDTH;
    const y = this.MINIMAP_SIZE + this.INFO_PANEL_HEIGHT;

    this.p.push();
    // Render each tab using a helper function
    this.renderTab(x, y, 'Construction', 'construction', 0);
    this.renderTab(x + this.SIDEBAR_WIDTH / 2, y, 'Units', 'units', 1);
    this.p.pop();
  }

  private renderTab(x: number, y: number, label: string, tab: 'construction' | 'units', index: number): void {
    // Check if mouse is over tab
    const isHovered = this.p.mouseX >= x && this.p.mouseX < x + this.SIDEBAR_WIDTH / 2 &&
                     this.p.mouseY >= y && this.p.mouseY < y + this.TAB_HEIGHT;
    
    // Handle click
    if (isHovered && this.p.mouseIsPressed && this.p.mouseButton === this.p.LEFT) {
      this.selectedTab = tab;
      this.scrollY = 0; // Reset scroll position when switching tabs
    }

    this.p.fill(this.selectedTab === tab ? 40 : 20);
    if (isHovered) this.p.fill(this.selectedTab === tab ? 50 : 30);
    this.p.noStroke();
    this.p.rect(x, y, this.SIDEBAR_WIDTH / 2, this.TAB_HEIGHT);

    this.p.fill(255);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(12);
    this.p.text(label, x + this.SIDEBAR_WIDTH / 4, y + this.TAB_HEIGHT / 2);
  }

  private renderBuildButtons(requiredBuildingHighlights: { x: number; y: number }[]): void {
    const startX = this.p.width - this.SIDEBAR_WIDTH;
    const startY = this.MINIMAP_SIZE + this.INFO_PANEL_HEIGHT + this.TAB_HEIGHT;
    const visibleHeight = this.p.height - startY - this.OPTIONS_BAR_HEIGHT - 4;

    // Handle scrolling
    this.handleScroll();

    this.p.push();
    this.p.fill(20);
    this.p.noStroke();
    this.p.rect(startX, startY, this.SIDEBAR_WIDTH, visibleHeight);

    this.p.beginShape();
    this.p.vertex(startX, startY);
    this.p.vertex(startX + this.SIDEBAR_WIDTH, startY);
    this.p.vertex(startX + this.SIDEBAR_WIDTH, startY + visibleHeight);
    this.p.vertex(startX, startY + visibleHeight);
    this.p.endShape(this.p.CLOSE);
    this.p.drawingContext.clip();

    if (this.selectedTab === 'construction') {
      // Render Raven faction building buttons
      for (let i = 0; i < RAVEN_BUILDINGS.length; i++) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = startX + this.GRID_GAP + col * (this.GRID_SIZE + this.GRID_GAP);
        const y = startY + this.GRID_GAP + row * (this.GRID_SIZE + this.GRID_GAP) + this.scrollY;

        if (y < startY - this.GRID_SIZE || y > startY + visibleHeight) continue;
        this.renderBuildingButton(x, y, RAVEN_BUILDINGS[i], requiredBuildingHighlights);
      }
    } else {
      // Render unit training options
      this.renderUnitButtons(startX, startY, visibleHeight);
    }
    this.p.pop();
  }

  private renderUnitButtons(startX: number, startY: number, visibleHeight: number): void {
    const units = [
      { name: 'Scout', cost: 400, buildTime: 15, icon: '👁️' },
      { name: 'Infantry', cost: 600, buildTime: 20, icon: '🔫' },
      { name: 'Heavy', cost: 800, buildTime: 25, icon: '🛡️' },
      { name: 'Engineer', cost: 700, buildTime: 20, icon: '🔧' },
      { name: 'Medic', cost: 500, buildTime: 15, icon: '💉' },
      { name: 'Sniper', cost: 800, buildTime: 25, icon: '🎯' }
    ];

    for (let i = 0; i < units.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = startX + this.GRID_GAP + col * (this.GRID_SIZE + this.GRID_GAP);
      const y = startY + this.GRID_GAP + row * (this.GRID_SIZE + this.GRID_GAP) + this.scrollY;

      if (y < startY - this.GRID_SIZE || y > startY + visibleHeight) continue;

      const unit = units[i];
      
      // Button background
      this.p.fill(30);
      this.p.noStroke();
      this.p.rect(x, y, this.GRID_SIZE, this.GRID_SIZE, 4);

      // Unit icon
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.textSize(32);
      this.p.text(unit.icon, x + this.GRID_SIZE / 2, y + this.GRID_SIZE / 2 - 15);

      // Unit info
      this.p.fill(200);
      this.p.textSize(12);
      this.p.text(unit.name, x + this.GRID_SIZE / 2, y + this.GRID_SIZE - 30);
      
      // Cost and build time
      this.p.textSize(10);
      this.p.text(`$${unit.cost}`, x + this.GRID_SIZE / 2 - 15, y + this.GRID_SIZE - 15);
      this.p.text(`⏱️${unit.buildTime}s`, x + this.GRID_SIZE / 2 + 15, y + this.GRID_SIZE - 15);
    }
  }

  private renderBuildingButton(x: number, y: number, building: BuildingDefinition, requiredBuildingHighlights: { x: number; y: number }[]): void {
    // Check if this building is selected for placement
    const isSelected = this.gameState.buildingToPlace === building;
    
    // Button background
    this.p.fill(isSelected ? 40 : 30);
    this.p.noStroke();
    this.p.rect(x, y, this.GRID_SIZE, this.GRID_SIZE, 4);

    // Check if mouse is over this button
    const isHovered = this.p.mouseX > x && this.p.mouseX < x + this.GRID_SIZE &&
                     this.p.mouseY > y && this.p.mouseY < y + this.GRID_SIZE;

    if (isHovered) {
      this.hoveredBuildingDef = building;
    }

    // Check if building is available based on tech tree
    const isAvailable = this.isBuildingAvailable(building);
    if (!isAvailable) {
      this.p.fill(0, 0, 0, 150);
      this.p.rect(x, y, this.GRID_SIZE, this.GRID_SIZE, 4);
    }

    // Building emoji icon
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(32);
    const emoji = this.getBuildingEmoji(building.name);
    this.p.fill(isAvailable ? 255 : 100);
    this.p.text(emoji, x + this.GRID_SIZE / 2, y + this.GRID_SIZE / 2 - 15);

    // Building info
    this.p.fill(isAvailable ? 200 : 100);
    this.p.noStroke();
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(10);
    this.p.text(building.name, x + this.GRID_SIZE / 2, y + this.GRID_SIZE - 30);
    
    // Cost and power usage
    this.p.textSize(10);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text(`$${building.cost}`, x + this.GRID_SIZE / 2 - 15, y + this.GRID_SIZE - 15);
    this.p.text(`⏱️${building.buildTime}s`, x + this.GRID_SIZE / 2 + 15, y + this.GRID_SIZE - 15);
    
    // Make button clickable
    if (this.p.mouseIsPressed && 
        this.p.mouseX > x && this.p.mouseX < x + this.GRID_SIZE &&
        this.p.mouseY > y && this.p.mouseY < y + this.GRID_SIZE &&
        isAvailable &&
        this.gameState.money >= building.cost) {
      this.gameState.buildingToPlace = building;
    }

    // Render stats overlay if hovered
    if (isHovered) {
      this.overlayInfo = {
        building,
        x: x + this.GRID_SIZE + 5,
        y
      };
    }
  }

  private isBuildingAvailable(building: BuildingDefinition): boolean {
    // If base is not deployed, no buildings are available
    if (!this.gameState.isBaseDeployed) return false;

    // Check if player can afford it
    if (this.gameState.money < building.cost) return false;
    
    // Power Plant is available as soon as base is deployed
    if (building.name === 'Power Plant') return true;
    
    // Check requirements for other buildings
    if (!building.requirements) return true;
    return building.requirements.every(req => {
      return this.gameState.buildings.some(b => 
        b.definition.name === req && 
        b.isAlive()
      );
    });
  }

  private renderBuildingStatsOverlay(building: BuildingDefinition, x: number, y: number, requiredBuildingHighlights: { x: number; y: number }[]): void {
    const padding = 10;
    const width = 200;
    const lineHeight = 20;
    const requirements = building.requirements || [];
    const height = 140 + (requirements.length > 0 ? lineHeight + 5 : 0);

    // Always position to the left of the button
    const adjustedX = x - width - this.GRID_SIZE - 10;
    
    // Adjust Y to stay in view
    const adjustedY = Math.min(
      Math.max(padding, y),
      this.p.height - height - padding
    );
    
    // Background
    this.p.fill(40);
    this.p.stroke(60);
    this.p.strokeWeight(2);
    
    // Draw shadow
    this.p.drawingContext.shadowBlur = 15;
    this.p.drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.p.rect(adjustedX, adjustedY, width, height, 4);
    this.p.drawingContext.shadowBlur = 0;
    
    // Draw pointer
    this.p.fill(40);
    this.p.noStroke();
    this.p.triangle(
      adjustedX + width,
      adjustedY + 20,
      adjustedX + width + 10,
      adjustedY + 25,
      adjustedX + width,
      adjustedY + 30
    );

    // Content
    this.p.noStroke();
    this.p.fill(255);
    this.p.textAlign(this.p.LEFT, this.p.TOP);
    this.p.textSize(14);
    this.p.textStyle(this.p.BOLD);
    this.p.text(building.name, adjustedX + padding, adjustedY + padding);
    this.p.textStyle(this.p.NORMAL);

    this.p.textSize(12);
    this.p.fill(180);
    let currentY = adjustedY + padding + lineHeight + 5;

    // Description
    this.p.fill(150);
    this.p.text(building.description, adjustedX + padding, currentY, width - padding * 2);
    currentY += lineHeight * 2;

    // Stats group
    this.p.fill(40);
    this.p.rect(adjustedX + padding - 2, currentY - 2, width - padding * 2 + 4, lineHeight * 3 + 4, 2);
    
    this.p.fill(180);
    this.p.text(`Cost: $${building.cost}`, adjustedX + padding, currentY);
    currentY += lineHeight;

    const powerText = building.powerUsage < 0 
      ? `Power Generation: +${-building.powerUsage}`
      : `Power Usage: ${building.powerUsage}`;
    this.p.text(powerText, adjustedX + padding, currentY);
    currentY += lineHeight;

    this.p.text(`Build Time: ${building.buildTime}s`, adjustedX + padding, currentY);
    currentY += lineHeight;

    // Requirements
    if (requirements.length > 0) {
      currentY += 5;
      this.p.fill(40);
      this.p.rect(adjustedX + padding - 2, currentY - 2, width - padding * 2 + 4, lineHeight * requirements.length + 4, 2);
      
      requirements.forEach((req, index) => {
        const hasReq = this.gameState.buildings.some(b => 
          b.definition.name === req && 
          b.isAlive()
        );
        
        this.p.fill(180);
        this.p.text('Requires:', adjustedX + padding, currentY);
        this.p.fill(hasReq ? '#4afa4a' : '#fa4a4a');
        
        // Draw lock icon for unavailable buildings
        if (!hasReq) {
          this.p.text('🔒', adjustedX + padding + 70, currentY);
        }
        
        this.p.text(req, adjustedX + padding + 95, currentY);
        currentY += lineHeight;
        
        // Highlight required building in the menu if it exists
        if (!hasReq) {
          const reqBuilding = RAVEN_BUILDINGS.find(b => b.name === req);
          if (reqBuilding) {
            const reqIndex = RAVEN_BUILDINGS.indexOf(reqBuilding);
            const reqCol = reqIndex % 2;
            const reqRow = Math.floor(reqIndex / 2);
            const reqX = this.p.width - this.SIDEBAR_WIDTH + this.GRID_GAP + reqCol * (this.GRID_SIZE + this.GRID_GAP);
            const reqY = this.MINIMAP_SIZE + this.INFO_PANEL_HEIGHT + this.TAB_HEIGHT + this.GRID_GAP + reqRow * (this.GRID_SIZE + this.GRID_GAP) + this.scrollY;
            
            // Store highlight position to draw later
            requiredBuildingHighlights.push({ x: reqX, y: reqY });
          }
        }
      });
    }
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

  private renderSidebar(): void {
    this.p.push();
    this.p.fill(20);
    this.p.noStroke();
    this.p.rect(this.p.width - this.SIDEBAR_WIDTH, 0, this.SIDEBAR_WIDTH, this.p.height);

    // Resource info panel background
    this.p.fill(30);
    this.p.rect(
      this.p.width - this.SIDEBAR_WIDTH,
      this.MINIMAP_SIZE,
      this.SIDEBAR_WIDTH,
      this.INFO_PANEL_HEIGHT
    );

    // Credits
    this.p.fill(200);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(14);
    const x = this.p.width - this.SIDEBAR_WIDTH;
    const infoY = this.MINIMAP_SIZE + this.INFO_PANEL_HEIGHT / 2;
    
    // Credits
    this.p.text(`💰 ${this.gameState.money.toLocaleString()}`, x + this.SIDEBAR_WIDTH / 4, infoY);
    
    // Power usage
    const powerText = `⚡ ${this.gameState.powerUsed}/${this.gameState.powerGenerated}`;
    const powerColor = this.gameState.powerUsed > this.gameState.powerGenerated ? '#ff4a4a' : '#ffffff';
    this.p.fill(powerColor);
    this.p.text(powerText, x + (this.SIDEBAR_WIDTH * 3) / 4, infoY);
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
    this.p.text('Options: [S]ave  [L]oad  [P]ause', 10, this.p.height - 15);
    this.p.pop();
  }

  private renderMinimap(): void {
    const x = this.p.width - this.SIDEBAR_WIDTH;
    const y = 0;
    const hasOperationalRadar = this.gameState.buildings.some(b => 
      b.definition.name === 'Radar' && 
      b.isAlive() && 
      !this.gameState.isPowerShortage
    );

    this.p.push();
    
    // Draw background
    this.p.fill(20);
    this.p.noStroke();
    this.p.rect(x, y, this.MINIMAP_SIZE, this.MINIMAP_SIZE);
    
    // Draw border
    this.p.stroke(40);
    this.p.strokeWeight(2);
    this.p.noFill();
    this.p.rect(x + 1, y + 1, this.MINIMAP_SIZE - 2, this.MINIMAP_SIZE - 2);
    
    // Draw terrain from buffer
    if (this.minimapBuffer) {
      this.p.image(this.minimapBuffer, x, y);
      
      // Redraw terrain buffer if it's empty (fixes flickering)
      if (!this.minimapBuffer.get(0, 0)[3]) {
        this.updateTerrainBuffer();
      }
    }
    
    if (hasOperationalRadar) {
      // Draw radar scan effect
      this.radarAngle = (this.radarAngle + 0.03) % (Math.PI * 2);
      const scanGradient = this.p.drawingContext.createConicGradient(
        this.radarAngle,
        x + this.MINIMAP_SIZE / 2,
        y + this.MINIMAP_SIZE / 2
      );
      scanGradient.addColorStop(0, 'rgba(0, 255, 0, 0.2)');
      scanGradient.addColorStop(0.1, 'rgba(0, 255, 0, 0)');
      this.p.drawingContext.fillStyle = scanGradient;
      this.p.rect(x, y, this.MINIMAP_SIZE, this.MINIMAP_SIZE);

      // Draw buildings
      this.gameState.buildings.forEach(building => {
        if (!building.isAlive()) return;
        const miniX = x + (building.position.x / this.gameState.map.worldWidth) * this.MINIMAP_SIZE;
        const miniY = y + (building.position.y / this.gameState.map.worldHeight) * this.MINIMAP_SIZE;
        
        // Larger, more visible buildings
        this.p.fill(building.playerId === 'player1' ? '#4a9fff' : '#ff4a4a');
        this.p.noStroke();
        this.p.rect(miniX - 3, miniY - 3, 6, 6);
      });

      // Draw units
      this.gameState.units.forEach(unit => {
        const miniX = x + (unit.position.x / this.gameState.map.worldWidth) * this.MINIMAP_SIZE;
        const miniY = y + (unit.position.y / this.gameState.map.worldHeight) * this.MINIMAP_SIZE;
        
        this.p.fill(unit.playerId === 'player1' ? '#4a9fff' : '#ff4a4a');
        this.p.noStroke();
        this.p.circle(miniX, miniY, 3);
      });

      // Draw viewport rectangle
      const viewX = x + (this.gameState.camera.position.x / this.gameState.map.worldWidth) * this.MINIMAP_SIZE;
      const viewY = y + (this.gameState.camera.position.y / this.gameState.map.worldHeight) * this.MINIMAP_SIZE;
      const viewW = (this.p.width / this.gameState.map.worldWidth) * this.MINIMAP_SIZE;
      const viewH = (this.p.height / this.gameState.map.worldHeight) * this.MINIMAP_SIZE;
      
      // More visible viewport rectangle
      this.p.noFill();
      this.p.stroke(255, 100);
      this.p.strokeWeight(1);
      this.p.rect(viewX, viewY, viewW, viewH);
    } else {
      // Show appropriate message based on radar state
      const radarExists = this.gameState.buildings.some(b => b.definition.name === 'Radar' && b.isAlive());
      const message = this.gameState.isPowerShortage && radarExists ? 'RADAR OFFLINE' : 'NO RADAR';
      
      this.p.fill(255, 100);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.textSize(14);
      this.p.text(message, x + this.MINIMAP_SIZE / 2, y + this.MINIMAP_SIZE / 2);
      
      // Draw fog of war effect
      this.p.fill(0, 0, 0, 25);
      this.p.noStroke();
      this.p.rect(x, y, this.MINIMAP_SIZE, this.MINIMAP_SIZE);
    }
    this.p.pop();
  }

  private renderSelectionInfo(): void {
    if (this.gameState.selectedEntities.length === 0) return;

    const x = this.p.width - this.SIDEBAR_WIDTH;
    const y = this.MINIMAP_SIZE + this.INFO_PANEL_HEIGHT + this.TAB_HEIGHT +
              (4 * ((this.SIDEBAR_WIDTH / 2) + this.GRID_GAP)) +
              10;
    this.p.push();
    this.p.fill(255);
    this.p.textAlign(this.p.LEFT, this.p.TOP);

    this.gameState.selectedEntities.forEach((entity, index) => {
      const health = `${entity.health}/${entity.maxHealth}`;
      this.p.text(`Unit ${index + 1} - Health: ${health}`, x, y + index * 20);
    });
    this.p.pop();
  }
}