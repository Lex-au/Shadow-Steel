import p5 from 'p5';
import { UIComponent, Dimensions } from '../types';
import { GameState } from '../../state/GameState';
import { ResourcePanel } from './ResourcePanel';
import { BuildMenu } from './BuildMenu';

export class Sidebar implements UIComponent {
  private resourcePanel: ResourcePanel;
  private buildMenu: BuildMenu;
  private dimensions: Dimensions;

  constructor(
    private p: p5,
    private gameState: GameState,
    x: number,
    width: number
  ) {
    this.dimensions = {
      x,
      y: 0,
      width,
      height: p.height
    };

    this.resourcePanel = new ResourcePanel(p, gameState, {
      x,
      y: 0,
      width,
      height: 50
    });

    this.buildMenu = new BuildMenu(p, gameState, {
      x,
      y: 50,
      width,
      height: p.height - 50
    });
  }

  public render(): void {
    // Render sidebar background
    this.p.fill(20);
    this.p.noStroke();
    this.p.rect(
      this.dimensions.x,
      this.dimensions.y,
      this.dimensions.width,
      this.dimensions.height
    );

    // Render components
    this.resourcePanel.render();
    this.buildMenu.render();
  }

  public update(): void {
    this.buildMenu.update();
  }
}