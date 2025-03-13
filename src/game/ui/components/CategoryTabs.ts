import p5 from 'p5';
import { UIComponent, Dimensions } from '../types';
import { GameState } from '../../state/GameState';

export type Category = 'construction' | 'infantry' | 'vehicles' | 'defense';

interface CategoryDefinition {
  id: Category;
  label: string;
  icon: string;
}

export class CategoryTabs implements UIComponent {
  private categories: CategoryDefinition[] = [
    { id: 'construction', label: 'Construction', icon: '🏗️' },
    { id: 'infantry', label: 'Infantry', icon: '👥' },
    { id: 'vehicles', label: 'Vehicles', icon: '🚛' },
    { id: 'defense', label: 'Defense', icon: '🛡️' }
  ];

  private selectedCategory: Category = 'construction';

  constructor(
    private p: p5,
    private gameState: GameState,
    private dimensions: Dimensions
  ) {}

  public render(): void {
    const tabWidth = this.dimensions.width / 2;
    const tabHeight = this.dimensions.height / 2;

    this.categories.forEach((category, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = this.dimensions.x + (col * tabWidth);
      const y = this.dimensions.y + (row * tabHeight);

      this.renderTab(category, x, y, tabWidth, tabHeight);
    });
  }

  private renderTab(
    category: CategoryDefinition,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const isSelected = this.selectedCategory === category.id;
    const isHovered = this.isTabHovered(x, y, width, height);

    // Background
    this.p.fill(isSelected ? 40 : isHovered ? 30 : 20);
    this.p.noStroke();
    this.p.rect(x, y, width, height);

    // Icon and label
    this.p.fill(255);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    
    // Icon
    this.p.textSize(16);
    this.p.text(category.icon, x + width / 2 - 20, y + height / 2);
    
    // Label
    this.p.textSize(11);
    this.p.text(category.label, x + width / 2 + 10, y + height / 2);

    // Handle click
    if (isHovered && this.p.mouseIsPressed) {
      this.selectedCategory = category.id;
    }
  }

  private isTabHovered(x: number, y: number, width: number, height: number): boolean {
    return this.p.mouseX >= x && this.p.mouseX < x + width &&
           this.p.mouseY >= y && this.p.mouseY < y + height;
  }

  public getSelectedCategory(): Category {
    return this.selectedCategory;
  }
}