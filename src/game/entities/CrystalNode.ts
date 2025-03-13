import p5 from 'p5';
import { Vector } from '../utils/Vector';
import { Entity } from './Entity';
import { GameState } from '../state/GameState';
import { Particle } from '../utils/Particle';

export class CrystalNode implements Entity {
  id: string;
  position: Vector;
  health: number;
  maxHealth: number;
  isHovered: boolean = false;
  playerId: string = 'neutral';
  private size = 48;
  private glowParticles: Particle[] = [];
  private glowIntensity: number = 0;
  private glowDirection: number = 1;
  private rotationAngle: number = 0;

  constructor(position: Vector, private gameState: GameState) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = position;
    this.maxHealth = 2000;
    this.health = this.maxHealth;
    this.createGlowParticles();
  }

  private createGlowParticles(): void {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const radius = this.size / 2;
      this.glowParticles.push(
        new Particle(
          this.gameState.p,
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          'glow',
          'glow',
          180
        )
      );
    }
  }

  public update(): void {
    // Rotate the crystal
    this.rotationAngle += 0.01;

    // Update glow effect
    this.glowIntensity += 0.03 * this.glowDirection;
    if (this.glowIntensity >= 1) {
      this.glowDirection = -1;
    } else if (this.glowIntensity <= 0) {
      this.glowDirection = 1;
    }

    // Update particles
    this.glowParticles = this.glowParticles.filter(particle => {
      const isAlive = particle.update();
      if (!isAlive) {
        const angle = Math.random() * Math.PI * 2;
        const radius = this.size / 2;
        return new Particle(
          this.gameState.p,
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          180
        );
      }
      return particle;
    });
  }

  public render(p: p5): void {
    p.push();
    p.translate(this.position.x, this.position.y);

    // Draw large glow effect
    const glowColor = p.color(64, 156, 255, 30 + this.glowIntensity * 30);
    p.fill(glowColor);
    p.noStroke();
    p.circle(this.size/2, this.size/2, this.size * 2);

    // Draw core crystal
    p.push();
    p.translate(this.size/2, this.size/2);
    p.rotate(this.rotationAngle);
    
    // Main crystal shape
    p.fill(100, 180, 255);
    p.stroke(200, 220, 255);
    p.strokeWeight(2);
    
    // Draw hexagonal crystal
    p.beginShape();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const radius = this.size * 0.4;
      p.vertex(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      );
    }
    p.endShape(p.CLOSE);
    
    // Inner details
    p.stroke(200, 220, 255, 100);
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI) / 3;
      p.line(
        Math.cos(angle) * -this.size * 0.3,
        Math.sin(angle) * -this.size * 0.3,
        Math.cos(angle) * this.size * 0.3,
        Math.sin(angle) * this.size * 0.3
      );
    }
    p.pop();

    // Render glow particles
    this.glowParticles.forEach(particle => particle.render());

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

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  public isAlive(): boolean {
    return this.health > 0;
  }
}