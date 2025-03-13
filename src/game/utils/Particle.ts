export type ParticleType = 'smoke' | 'glow';

export class Particle {
  private life: number;
  private alpha: number;
  private size: number;
  private velocity: { x: number; y: number };
  private type: ParticleType;

  constructor(
    private p: p5,
    private x: number,
    private y: number,
    type: ParticleType = 'glow',
    private maxLife: number = 60
  ) {
    this.type = type;
    this.life = maxLife;
    this.alpha = 255;
    
    if (type === 'smoke') {
      this.size = p.random(10, 20);
      this.velocity = {
        x: p.random(-1, 1),
        y: p.random(-2, -1)
      };
    } else {
      this.size = p.random(5, 10);
      this.velocity = {
        x: p.random(-0.2, 0.2),
        y: p.random(-0.2, 0.2)
      };
    }
  }

  update(): boolean {
    this.life--;
    this.alpha = (this.life / this.maxLife) * 255;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    if (this.type === 'smoke') {
      this.size *= 1.03; // Smoke expands
    } else {
      this.size *= 0.99; // Glow shrinks slightly
    }
    
    return this.life > 0;
  }

  render(): void {
    this.p.push();
    this.p.noStroke();
    if (this.type === 'smoke') {
      this.p.fill(180, 180, 180, this.alpha);
    } else {
      this.p.fill(64, 156, 255, this.alpha);
    }
    this.p.circle(this.x + 24, this.y + 24, this.size);
    this.p.pop();
  }
}