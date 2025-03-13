import p5 from 'p5';
import { Vector } from '../utils/Vector';
import { Entity } from './Entity';
import { Harvester } from './Harvester';
import { BuildingDefinition } from '../factions/buildings';
import { GameState } from '../state/GameState';

export class Building implements Entity {
  id: string;
  position: Vector;
  health: number;
  maxHealth: number;
  isHovered: boolean = false;
  definition: BuildingDefinition;
  playerId: string;
  private harvester: Entity | null = null;
  private size = 48; // Base size for buildings
  private color: string;

  constructor(
    position: Vector,
    definition: BuildingDefinition,
    playerId: string,
    private gameState: GameState
  ) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = position;
    this.definition = definition;
    this.playerId = playerId;
    // Set health based on building type
    this.maxHealth = this.getBaseHealth();
    this.health = this.maxHealth;
    this.color = '#4a6fa5'; // Base color for Raven faction
    
    // Spawn harvester for refineries
    if (definition.name === 'Refinery') {
      this.spawnHarvester();
    }
  }

  private spawnHarvester(): void {
    const spawnOffset = new Vector(this.position.x + 60, this.position.y);
    const harvester = new Harvester(spawnOffset, this.playerId, this, this.gameState);
    this.gameState.units.push(harvester);
    this.harvester = harvester;
  }

  private getBaseHealth(): number {
    switch (this.definition.name) {
      case 'Power Plant':
        return 200;
      case 'Barracks':
        return 400;
      case 'Factory':
        return 800;
      case 'Turret':
        return 600;
      case 'Radar':
        return 500;
      case 'Lab':
        return 600;
      case 'Refinery':
        return 800;
      case 'Silo':
        return 150;
      default:
        return 300;
    }
  }

  public update(): void {
    // Check if building should be operational
    if (this.definition.name === 'Radar' && this.gameState.isPowerShortage) {
      this.health = Math.min(this.health, 1); // Keep radar at 1 HP when unpowered
    } else if (this.definition.name === 'Radar' && !this.gameState.isPowerShortage && this.health === 1) {
      this.health = this.maxHealth; // Restore radar when power is back
    }
  }

  public render(p: p5): void {
    p.push();
    
    p.translate(this.position.x, this.position.y);

    // Draw shadow
    p.fill(0, 0, 0, 30);
    p.noStroke();
    p.ellipse(this.size/2, this.size * 0.9, this.size * 0.8, this.size * 0.3);

    // Draw building emoji
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);
    p.fill(255);
    p.noStroke();
    
    // Show disabled state for radar when there's power shortage
    if (this.definition.name === 'Radar' && this.gameState.isPowerShortage) {
      p.fill(100); // Dim the emoji to show disabled state
    }
    
    const emoji = this.getBuildingEmoji();
    p.text(emoji, this.size/2, this.size/2);

    // Health bar
    const isSelected = this.gameState.selectedEntities.includes(this);
    const shouldShowHealth = this.health < this.maxHealth || isSelected || this.isHovered;
    
    if (shouldShowHealth) {
      const healthWidth = (this.size * 0.8) * (this.health / this.maxHealth);
      
      // Health bar background
      p.fill(0, 0, 0, 100);
      p.rect(this.size * 0.1, -10, this.size * 0.8, 4, 1);
      
      // Health bar fill
      const healthPercent = this.health / this.maxHealth;
      const healthColor = p.lerpColor(
        p.color(255, 50, 50),
        p.color(50, 255, 50),
        healthPercent
      );
      p.fill(healthColor);
      p.rect(this.size * 0.1, -10, healthWidth, 4, 1);
      
      // Show health text if selected or hovered
      if (isSelected || this.isHovered) {
        p.fill(255);
        p.textSize(10);
        p.text(`${Math.ceil(this.health)}/${this.maxHealth}`, this.size/2, -20);
      }
    }

    p.pop();
  }

  private getBuildingEmoji(): string {
    switch (this.definition.name) {
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

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) {
      this.gameState.removePowerFromBuilding(this);
    }
  }

  public isAlive(): boolean {
    return this.health > 0;
  }
}