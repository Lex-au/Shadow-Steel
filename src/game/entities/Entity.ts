import { Vector } from '../utils/Vector';

export interface Entity {
  id: string;
  position: Vector;
  health: number;
  maxHealth: number;
  playerId: string;
  isHovered?: boolean;
  
  update(): void;
  render(p: p5): void;
  takeDamage(amount: number): void;
  isAlive(): boolean;
  setTarget?(target: Vector): void;
  target?: Vector;
}