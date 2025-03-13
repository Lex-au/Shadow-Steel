import p5 from 'p5';
import { GameState } from '../state/GameState';
import { RenderSystem } from '../systems/RenderSystem';
import { InputSystem } from '../systems/InputSystem';
import { UnitSystem } from '../systems/UnitSystem';
import { ResourceSystem } from '../systems/ResourceSystem';
import { MapSystem } from '../systems/MapSystem';
import { UISystem } from '../systems/UISystem';

export class GameEngine {
  private p: p5;
  private gameState: GameState;
  public systems: {
    render: RenderSystem;
    input: InputSystem;
    units: UnitSystem;
    resources: ResourceSystem;
    map: MapSystem;
    ui: UISystem;
  };

  constructor(p: p5) {
    this.p = p;
    this.gameState = new GameState(p);
    
    // Initialize all systems
    this.systems = {
      render: new RenderSystem(p, this.gameState),
      input: new InputSystem(p, this.gameState),
      units: new UnitSystem(this.gameState),
      resources: new ResourceSystem(this.gameState),
      map: new MapSystem(this.gameState),
      ui: new UISystem(p, this.gameState)
    };
    
    // Assign systems after initialization
    this.gameState.systems = this.systems;
  }

  public update(): void {
    // Update game logic
    this.systems.input.update();
    this.systems.units.update();
    this.systems.resources.update();
    this.systems.map.update();
    
    // Render last
    this.systems.render.update();
    this.systems.ui.update();
  }
}