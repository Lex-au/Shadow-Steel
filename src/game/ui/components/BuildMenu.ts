import p5 from 'p5';
import { UIComponent, Dimensions } from '../types';
import { GameState } from '../../state/GameState';
import { CategoryTabs } from './CategoryTabs';
import { BuildGrid } from './BuildGrid';

export class BuildMenu implements UIComponent {
  private categoryTabs: CategoryTabs;
  private buildGrid: BuildGrid;
  private scrollY: number = 0;

  constructor(
    private p: p5,
    private gameState: GameState,
    private dimensions: Dimensions
  ) {
    this.categoryTabs = new CategoryTabs(p, gameState, {
      x: dimensions.x,
      y: dimensions.y,
      width: dimensions.width,
      height: 80
    });

    this.buildGrid = new BuildGrid(p, gameState, {
      x: dimensions.x,
      y: dimensions.y + 80,
      width: dimensions.width,
      height: dimensions.height - 80
    });
  }

  public render(): void {
    this.categoryTabs.render();
    this.buildGrid.render();
  }

  public update(): void {
    this.buildGrid.update();
  }
}