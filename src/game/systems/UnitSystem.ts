import { GameState } from '../state/GameState';

export class UnitSystem {
  constructor(private gameState: GameState) {}

  public update(): void {
    // Update all units
    this.gameState.units.forEach(unit => {
      unit.update();
    });
  }
}