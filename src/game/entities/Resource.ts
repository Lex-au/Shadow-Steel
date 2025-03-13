import p5 from 'p5';
import { Vector } from '../utils/Vector';
import { Entity } from './Entity';
import { GameState } from '../state/GameState';
import { Particle } from '../utils/Particle';
import { CrystalNode } from './CrystalNode';
import { UI_CONSTANTS } from '../ui/constants';

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
  private sparkAngle: number = Math.random() * Math.PI * 2;
  private sparkProgress: number = 0;
  private readonly SPARK_DURATION = 60;
  private readonly SPARK_INTERVAL = 120;
  private sparkTimer: number = Math.floor(Math.random() * this.SPARK_INTERVAL);
  private hoverScale: number = 1;
  private readonly HOVER_SCALE = 1.02;
  private readonly TRANSITION_SPEED = 0.1;

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
    
    // Initialize random spark angle
    this.sparkAngle = Math.random() * Math.PI * 2;
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

  private updateSparkEffect(): void {
    this.sparkTimer++;
    if (this.sparkTimer >= this.SPARK_INTERVAL) {
      this.sparkTimer = 0;
      this.sparkProgress = this.SPARK_DURATION;
      this.sparkAngle = Math.random() * Math.PI * 2;
    }
    
    if (this.sparkProgress > 0) {
      this.sparkProgress--;
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

    // Update spark effect
    this.updateSparkEffect();

    // Smooth hover transition
    const targetScale = this.isHovered ? this.HOVER_SCALE : 1;
    this.hoverScale += (targetScale - this.hoverScale) * this.TRANSITION_SPEED;

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
    
    // Apply hover scale
    p.translate(this.size/2, this.size/2);
    p.scale(this.hoverScale);
    p.translate(-this.size/2, -this.size/2);

    if (this.isAlive()) {
      // Draw connection line to parent node
      const parentCenter = this.parentNode.position.add(new Vector(24, 24));
      const thisCenter = this.position.add(new Vector(24, 24));
      
      // Enhanced connection line
      p.stroke(UI_CONSTANTS.COLORS.ACCENT);
      p.strokeWeight(2);
      p.drawingContext.setLineDash([5, 10]);
      p.drawingContext.lineDashOffset = -performance.now() / 50;
      p.line(
        thisCenter.x - this.position.x,
        thisCenter.y - this.position.y,
        parentCenter.x - this.position.x,
        parentCenter.y - this.position.y
      );
      p.drawingContext.setLineDash([]);

      // Draw energy flow along connection
      if (this.sparkProgress > 0) {
        const progress = 1 - (this.sparkProgress / this.SPARK_DURATION);
        const sparkX = Math.cos(this.sparkAngle) * (this.size/2) * progress;
        const sparkY = Math.sin(this.sparkAngle) * (this.size/2) * progress;
        
        p.drawingContext.shadowColor = UI_CONSTANTS.COLORS.ACCENT;
        p.drawingContext.shadowBlur = 15;
        p.stroke(UI_CONSTANTS.COLORS.ACCENT);
        p.strokeWeight(3);
        p.point(this.size/2 + sparkX, this.size/2 + sparkY);
        p.drawingContext.shadowBlur = 0;
      }

      // Modern glow effect
      const glowSize = 20 + this.pulseSize * 10;
      p.drawingContext.shadowColor = UI_CONSTANTS.COLORS.ACCENT;
      p.drawingContext.shadowBlur = 20;
      p.fill(UI_CONSTANTS.COLORS.ACCENT + '40');
      p.noStroke();
      p.circle(this.size/2, this.size/2, glowSize);

      // Core crystal with modern styling
      p.drawingContext.shadowColor = UI_CONSTANTS.COLORS.ACCENT;
      p.drawingContext.shadowBlur = 10;
      p.fill(UI_CONSTANTS.COLORS.BACKGROUND_LIGHT);
      p.stroke(UI_CONSTANTS.COLORS.ACCENT);
      p.strokeWeight(1);
      p.circle(this.size/2, this.size/2, 12);

      // Inner highlight
      p.fill(UI_CONSTANTS.COLORS.ACCENT_LIGHT);
      p.noStroke();
      p.circle(
        this.size/2 - 2,
        this.size/2 - 2,
        4
      );

      // Reset shadow
      p.drawingContext.shadowBlur = 0;

    } else {
      // Regrowth progress indicator
      const progress = this.regrowthProgress / this.REGROWTH_TIME;
      
      // Background track
      p.noFill();
      p.stroke(UI_CONSTANTS.COLORS.BACKGROUND_LIGHT);
      p.strokeWeight(4);
      p.arc(
        this.size/2,
        this.size/2,
        this.size * 0.8,
        this.size * 0.8,
        0,
        p.TWO_PI
      );

      // Progress indicator
      p.stroke(UI_CONSTANTS.COLORS.ACCENT);
      p.strokeWeight(4);
      p.drawingContext.shadowColor = UI_CONSTANTS.COLORS.ACCENT;
      p.drawingContext.shadowBlur = 10;
      p.arc(
        this.size/2,
        this.size/2,
        this.size * 0.8,
        this.size * 0.8,
        0,
        progress * p.TWO_PI
      );
      p.drawingContext.shadowBlur = 0;
    }

    // Render glow particles
    this.glowParticles.forEach(particle => particle.render());

    // Health bar if damaged
    const isSelected = this.gameState.selectedEntities.includes(this);
    const shouldShowHealth = this.health < this.maxHealth || isSelected || this.isHovered;
    
    if (shouldShowHealth) {
      const healthWidth = (this.size * 0.8) * (this.health / this.maxHealth);
      
      // Modern health bar background
      p.fill(UI_CONSTANTS.COLORS.BACKGROUND_LIGHT);
      p.noStroke();
      p.rect(this.size * 0.1, -10, this.size * 0.8, 4, 2);
      
      // Modern health bar fill with glow
      const healthPercent = this.health / this.maxHealth;
      p.drawingContext.shadowColor = UI_CONSTANTS.COLORS.ACCENT;
      p.drawingContext.shadowBlur = 8;
      p.fill(UI_CONSTANTS.COLORS.ACCENT);
      p.rect(this.size * 0.1, -10, healthWidth, 4, 2);
      p.drawingContext.shadowBlur = 0;
      
      if (isSelected || this.isHovered) {
        // Health text with modern styling
        p.fill(UI_CONSTANTS.COLORS.TEXT);
        p.textSize(10);
        p.textStyle(UI_CONSTANTS.FONTS.WEIGHTS.MEDIUM);
        // Show both health and crystal value
        p.text(`${Math.ceil(this.health)}/${this.maxHealth}`, this.size/2, -20);
        
        // Crystal value with accent color
        p.textSize(14);
        p.fill(UI_CONSTANTS.COLORS.ACCENT);
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