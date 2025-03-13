import p5 from 'p5';
import { UIComponent, Dimensions } from '../types';

export class OptionsBar implements UIComponent {
  constructor(
    private p: p5,
    private dimensions: Dimensions
  ) {}

  public render(): void {
    this.p.push();
    
    // Modern glass effect background
    this.p.drawingContext.save();
    this.p.fill(UI_CONSTANTS.EFFECTS.GLASS.BACKGROUND);
    this.p.stroke(UI_CONSTANTS.COLORS.BORDER);
    this.p.strokeWeight(1);
    this.p.rect(
      this.dimensions.x,
      this.dimensions.y,
      this.dimensions.width,
      this.dimensions.height,
      UI_CONSTANTS.SIZES.BORDER_RADIUS.MD
    );

    // Command buttons
    const commands = [
      { key: 'ESC', label: 'Menu' },
      { key: 'H', label: 'Halt' },
      { key: 'B', label: 'Build' }
    ];

    let x = this.dimensions.x + UI_CONSTANTS.SPACING.MD;
    const y = this.dimensions.y + this.dimensions.height / 2;

    // Label
    this.p.fill(UI_CONSTANTS.COLORS.TEXT_DIM);
    this.p.textAlign(this.p.LEFT, this.p.CENTER);
    this.p.textSize(UI_CONSTANTS.FONTS.SIZES.SM);
    this.p.text('Options:', x, y);
    x += 60;

    // Command buttons
    commands.forEach(cmd => {
      // Key background
      this.p.fill(UI_CONSTANTS.COLORS.BACKGROUND_LIGHT);
      this.p.stroke(UI_CONSTANTS.COLORS.BORDER_LIGHT);
      this.p.rect(x, y - 10, 30, 20, UI_CONSTANTS.SIZES.BORDER_RADIUS.SM);

      // Key text
      this.p.fill(UI_CONSTANTS.COLORS.ACCENT_LIGHT);
      this.p.noStroke();
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.textSize(UI_CONSTANTS.FONTS.SIZES.SM);
      this.p.textStyle(UI_CONSTANTS.FONTS.WEIGHTS.MEDIUM);
      this.p.text(cmd.key, x + 15, y);

      // Label
      this.p.fill(UI_CONSTANTS.COLORS.TEXT_DIM);
      this.p.textAlign(this.p.LEFT, this.p.CENTER);
      this.p.textStyle(UI_CONSTANTS.FONTS.WEIGHTS.NORMAL);
      this.p.text(cmd.label, x + 40, y);

      x += 100;
    });

    this.p.drawingContext.restore();
    this.p.pop();
  }
}