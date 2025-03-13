import p5 from 'p5';
import { UIComponent, Dimensions } from '../types';
import { GameState } from '../../state/GameState';

export class ResourcePanel implements UIComponent {
  constructor(
    private p: p5,
    private gameState: GameState,
    private dimensions: Dimensions
  ) {}

  public render(): void {
    this.p.push();
    
    // Modern glass effect background
    this.p.drawingContext.save();
    this.p.drawingContext.filter = 'blur(8px)';
    this.p.fill(UI_CONSTANTS.EFFECTS.GLASS.BACKGROUND);
    this.p.rect(
      this.dimensions.x,
      this.dimensions.y,
      this.dimensions.width,
      this.dimensions.height,
      UI_CONSTANTS.SIZES.BORDER_RADIUS.MD
    );
    this.p.drawingContext.restore();

    // Subtle border
    this.p.stroke(UI_CONSTANTS.COLORS.BORDER_LIGHT);
    this.p.strokeWeight(1);
    this.p.noFill();
    this.p.rect(
      this.dimensions.x,
      this.dimensions.y,
      this.dimensions.width,
      this.dimensions.height,
      UI_CONSTANTS.SIZES.BORDER_RADIUS.MD
    );

    // Resource info
    this.p.fill(UI_CONSTANTS.COLORS.TEXT);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(UI_CONSTANTS.FONTS.SIZES.LG);
    this.p.textStyle(UI_CONSTANTS.FONTS.WEIGHTS.SEMIBOLD);

    // Money
    const moneyColor = this.gameState.money >= 1000 ? UI_CONSTANTS.COLORS.SUCCESS : UI_CONSTANTS.COLORS.TEXT;
    this.p.fill(moneyColor);
    this.p.text(
      `💰 ${this.gameState.money.toLocaleString()}`,
      this.dimensions.x + this.dimensions.width / 4,
      this.dimensions.y + this.dimensions.height / 2
    );

    // Power
    const powerText = `⚡ ${this.gameState.powerUsed}/${this.gameState.powerGenerated}`;
    const powerColor = this.gameState.powerUsed > this.gameState.powerGenerated 
      ? UI_CONSTANTS.COLORS.ERROR 
      : this.gameState.powerUsed === this.gameState.powerGenerated
        ? UI_CONSTANTS.COLORS.WARNING
        : UI_CONSTANTS.COLORS.SUCCESS;
    this.p.fill(powerColor);
    this.p.text(
      powerText,
      this.dimensions.x + (this.dimensions.width * 3) / 4,
      this.dimensions.y + this.dimensions.height / 2
    );

    // Add subtle glow effect for power status
    if (this.gameState.powerUsed > this.gameState.powerGenerated) {
      this.p.drawingContext.shadowColor = UI_CONSTANTS.COLORS.ERROR;
      this.p.drawingContext.shadowBlur = 10;
    }

    this.p.pop();
  }
}