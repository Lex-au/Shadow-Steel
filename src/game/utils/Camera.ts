import p5 from 'p5';
import { Vector } from './Vector';

export class Camera {
  public position: Vector;
  private speed = 10; // Reduced speed for finer control
  private lastMouseX = 0;
  private lastMouseY = 0;

  constructor(
    private p: p5,
    private gameState: GameState
  ) {
    this.position = new Vector(0, 0);
    this.lastMouseX = p.mouseX;
    this.lastMouseY = p.mouseY;
  }

  public update(): void {
    const maxX = this.gameState.map.worldWidth - this.p.width;
    const maxY = this.gameState.map.worldHeight - this.p.height;
    const SIDEBAR_WIDTH = 200;
    const isOverUI = this.p.mouseX > this.p.width - SIDEBAR_WIDTH;

    // Mouse drag scrolling with right button
    if (this.p.mouseIsPressed && this.p.mouseButton === this.p.RIGHT && !isOverUI) {
      const deltaX = this.p.mouseX - this.lastMouseX;
      const deltaY = this.p.mouseY - this.lastMouseY;
      
      this.position.x = Math.max(0, Math.min(maxX, this.position.x - deltaX));
      this.position.y = Math.max(0, Math.min(maxY, this.position.y - deltaY));
    }
    
    this.lastMouseX = this.p.mouseX;
    this.lastMouseY = this.p.mouseY;

    // Keyboard controls
    if (this.p.keyIsDown(this.p.LEFT_ARROW) || this.p.keyIsDown(65)) { // A
      this.position.x = Math.max(0, this.position.x - this.speed);
    }
    if (this.p.keyIsDown(this.p.RIGHT_ARROW) || this.p.keyIsDown(68)) { // D
      this.position.x = Math.min(maxX, this.position.x + this.speed);
    }
    if (this.p.keyIsDown(this.p.UP_ARROW) || this.p.keyIsDown(87)) { // W
      this.position.y = Math.max(0, this.position.y - this.speed);
    }
    if (this.p.keyIsDown(this.p.DOWN_ARROW) || this.p.keyIsDown(83)) { // S
      this.position.y = Math.min(maxY, this.position.y + this.speed);
    }
  }

  public begin(): void {
    this.p.push();
    this.p.translate(-this.position.x, -this.position.y);
  }

  public end(): void {
    this.p.pop();
  }
}