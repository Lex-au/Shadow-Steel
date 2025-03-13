import p5 from 'p5';
import { GameState } from '../state/GameState';
import { Vector } from '../utils/Vector';
import { RAVEN_BUILDINGS } from '../factions/buildings';
import { Entity } from '../entities/Entity';

export class InputSystem {
  private isDragging = false;
  private dragStart: Vector | null = null;
  private lastRightClick = 0;
  private hoveredBuilding: Building | null = null;
  private hoveredMCV: boolean = false;
  private mouseWasPressed = false;
  public selectionBox: { start: Vector; end: Vector } | null = null;
  private readonly SIDEBAR_WIDTH = 200;

  constructor(
    private p: p5,
    private gameState: GameState
  ) {}

  public update(): void {
    // Update camera position
    this.gameState.camera.update();

    // Reset hover states
    if (this.hoveredBuilding) {
      this.hoveredBuilding.isHovered = false;
      this.hoveredBuilding = null;
    }

    if (this.gameState.mcv) {
      this.gameState.mcv.isHovered = false;
    }
    
    // Check for building hover
    if (!this.isOverUI(this.p.mouseX, this.p.mouseY)) {
      const worldX = this.p.mouseX + this.gameState.camera.position.x;
      const worldY = this.p.mouseY + this.gameState.camera.position.y;
      
      // Check MCV hover
      if (this.gameState.mcv) {
        const mcv = this.gameState.mcv;
        if (worldX >= mcv.position.x && 
            worldX <= mcv.position.x + 48 &&
            worldY >= mcv.position.y && 
            worldY <= mcv.position.y + 48) {
          mcv.isHovered = true;
          this.hoveredMCV = true;
        }
      }

      // Handle keyboard input
      this.gameState.keyPressed = this.p.keyIsPressed ? this.p.keyCode : null;

      for (const building of this.gameState.buildings) {
        if (worldX >= building.position.x && 
            worldX <= building.position.x + 48 &&
            worldY >= building.position.y && 
            worldY <= building.position.y + 48) {
          building.isHovered = true;
          this.hoveredBuilding = building;
          break;
        }
      }
    }
    
    this.handleMouseInput();
    this.handleBuildingPlacement();
  }

  private handleBuildingPlacement(): void {
    if (this.gameState.buildingToPlace && this.p.mouseButton === this.p.LEFT && this.p.mouseIsPressed) {
      // Check if mouse is over UI elements
      const isOverUI = this.isOverUI(this.p.mouseX, this.p.mouseY);
      
      if (isOverUI) return;
      
      const worldX = this.p.mouseX + this.gameState.camera.position.x;
      const worldY = this.p.mouseY + this.gameState.camera.position.y;
      const position = new Vector(worldX, worldY);
      
      if (this.gameState.map.isBuildable(position)) {
        this.gameState.createBuilding(position, this.gameState.buildingToPlace, 'player1');
        this.gameState.buildingToPlace = null; // Reset after placement
      }
    }
  }

  private handleMouseInput(): void {
    // Update resource hover states
    const worldX = this.p.mouseX + this.gameState.camera.position.x;
    const worldY = this.p.mouseY + this.gameState.camera.position.y;
    
    this.gameState.resources.forEach(resource => {
      resource.isHovered = (
        worldX >= resource.position.x &&
        worldX <= resource.position.x + 48 &&
        worldY >= resource.position.y &&
        worldY <= resource.position.y + 48
      );
    });
    
    // Handle right-click to cancel building placement
    if (this.p.mouseIsPressed && this.p.mouseButton === this.p.RIGHT) {
      // Allow right-click cancel even when over UI
      const now = Date.now();
      if (now - this.lastRightClick > 200) { // Debounce to prevent multiple cancels
        this.gameState.buildingToPlace = null;
        this.lastRightClick = now;
      }
    }

    // Handle selection box dragging
    if (this.p.mouseIsPressed && this.p.mouseButton === this.p.LEFT) {
      if (!this.isDragging) {
        // Store initial click position
        this.mouseWasPressed = true;
        const worldX = this.p.mouseX + this.gameState.camera.position.x;
        const worldY = this.p.mouseY + this.gameState.camera.position.y;
        this.dragStart = new Vector(worldX, worldY);
        
        // Only start dragging if mouse moves
        if (this.p.movedX !== 0 || this.p.movedY !== 0) {
          this.isDragging = true;
        }
      } else if (this.isDragging) {
        // Update selection box
        const worldX = this.p.mouseX + this.gameState.camera.position.x;
        const worldY = this.p.mouseY + this.gameState.camera.position.y;
        this.selectionBox = {
          start: this.dragStart!,
          end: new Vector(worldX, worldY)
        };
        
        // Update selected entities based on box
        if (!this.isOverUI(this.p.mouseX, this.p.mouseY)) {
          this.updateSelectionFromBox();
        }
      }
    } else if (this.mouseWasPressed) {
      // Handle single click selection on mouse release
      if (!this.isOverUI(this.p.mouseX, this.p.mouseY) && !this.isDragging) {
        const worldPos = new Vector(
          this.p.mouseX + this.gameState.camera.position.x,
          this.p.mouseY + this.gameState.camera.position.y
        );
        const clickedEntity = this.getEntityAtPosition(worldPos.x, worldPos.y);
        
        if (clickedEntity) {
          if (!this.p.keyIsDown(this.p.SHIFT)) {
            this.gameState.selectedEntities = [clickedEntity];
          } else {
            // Add to selection if not already selected
            if (!this.gameState.selectedEntities.includes(clickedEntity)) {
              this.gameState.selectedEntities.push(clickedEntity);
            }
          }
          
          // Handle MCV double click for deployment
          if (clickedEntity === this.gameState.mcv) {
            this.gameState.mcv.handleClick();
          }
        } else if (!this.p.keyIsDown(this.p.SHIFT)) {
          // Clear selection if clicking empty space without shift
          this.gameState.selectedEntities = [];
        }
      }
      
      this.mouseWasPressed = false;
      this.isDragging = false;
      this.dragStart = null;
      this.selectionBox = null;
    }
    
    // Handle right-click movement command
    if (this.p.mouseIsPressed && this.p.mouseButton === this.p.RIGHT && !this.isOverUI(this.p.mouseX, this.p.mouseY)) {
      const worldX = this.p.mouseX + this.gameState.camera.position.x;
      const worldY = this.p.mouseY + this.gameState.camera.position.y;
      const target = new Vector(
        worldX,
        worldY
      );
      
      // Issue move command to selected units
      this.gameState.selectedEntities.forEach(entity => {
        if ('setTarget' in entity) {
          entity.setTarget(target);
        }
      });
    }
  }

  private getEntityAtPosition(x: number, y: number): Entity | null {
    // Check resources first
    for (const resource of this.gameState.resources) {
      if (x >= resource.position.x && x <= resource.position.x + 48 &&
          y >= resource.position.y && y <= resource.position.y + 48) {
        return resource;
      }
    }
    
    // Check MCV first
    if (this.gameState.mcv && 
        x >= this.gameState.mcv.position.x && 
        x <= this.gameState.mcv.position.x + 48 &&
        y >= this.gameState.mcv.position.y && 
        y <= this.gameState.mcv.position.y + 48) {
      return this.gameState.mcv;
    }
    
    // Then check units
    for (const unit of this.gameState.units) {
      if (x >= unit.position.x && x <= unit.position.x + 48 &&
          y >= unit.position.y && y <= unit.position.y + 48) {
        return unit;
      }
    }
    
    // Finally check buildings
    for (const building of this.gameState.buildings) {
      if (x >= building.position.x && x <= building.position.x + 48 &&
          y >= building.position.y && y <= building.position.y + 48) {
        return building;
      }
    }
    
    return null;
  }

  private updateSelectionFromBox(): void {
    if (!this.selectionBox) return;
    
    // Reset hover states
    this.gameState.resources.forEach(resource => resource.isHovered = false);
    
    const { start, end } = this.selectionBox;
    const left = Math.min(start.x, end.x);
    const right = Math.max(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const bottom = Math.max(start.y, end.y);
    
    // Get all entities in selection box
    const selectedEntities: Entity[] = [];
    
    // Check MCV
    if (this.gameState.mcv) {
      const mcv = this.gameState.mcv;
      if (this.isEntityInBox(mcv, left, right, top, bottom)) {
        selectedEntities.push(mcv);
      }
    }
    
    // Check units
    this.gameState.units.forEach(unit => {
      if (this.isEntityInBox(unit, left, right, top, bottom)) {
        selectedEntities.push(unit);
      }
    });
    
    // Update selection
    if (!this.p.keyIsDown(this.p.SHIFT)) {
      this.gameState.selectedEntities = [...selectedEntities];
    } else {
      // Add new entities to existing selection
      selectedEntities.forEach(entity => {
        if (!this.gameState.selectedEntities.includes(entity)) {
          this.gameState.selectedEntities.push(entity);
        }
      });
    }
  }

  private isEntityInBox(entity: Entity, left: number, right: number, top: number, bottom: number): boolean {
    return entity.position.x >= left && entity.position.x <= right &&
           entity.position.y >= top && entity.position.y <= bottom;
  }

  private handleKeyboardInput(): void {
    // Add keyboard controls here
  }

  private isOverUI(x: number, y: number): boolean {
    // Check if over sidebar
    if (x > this.p.width - this.SIDEBAR_WIDTH) return true;
    
    // Check if over bottom options bar
    if (y > this.p.height - 30) return true;
    
    return false;
  }
}