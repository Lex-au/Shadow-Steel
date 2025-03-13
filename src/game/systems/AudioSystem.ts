import { GameState } from '../state/GameState';

export interface Track {
  title: string;
  url: string;
  duration: string;
}

export class AudioSystem {
  private audio: HTMLAudioElement | null = null;
  private tracks: Track[] = [];
  private loadedTrackIndex: number = -1;
  private lastActionTime: number = 0;
  private readonly DEBOUNCE_DELAY = 500; // ms

  constructor(private gameState: GameState) {
    this.audio = new Audio();
    this.audio.addEventListener('ended', () => this.handleTrackEnd());
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('loadeddata', () => {
      if (this.gameState.isPlaying) {
        this.audio?.play().catch(() => {
          // Handle autoplay restrictions gracefully
          this.gameState.isPlaying = false;
        });
      }
    });
  }

  public setTracks(tracks: Track[]): void {
    this.tracks = tracks;
    if (this.tracks.length > 0 && this.loadedTrackIndex === -1) {
      this.loadTrack(this.gameState.currentTrack);
    }
  }

  public update(): void {
    if (!this.audio || this.tracks.length === 0) return;

    // Prevent multiple audio instances
    if (this.loadedTrackIndex !== this.gameState.currentTrack) {
      const now = Date.now();
      if (now - this.lastActionTime > this.DEBOUNCE_DELAY) {
        this.loadTrack(this.gameState.currentTrack);
        this.lastActionTime = now;
      }
    }

    // Update volume
    this.audio.volume = this.gameState.volume;

    // Handle play/pause
    const now = Date.now();
    if (now - this.lastActionTime > this.DEBOUNCE_DELAY) {
      if (this.gameState.isPlaying && this.audio.paused && this.audio.readyState >= 2) {
        this.audio.play();
        this.lastActionTime = now;
      } else if (!this.gameState.isPlaying && !this.audio.paused) {
        this.audio.pause();
        this.lastActionTime = now;
      }
    }
  }

  private loadTrack(index: number): void {
    if (!this.audio || index < 0 || index >= this.tracks.length) return;

    // Stop current track before loading new one
    this.audio.pause();
    this.audio.currentTime = 0;

    this.loadedTrackIndex = index;
    this.audio.src = this.tracks[index].url;
    this.audio.load();

    if (this.gameState.isPlaying) {
      this.audio.play().catch(() => {
        this.gameState.isPlaying = false;
      });
    }
  }

  private handleTrackEnd(): void {
    if (this.tracks.length === 0) return;

    if (this.gameState.isRepeat) {
      // Replay current track
      this.audio?.play();
    } else if (this.gameState.isShuffle) {
      // Play random track except current
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * this.tracks.length);
      } while (nextIndex === this.loadedTrackIndex && this.tracks.length > 1);
      this.gameState.currentTrack = nextIndex;
    } else {
      // Play next track or stop at end
      const nextIndex = (this.loadedTrackIndex + 1) % this.tracks.length;
      if (nextIndex !== 0 || this.gameState.isRepeat) {
        this.gameState.currentTrack = nextIndex;
      } else {
        this.gameState.isPlaying = false;
      }
    }
  }

  private updateProgress(): void {
    if (!this.audio) return;
    this.gameState.trackProgress = this.audio.currentTime / this.audio.duration;
  }

  public seekTo(progress: number): void {
    if (!this.audio) return;
    this.audio.currentTime = this.audio.duration * progress;
  }

  public cleanup(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
  }
}