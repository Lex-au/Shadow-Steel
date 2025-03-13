import p5 from 'p5';
import { Vector } from '../utils/Vector';
import { Entity } from './Entity';
import { GameState } from '../state/GameState';
import { Resource } from './Resource';
import { Building } from './Building';

export class Harvester implements Entity {
  id: string;
  position: Vector;
  health: number;
  maxHealth: number;
  isHovered: boolean = false;
  target: Vector | null = null;
  playerId: string;
  isHalted: boolean = false;
  private speed = 1.8; // Slightly slower than regular units
  private size = 48;
  private currentLoad = 0;
  private readonly MAX_LOAD = 1000; // Maximum crystal capacity
  private harvestingResource: Resource | null = null;
  private homeRefinery: Building | null = null;
  private state: 'idle' | 'moving' | 'harvesting' | 'returning' = 'idle';
  private harvestRate = 5; // Amount of health harvested per frame

  constructor(
    position: Vector, 
    playerId: string, 
    refinery: Building,
    private gameState: GameState
  ) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = position;
    this.playerId = playerId;
    this.maxHealth = 200;
    this.health = this.maxHealth;
    this.homeRefinery = refinery;
    
    // Find nearest resource and start harvesting
    this.findNearestResource();
  }

  public update(): void {
    // Check for halt command
    if (this.gameState.keyPressed === 72 && // 'H' key
        this.gameState.selectedEntities.includes(this)) {
      this.target = null;
      this.isHalted = true;
      this.state = 'idle';
      return;
    }

    switch (this.state) {
      case 'idle':
        if (!this.isHalted) {
          this.findNearestResource();
        }
        break;

      case 'moving':
        if (this.target) {
          this.moveToTarget();
        }
        break;

      case 'harvesting':
        if (this.harvestingResource?.isAlive()) {
          this.harvest();
        } else {
          this.findNearestResource();
        }
        break;

      case 'returning':
        if (this.homeRefinery && this.homeRefinery.isAlive()) {
          if (this.position.distance(this.homeRefinery.position) < this.speed) {
            // Deposit resources
            // Convert harvested resources to money
            const moneyGained = Math.ceil(this.currentLoad);
            this.gameState.addMoney(moneyGained);
            
            // Show floating text for money gained
            this.showMoneyGained(moneyGained);
            
            // Reset load and continue harvesting
            this.currentLoad = 0;
            
            // Return to harvesting if not manually directed
            this.state = 'moving';
            this.findNearestResource();
          } else {
            this.moveToRefinery();
          }
        } else {
          const foundNewRefinery = this.findNewRefinery();
          if (!foundNewRefinery) {
            // If no refineries available, stay idle with resources
            this.state = 'idle';
            this.target = null;
          }
        }
        break;
    }
  }

  private moveToTarget(): void {
    if (!this.target) return;

    const direction = this.target.subtract(this.position).normalize();
    const nextPosition = this.position.add(direction.multiply(this.speed));
    
    if (this.position.distance(this.target) < this.speed) {
      this.position = this.target;
      this.target = null;

      // If we reached a resource, start harvesting
      if (this.harvestingResource && this.state === 'moving') {
        this.state = 'harvesting';
      }
    } else {
      if (this.gameState.map.isPassable(nextPosition)) {
        this.position = nextPosition;
      } else {
        this.target = null;
        this.state = 'idle';
      }
    }
  }

  private moveToRefinery(): void {
    if (!this.homeRefinery) return;
    
    const direction = this.homeRefinery.position.subtract(this.position).normalize();
    const nextPosition = this.position.add(direction.multiply(this.speed));
    
    if (this.gameState.map.isPassable(nextPosition)) {
      this.position = nextPosition;
    }
  }

  private harvest(): void {
    if (!this.harvestingResource?.isAlive()) {
      this.findNearestResource();
      return;
    }

    // Harvest resources
    const harvestAmount = Math.min(
      this.harvestRate,
      this.MAX_LOAD - this.currentLoad,
      this.harvestingResource.health
    );

    this.currentLoad += harvestAmount;
    this.harvestingResource.takeDamage(harvestAmount);

    // Return to refinery when full
    if (this.currentLoad >= this.MAX_LOAD) {
      this.state = 'returning';
      this.target = this.homeRefinery?.position || null;
    } else if (!this.harvestingResource.isAlive()) {
      // Find new resource if current one is depleted
      this.findNearestResource();
    }
  }

  private findNearestResource(): void {
    if (this.isHalted) return;

    let nearestResource: Resource | null = null;
    let shortestDistance = Infinity;

    for (const resource of this.gameState.resources) {
      if (!resource.isAlive()) continue;

      const distance = this.position.distance(resource.position);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestResource = resource;
      }
    }

    if (nearestResource) {
      this.harvestingResource = nearestResource;
      this.target = nearestResource.position;
      this.state = 'moving';
    } else {
      this.state = 'idle';
    }
  }

  private findNewRefinery(): boolean {
    const refineries = this.gameState.buildings.filter(b => 
      b.definition.name === 'Refinery' && 
      b.isAlive() &&
      b.playerId === this.playerId
    );

    if (refineries.length > 0) {
      // Sort refineries by distance
      refineries.sort((a, b) => {
        const distA = this.position.distance(a.position);
        const distB = this.position.distance(b.position);
        return distA - distB;
      });

      // Set nearest refinery as new home
      this.homeRefinery = refineries[0];
      this.target = this.homeRefinery.position;
      this.state = 'returning';
      return true;
    }
    return false;
  }

  public getHomeRefinery(): Building | null {
    // Public getter for UI/debugging purposes
    return this.homeRefinery;
  }

  public setHomeRefinery(refinery: Building): void {
    if (refinery.definition.name === 'Refinery' && refinery.isAlive()) {
      this.homeRefinery = refinery;
    }
  }

  public render(p: p5): void {
    p.push();
    p.translate(this.position.x, this.position.y);

    // Draw shadow
    p.fill(0, 0, 0, 30);
    p.noStroke();
    p.ellipse(this.size/2, this.size * 0.9, this.size * 0.8, this.size * 0.3);

    // Draw harvester emoji
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);
    p.fill(255);
    p.noStroke();
    p.text('🚚', this.size/2, this.size/2);

    // Draw load indicator
    if (this.currentLoad > 0) {
      const loadWidth = (this.size * 0.8) * (this.currentLoad / this.MAX_LOAD);
      // Background
      p.fill(0, 0, 0, 100);
      p.rect(this.size * 0.1, this.size - 8, this.size * 0.8, 4, 1);
      // Fill
      p.fill(64, 156, 255);
      p.rect(this.size * 0.1, this.size - 8, loadWidth, 4, 1);
      
      // Show load amount when hovered
      if (this.isHovered) {
        p.fill(255);
        p.textSize(10);
        p.text(`💎 ${Math.ceil(this.currentLoad)}/${this.MAX_LOAD}`, this.size/2, this.size - 15);
      }
    }

    // Health bar
    const isSelected = this.gameState.selectedEntities.includes(this);
    const shouldShowHealth = this.health < this.maxHealth || isSelected || this.isHovered;
    
    if (shouldShowHealth) {
      const healthWidth = (this.size * 0.8) * (this.health / this.maxHealth);
      
      p.fill(0, 0, 0, 100);
      p.rect(this.size * 0.1, -10, this.size * 0.8, 4, 1);
      
      const healthPercent = this.health / this.maxHealth;
      const healthColor = p.lerpColor(
        p.color(255, 50, 50),
        p.color(50, 255, 50),
        healthPercent
      );
      p.fill(healthColor);
      p.rect(this.size * 0.1, -10, healthWidth, 4, 1);
      
      if (isSelected || this.isHovered) {
        p.fill(255);
        p.textSize(10);
        p.text(`${Math.ceil(this.health)}/${this.maxHealth}`, this.size/2, -20);
      }
    }

    p.pop();
  }

  private showMoneyGained(amount: number): void {
    // Create floating text effect
    const p = this.gameState.p;
    const text = `+$${amount}`;
    const startY = this.position.y;
    let opacity = 255;
    let y = startY;
    
    const interval = setInterval(() => {
      if (opacity <= 0) {
        clearInterval(interval);
        return;
      }
      
      p.push();
      p.fill(74, 159, 255, opacity);
      p.textAlign(p.CENTER);
      p.textSize(14);
      p.text(text, this.position.x + 24, y);
      p.pop();
      
      y -= 1;
      opacity -= 5;
    }, 16);
  }

  public setTarget(target: Vector): void {
    // Check if clicking on a refinery
    const clickedRefinery = this.gameState.buildings.find(building => 
      building.definition.name === 'Refinery' &&
      building.isAlive() &&
      building.playerId === this.playerId &&
      target.x >= building.position.x &&
      target.x <= building.position.x + 48 &&
      target.y >= building.position.y &&
      target.y <= building.position.y + 48
    );

    if (clickedRefinery) {
      // Return to this refinery to deposit resources
      this.homeRefinery = clickedRefinery;
      this.target = clickedRefinery.position;
      this.state = 'returning';
      this.isHalted = false;
      return;
    }

    // Check if clicking on a resource
    const clickedResource = this.gameState.resources.find(resource => 
      target.x >= resource.position.x &&
      target.x <= resource.position.x + 48 &&
      target.y >= resource.position.y &&
      target.y <= resource.position.y + 48
    );

    if (clickedResource && clickedResource.isAlive()) {
      // Start harvesting this resource
      this.harvestingResource = clickedResource;
      this.target = clickedResource.position;
      this.state = 'moving';
      this.isHalted = false;
    } else if (clickedResource && !clickedResource.isAlive()) {
      // If resource is depleted, find a new one
      this.findNearestResource();
    } else {
      // Regular movement
      this.isHalted = false;
      this.target = target;
      this.state = 'moving';
      this.harvestingResource = null;
    }
  }

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  public isAlive(): boolean {
    return this.health > 0;
  }
}