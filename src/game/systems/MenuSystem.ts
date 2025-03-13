import p5 from 'p5';
import { GameState } from '../state/GameState';
import { GAME_TRACKS } from '../config/tracks';

export class MenuSystem {
  private readonly MENU_WIDTH = 400;
  private readonly MENU_PADDING = 20;
  private readonly BUTTON_COOLDOWN = 500; // ms
  private lastClickTime: number = 0;
  private lastButtonClickTime: number = 0;

  constructor(private p: p5, private gameState: GameState) {}

  public render(): void {
    if (!this.gameState.isMenuOpen) return;

    const x = (this.p.width - this.MENU_WIDTH) / 2;
    const y = (this.p.height - 400) / 2;
    
    this.p.fill(20);
    this.p.stroke(40);
    this.p.strokeWeight(2);
    this.p.rect(x, y, this.MENU_WIDTH, 400, 4);
    
    this.renderTabs(x, y);
    
    if (this.gameState.menuTab === 'controls') {
      this.renderControls(x, y + 50);
    } else if (this.gameState.menuTab === 'jukebox') {
      this.renderJukebox(x, y + 50);
    }
  }

  private renderTabs(x: number, y: number): void {
    const tabWidth = this.MENU_WIDTH / 2;
    
    ['controls', 'jukebox'].forEach((tab, index) => {
      const tabX = x + index * tabWidth;
      const isSelected = this.gameState.menuTab === tab;
      const isHovered = this.p.mouseX > tabX && this.p.mouseX < tabX + tabWidth &&
                       this.p.mouseY > y && this.p.mouseY < y + 40;
      
      this.p.fill(isSelected ? 40 : isHovered ? 30 : 20);
      this.p.noStroke();
      this.p.rect(tabX, y, tabWidth, 40);
      
      this.p.fill(255);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      this.p.textSize(14);
      this.p.text(tab.charAt(0).toUpperCase() + tab.slice(1), tabX + tabWidth / 2, y + 20);
      
      if (isHovered && this.p.mouseIsPressed) {
        this.gameState.menuTab = tab as 'controls' | 'jukebox';
      }
    });
  }

  private renderControls(x: number, y: number): void {
    const controls = [
      { key: 'moveUp', label: 'Move Up' },
      { key: 'moveDown', label: 'Move Down' },
      { key: 'moveLeft', label: 'Move Left' },
      { key: 'moveRight', label: 'Move Right' },
      { key: 'halt', label: 'Halt Units' },
      { key: 'deploy', label: 'Deploy MCV' }
    ];
    
    const labelWidth = 120;
    const buttonWidth = 60;
    const rowHeight = 40;
    this.p.textSize(14);
    
    controls.forEach((control, index) => {
      const controlY = y + index * rowHeight;
      const centerY = controlY + rowHeight / 2;
      
      // Draw label on the left, centered vertically
      this.p.fill(200);
      this.p.textAlign(this.p.LEFT, this.p.CENTER);
      this.p.text(control.label, x + this.MENU_PADDING, centerY);
      
      // Draw hotkey button
      const buttonX = x + this.MENU_WIDTH - buttonWidth - this.MENU_PADDING;
      const buttonY = controlY + (rowHeight - 24) / 2;
      const isHovered = this.p.mouseX > buttonX && this.p.mouseX < buttonX + 100 &&
                       this.p.mouseY > buttonY && this.p.mouseY < buttonY + 20;
      
      this.p.fill(isHovered ? 40 : 30);
      this.p.rect(buttonX, buttonY, buttonWidth, 24, 4);
      
      // Draw hotkey centered in button
      this.p.fill(255);
      this.p.textAlign(this.p.CENTER, this.p.CENTER);
      const keyCode = this.gameState.keybindings[control.key];
      const keyChar = String.fromCharCode(keyCode);
      this.p.text(keyChar, buttonX + buttonWidth / 2, centerY);
    });
  }

  private renderJukebox(x: number, y: number): void {
    const DOUBLE_CLICK_DELAY = 300; // ms

    // Track progress bar
    const progressWidth = this.MENU_WIDTH - this.MENU_PADDING * 4;
    const progressY = y + 100;
    
    // Ensure current track is valid
    if (this.gameState.currentTrack >= GAME_TRACKS.length) {
      this.gameState.currentTrack = 0;
    }

    // Handle progress bar click
    const isProgressBarHovered = 
      this.p.mouseX >= x + this.MENU_PADDING * 2 && 
      this.p.mouseX <= x + this.MENU_PADDING * 2 + progressWidth &&
      this.p.mouseY >= progressY && 
      this.p.mouseY <= progressY + 20;

    if (isProgressBarHovered && this.p.mouseIsPressed) {
      const clickPosition = (this.p.mouseX - (x + this.MENU_PADDING * 2)) / progressWidth;
      this.gameState.systems.audio.seekTo(clickPosition);
    }

    // Background track
    this.p.fill(30);
    this.p.noStroke();
    this.p.rect(x + this.MENU_PADDING * 2, progressY + 8, progressWidth, 4, 2);
    
    // Filled progress bar
    this.p.fill('#4a9fff');
    this.p.noStroke();
    this.p.rect(
      x + this.MENU_PADDING * 2,
      progressY + 8,
      progressWidth * this.gameState.trackProgress,
      4,
      2
    );

    // Render volume slider
    const sliderWidth = this.MENU_WIDTH - this.MENU_PADDING * 4;
    const sliderY = y;
    
    // Background track
    this.p.fill(30);
    this.p.noStroke();
    this.p.rect(x + this.MENU_PADDING * 2, sliderY + 8, sliderWidth, 4, 2);
    
    // Filled progress bar
    this.p.fill('#4a9fff');
    this.p.noStroke();
    this.p.rect(
      x + this.MENU_PADDING * 2,
      sliderY + 8,
      sliderWidth * this.gameState.volume,
      4,
      2
    );
    
    // Volume slider handle
    const handleX = x + this.MENU_PADDING * 2 + (sliderWidth * this.gameState.volume);
    const isSliderHovered = this.p.mouseX >= x + this.MENU_PADDING * 2 && 
                           this.p.mouseX <= x + this.MENU_PADDING * 2 + sliderWidth &&
                           this.p.mouseY >= sliderY && this.p.mouseY <= sliderY + 20;
    
    if (isSliderHovered && this.p.mouseIsPressed) {
      const newVolume = (this.p.mouseX - (x + this.MENU_PADDING * 2)) / sliderWidth;
      this.gameState.volume = Math.max(0, Math.min(1, newVolume));
    }
    
    // Modern minimal handle
    this.p.fill(isSliderHovered ? '#ffffff' : '#4a9fff');
    this.p.noStroke();
    this.p.circle(handleX, sliderY + 10, 10);
    
    // Playback controls
    const buttonY = sliderY + 40;
    const buttonSpacing = 60;
    const buttonSize = 40;
    const centerX = x + this.MENU_WIDTH / 2;
    
    // Play/Stop button
    const playX = centerX - buttonSpacing;
    const isPlayHovered = this.isButtonHovered(playX, buttonY, buttonSize);
    this.renderButton(playX, buttonY, buttonSize, this.gameState.isPlaying ? '⏹️' : '▶️', isPlayHovered, () => {
      this.gameState.isPlaying = !this.gameState.isPlaying;
    });
    
    // Repeat button
    const repeatX = centerX;
    const isRepeatHovered = this.isButtonHovered(repeatX, buttonY, buttonSize);
    this.renderButton(repeatX, buttonY, buttonSize, '🔁', isRepeatHovered, () => {
      this.gameState.isRepeat = !this.gameState.isRepeat;
    }, this.gameState.isRepeat);
    
    // Shuffle button
    const shuffleX = centerX + buttonSpacing;
    const isShuffleHovered = this.isButtonHovered(shuffleX, buttonY, buttonSize);
    this.renderButton(shuffleX, buttonY, buttonSize, '🔀', isShuffleHovered, () => {
      this.gameState.isShuffle = !this.gameState.isShuffle;
    }, this.gameState.isShuffle);

    // Track list with scrolling
    const trackListY = progressY + 30;
    const trackListHeight = 200;
    const trackHeight = 30;
    const trackListWidth = this.MENU_WIDTH - this.MENU_PADDING * 2;

    // Draw container background
    this.p.fill(20);
    this.p.noStroke();
    this.p.rect(x + this.MENU_PADDING, trackListY, trackListWidth, trackListHeight);

    GAME_TRACKS.forEach((track, index) => {
      const trackY = trackListY + index * trackHeight;
      
      const isCurrentTrack = index === this.gameState.currentTrack;
      const isHovered = this.p.mouseX > x + this.MENU_PADDING && this.p.mouseX < x + this.MENU_WIDTH - this.MENU_PADDING &&
                       this.p.mouseY > trackY && this.p.mouseY < trackY + trackHeight;
      const bgColor = isCurrentTrack ? 40 : isHovered ? 30 : 25;
      const textColor = isCurrentTrack ? '#4a9fff' : 255;

      this.p.fill(bgColor);
      this.p.noStroke();
      this.p.rect(x + this.MENU_PADDING, trackY, trackListWidth, trackHeight);
      
      this.p.fill(textColor);
      this.p.textSize(12);
      this.p.textAlign(this.p.LEFT, this.p.CENTER);
      this.p.text(track.title, x + this.MENU_PADDING * 3, trackY + trackHeight/2);
      this.p.textAlign(this.p.RIGHT, this.p.CENTER);
      this.p.text(track.duration, x + this.MENU_WIDTH - this.MENU_PADDING * 3, trackY + trackHeight/2);

      // Handle click events
      if (isHovered && this.p.mouseIsPressed && this.p.mouseButton === this.p.LEFT) {
        const now = Date.now();
        if (now - this.lastClickTime > this.BUTTON_COOLDOWN) {
          this.gameState.currentTrack = index;
          this.gameState.isPlaying = true;
          this.lastClickTime = now;
        }
      }
    });
  }

  private isButtonHovered(x: number, y: number, size: number): boolean {
    return this.p.mouseX >= x - size/2 && 
           this.p.mouseX <= x + size/2 && 
           this.p.mouseY >= y && 
           this.p.mouseY <= y + size;
  }

  private renderButton(x: number, y: number, size: number, icon: string, isHovered: boolean, onClick: () => void, isActive: boolean = false): void {
    const now = Date.now();
    if (isHovered && this.p.mouseIsPressed && now - this.lastButtonClickTime > this.BUTTON_COOLDOWN) {
      onClick();
      this.lastButtonClickTime = now;
    }
    
    this.p.fill(isActive ? 40 : isHovered ? 35 : 30);
    this.p.noStroke();
    this.p.rect(x - size/2, y, size, size, 4);
    
    this.p.fill(isActive ? '#4a9fff' : 255);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(20);
    this.p.text(icon, x, y + size/2);
  }
}