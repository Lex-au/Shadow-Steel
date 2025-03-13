import { GameState } from '../state/GameState';

export class MapSystem {
  constructor(private gameState: GameState) {}

  public update(): void {
    // Update map-related logic
    this.gameState.map.update();
  }
}