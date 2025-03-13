import p5 from 'p5';
import { Vector } from '../utils/Vector';
import { Entity } from './Entity';
import { GameState } from '../state/GameState';
import { Particle } from '../utils/Particle';
import { CrystalNode } from './CrystalNode';

export class Resource implements Entity {
  id: string;
  position: Vector;
  health: number;
  maxHealth: number;
  isHovered: boolean = false;
  playerId: string = 'neutral';
  public value: number;
  private size = 48;
  private glowParticles: Particle[] = [];
  private glowIntensity: number = 0;
  private glowDirection: number = 1;
  private pulseSize: number = 0;
  private pulseGrowing: boolean = true;
  public parentNode: CrystalNode;
  private regrowthProgress: number = 0;
  private readonly REGROWTH_TIME = 300; // 5 seconds at 60fps
  private readonly REGEN_AMOUNT = 100; // Amount to regenerate per cycle

  constructor(position: Vector, parentNode: CrystalNode, private gameState: GameState) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = position;
    this.parentNode = parentNode;
    
    // Initialize resource values
    this.maxHealth = 1000;
    this.health = this.maxHealth;
    this.value = 1; // Each health point is worth 1 crystal
    
    // Create initial glow particles
    this.createGlowParticles();
  }

  private createGlowParticles(): void {
    const particleCount = 2;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const radius = this.size / 3;
      this.glowParticles.push(
        new Particle(
          this.gameState.p,
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          'glow',
          'glow',
          120
        )
      );
    }
  }

  public update(): void {
    // Handle regrowth if depleted
    if (!this.isAlive()) {
      if (this.parentNode.isAlive()) {
        this.regrowthProgress++;
        if (this.regrowthProgress >= this.REGROWTH_TIME) {
          this.health = this.REGEN_AMOUNT;
          this.regrowthProgress = 0;
        }
      }
    } else {
      // Regenerate while alive but not full
      if (this.health < this.maxHealth && this.parentNode.isAlive()) {
        this.health = Math.min(this.maxHealth, this.health + 1); // Slower regeneration
      }
    }

    // Update glow effect
    this.glowIntensity += 0.05 * this.glowDirection;
    if (this.glowIntensity >= 1) {
      this.glowDirection = -1;
    } else if (this.glowIntensity <= 0) {
      this.glowDirection = 1;
    }

    // Update pulse animation
    if (this.pulseGrowing) {
      this.pulseSize += 0.1;
      if (this.pulseSize >= 1) this.pulseGrowing = false;
    } else {
      this.pulseSize -= 0.1;
      if (this.pulseSize <= 0) this.pulseGrowing = true;
    }

    // Update particles
    this.glowParticles = this.glowParticles.filter(particle => {
      const isAlive = particle.update();
      if (!isAlive) {
        // Replace dead particles
        const angle = Math.random() * Math.PI * 2;
        const radius = this.size / 3;
        return new Particle(
          this.gameState.p,
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          120
        );
      }
      return particle;
    });
  }

  public render(p: p5): void {
    p.push();
    p.translate(this.position.x, this.position.y);

    if (this.isAlive()) {
      // Draw connection line to parent node
      const parentCenter = this.parentNode.position.add(new Vector(24, 24));
      const thisCenter = this.position.add(new Vector(24, 24));
      p.stroke(100, 180, 255, 30);
      p.strokeWeight(1);
      p.line(
        thisCenter.x - this.position.x,
        thisCenter.y - this.position.y,
        parentCenter.x - this.position.x,
        parentCenter.y - this.position.y
      );

      // Draw pulsing glow
      const glowSize = 20 + this.pulseSize * 10;
      p.fill(64, 156, 255, 30);
      p.noStroke();
      p.circle(this.size/2, this.size/2, glowSize);

      // Draw blue dot
      p.fill(100, 180, 255);
      p.noStroke();
      p.circle(this.size/2, this.size/2, 12);

      // Draw inner highlight
      p.fill(200, 220, 255);
      p.circle(this.size/2 - 2, this.size/2 - 2, 4);
    } else {
      // Draw regrowth progress
      p.noFill();
      p.stroke(100, 180, 255, 100);
      p.strokeWeight(2);
      p.arc(
        this.size/2,
        this.size/2,
        this.size * 0.8,
        this.size * 0.8,
        0,
        (this.regrowthProgress / this.REGROWTH_TIME) * p.TWO_PI
      );
    }

    // Render glow particles
    this.glowParticles.forEach(particle => particle.render());

    // Health bar if damaged
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
        // Show both health and crystal value
        p.text(`${Math.ceil(this.health)}/${this.maxHealth}`, this.size/2, -20);
        // Show total crystal value (health * value per health point)
        p.textSize(14);
        p.fill('#4a9fff');
        p.text(`💎 ${Math.ceil(this.health * this.value)}`, this.size/2, -35);
      }
    }

    p.pop();
  }

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  public isAlive(): boolean {
    return this.health > 0 && this.parentNode.isAlive();
  }
}