import p5 from 'p5';

export class PerformanceOptimizer {
  private static lastFrameTime = 0;
  private static frameCount = 0;
  private static fps = 0;

  public static measureFrameTime(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    
    this.frameCount++;
    if (this.frameCount >= 60) {
      this.fps = Math.round(1000 / deltaTime);
      this.frameCount = 0;
    }
  }

  public static getFPS(): number {
    return this.fps;
  }

  public static shouldRender(p: p5, bounds: { x: number; y: number; width: number; height: number }): boolean {
    return (
      bounds.x < p.width &&
      bounds.x + bounds.width > 0 &&
      bounds.y < p.height &&
      bounds.y + bounds.height > 0
    );
  }

  public static memoize<T>(fn: (...args: any[]) => T): (...args: any[]) => T {
    const cache = new Map<string, T>();
    
    return (...args: any[]): T => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key)!;
      }
      
      const result = fn(...args);
      cache.set(key, result);
      return result;
    };
  }
}