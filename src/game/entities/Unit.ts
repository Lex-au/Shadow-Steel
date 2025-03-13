import p5 from 'p5';
import { Vector } from '../utils/Vector';
import { Entity } from './Entity';
import { GameState } from '../state/GameState';

export class Unit implements Entity {
  id: string;
  position: Vector;
  health: number;
  maxHealth: number;
  isHovered: boolean = false;
  target: Vector | null = null;
  playerId: string;
  isHalted: boolean = false;
  private speed = 2;
  private size = 24;

  constructor(position: Vector, playerId: string, private gameState: GameState) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = position;
    this.playerId = playerId;
    this.maxHealth = 100;
    this.health = this.maxHealth;
  }

  public update(): void {
    // Check for halt command
    if (this.gameState.keyPressed === 72 && // 'H' key
        this.gameState.selectedEntities.includes(this)) {
      this.target = null;
      this.isHalted = true;
      return;
    }

    if (this.target && !this.isHalted) {
      // Move towards target
      const direction = this.target.subtract(this.position).normalize();
      const nextPosition = this.position.add(direction.multiply(this.speed));
      
      // Check if we've reached the target
      if (this.position.distance(this.target) < this.speed) {
        this.position = this.target;
        this.target = null;
      } else {
        // Only move if the next position is passable
        if (this.gameState.map.isPassable(nextPosition)) {
          this.position = nextPosition;
        } else {
          this.target = null; // Cancel movement if blocked
        }
      }
    }
  }

  public render(p: p5): void {
    p.push();
    p.translate(this.position.x, this.position.y);

    // Draw shadow
    p.fill(0, 0, 0, 30);
    p.noStroke();
    p.ellipse(this.size/2, this.size * 0.9, this.size * 0.8, this.size * 0.3);

    // Draw unit emoji
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);
    p.fill(255);
    p.noStroke();
    p.text('👤', this.size/2, this.size/2);

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
      
      if (isSelected || this.isHovered) {
        p.fill(255);
        p.textSize(10);
        p.text(`${Math.ceil(this.health)}/${this.maxHealth}`, this.size/2, -20);
      }
    }

    p.pop();
  }

  public setTarget(target: Vector): void {
    this.isHalted = false;
    this.target = target;
  }

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  public isAlive(): boolean {
    return this.health > 0;
  }
}