import p5 from 'p5';
import { Vector } from '../utils/Vector';
import { Entity } from './Entity';
import { GameState } from '../state/GameState';
import { Particle } from '../utils/Particle';

export class MCV implements Entity {
  id: string;
  position: Vector;
  health: number;
  maxHealth: number;
  isHovered: boolean = false;
  playerId: string;
  isDeployed: boolean = false;
  private deploymentState: 'mobile' | 'deploying' | 'deployed' | 'undeploying' = 'mobile';
  private deploymentProgress: number = 0;
  private readonly DEPLOYMENT_TIME = 60; // frames
  private rotationAngle: number = 0;
  target: Vector | null = null;
  private smokeParticles: Particle[] = [];
  private size = 48;
  private lastClickTime = 0; 
  private readonly DOUBLE_CLICK_TIME = 300; // ms
  private speed = 1.5; // Slower than regular units
  private isHalted: boolean = false;

  constructor(position: Vector, playerId: string, private gameState: GameState) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = position;
    this.playerId = playerId;
    this.maxHealth = 1000; // MCV is tough
    this.health = this.maxHealth;
  }

  public update(): void {
    // Handle halt command
    if (this.gameState.keyPressed === 72 && // 'H' key
        this.gameState.selectedEntities.includes(this)) {
      this.target = null;
      this.isHalted = true;
      return;
    }

    // Handle deployment animation
    if (this.deploymentState === 'deploying') {
      this.deploymentProgress++;
      this.rotationAngle = (this.deploymentProgress / this.DEPLOYMENT_TIME) * Math.PI * 2;
      if (this.deploymentProgress >= this.DEPLOYMENT_TIME) {
        this.deploymentState = 'deployed';
        this.isDeployed = true;
        this.createSmokeEffect();
        this.gameState.setBaseDeployed(true);
        this.rotationAngle = 0;
      }
    } else if (this.deploymentState === 'undeploying') {
      this.deploymentProgress--;
      this.rotationAngle = (this.deploymentProgress / this.DEPLOYMENT_TIME) * Math.PI * 2;
      if (this.deploymentProgress <= 0) {
        this.deploymentState = 'mobile';
        this.isDeployed = false;
        this.createSmokeEffect();
        this.gameState.setBaseDeployed(false);
        this.rotationAngle = 0;
      }
    }

    // Only move if not deployed
    if (this.deploymentState === 'mobile' && this.target && !this.isHalted) {
      // Move towards target
      const direction = new Vector(
        this.target.x - this.position.x,
        this.target.y - this.position.y
      ).normalize();
      
      const nextPosition = new Vector(
        this.position.x + direction.x * this.speed,
        this.position.y + direction.y * this.speed
      );
      
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

    // Handle deployment via 'D' key
    if (this.gameState.selectedEntities.includes(this) &&
        this.gameState.keyPressed === 66) { // 'B' key
      this.target = null; // Stop movement before deploying
      this.isHalted = true; // Halt before deploying
      this.toggleDeployment();
    }
  }

  private createSmokeEffect(): void {
    // Create multiple smoke particles
    for (let i = 0; i < 8; i++) {
      const offsetX = Math.random() * 40 - 20;
      const offsetY = Math.random() * 40 - 20;
      this.smokeParticles.push(
        new Particle(
          this.gameState.p,
          offsetX,
          offsetY,
          'smoke',
          60 // Longer life for more visible effect
        )
      );
    }
  }

  public handleClick(): void {
    const now = Date.now();
    if (now - this.lastClickTime < this.DOUBLE_CLICK_TIME) {
      this.toggleDeployment();
    }
    this.lastClickTime = now;
  }

  private toggleDeployment(): void {
    // Only allow deployment changes when not moving and not in transition
    if (!this.target && (this.deploymentState === 'mobile' || this.deploymentState === 'deployed')) {
      this.createSmokeEffect();
      if (this.deploymentState === 'mobile') {
        this.deploymentState = 'deploying';
        this.deploymentProgress = 0;
      } else {
        this.deploymentState = 'undeploying';
        this.deploymentProgress = this.DEPLOYMENT_TIME;
      }
      this.target = null;
    }
  }

  public render(p: p5): void {
    p.push();
    p.translate(this.position.x, this.position.y);

    // Update and render particles relative to MCV position
    this.smokeParticles = this.smokeParticles.filter(particle => {
      const isAlive = particle.update();
      if (isAlive) particle.render();
      return isAlive;
    });

    // Draw shadow
    p.fill(0, 0, 0, 30);
    p.noStroke();
    p.ellipse(this.size/2, this.size * 0.9, this.size * 0.8, this.size * 0.3);

    // Draw MCV emoji
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);
    p.fill(255);
    p.noStroke();
    
    // Draw appropriate emoji based on deployment state
    let emoji = '🚛'; // Default mobile state
    if (this.deploymentState === 'deployed') {
      emoji = '🏗️';
    } else if (this.deploymentState === 'deploying' || this.deploymentState === 'undeploying') {
      // During transition, rotate the emoji based on progress
      p.rotate(this.rotationAngle);
      emoji = this.deploymentState === 'deploying' ? '🚛' : '🏗️';
    }
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
      
      if (isSelected || this.isHovered) {
        p.fill(255);
        p.textSize(10);
        p.text(`${Math.ceil(this.health)}/${this.maxHealth}`, this.size/2, -20);
      }
    }

    p.pop();
  }

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  public isAlive(): boolean {
    return this.health > 0;
  }

  public setTarget(target: Vector): void {
    if (this.deploymentState === 'mobile' && !this.isDeployed) {
      this.isHalted = false;
      this.target = target;
    }
  }
}