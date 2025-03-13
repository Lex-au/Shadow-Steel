import { UI_CONSTANTS } from '../constants';

export class AnimationManager {
  private static animations = new Map<string, Animation>();

  public static animate(
    id: string,
    from: number,
    to: number,
    duration: number = UI_CONSTANTS.ANIMATION.DURATION.NORMAL,
    easing: string = UI_CONSTANTS.ANIMATION.EASING.EASE_OUT,
    onUpdate: (value: number) => void
  ): void {
    // Cancel existing animation
    this.cancelAnimation(id);

    const startTime = performance.now();
    const animation = {
      id,
      frame: 0,
      handle: requestAnimationFrame(function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Apply easing
        const easedProgress = AnimationManager.applyEasing(progress, easing);
        const currentValue = from + (to - from) * easedProgress;
        
        onUpdate(currentValue);
        
        if (progress < 1) {
          animation.handle = requestAnimationFrame(animate);
        } else {
          AnimationManager.animations.delete(id);
        }
      })
    };

    this.animations.set(id, animation);
  }

  public static cancelAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      cancelAnimationFrame(animation.handle);
      this.animations.delete(id);
    }
  }

  private static applyEasing(progress: number, easing: string): number {
    switch (easing) {
      case UI_CONSTANTS.ANIMATION.EASING.LINEAR:
        return progress;
      case UI_CONSTANTS.ANIMATION.EASING.EASE_OUT:
        return 1 - Math.pow(1 - progress, 3);
      case UI_CONSTANTS.ANIMATION.EASING.BOUNCE:
        return progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      default:
        return progress;
    }
  }
}

interface Animation {
  id: string;
  frame: number;
  handle: number;
}