import { Sidebar } from './components/Sidebar';
import { MenuSystem } from './MenuSystem';
import { MinimapSystem } from '../ui/MinimapSystem';
import { OptionsBar } from './components/OptionsBar';

export class UISystem {
  private readonly SIDEBAR_WIDTH = 200;
  private readonly OPTIONS_BAR_HEIGHT = 30;
  private sidebar: Sidebar;
  private menuSystem: MenuSystem;
  private minimapSystem: MinimapSystem;
  private optionsBar: OptionsBar;

  constructor(private p: p5, private gameState: GameState) {
    this.sidebar = new Sidebar(p, gameState, p.width - this.SIDEBAR_WIDTH, this.SIDEBAR_WIDTH);
    this.menuSystem = new MenuSystem(p, gameState);
    this.minimapSystem = new MinimapSystem(p, gameState, 200);
    this.optionsBar = new OptionsBar(p, {
      x: 0,
      y: p.height - this.OPTIONS_BAR_HEIGHT,
      width: p.width - this.SIDEBAR_WIDTH,
      height: this.OPTIONS_BAR_HEIGHT
    });
  }

  public update(): void {
    // Render main UI components
    this.sidebar.render();
    this.minimapSystem.render(this.p.width - this.SIDEBAR_WIDTH, 0);
    this.optionsBar.render();
    
    if (this.gameState.isMenuOpen) {
      this.menuSystem.render();
    }
  }
}