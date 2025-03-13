import React from 'react';
import { useEffect, useRef } from 'react';
import p5 from 'p5';
import { GameEngine } from './game/engine/GameEngine';

export default App;

function App() {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent context menu on right click
    const preventDefault = (e: Event) => e.preventDefault();
    gameContainerRef.current?.addEventListener('contextmenu', preventDefault);

    if (!gameContainerRef.current) return;

    const sketch = (p: p5) => {
      const engine = new GameEngine(p);

      p.setup = () => {
        p.createCanvas(1280, 720);
      };

      p.draw = () => {
        p.background(220);
        engine.update();
      };
    };

    const p5Instance = new p5(sketch, gameContainerRef.current);
    return () => {
      p5Instance.remove();
      gameContainerRef.current?.removeEventListener('contextmenu', preventDefault);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center p-4">
      <div className="bg-gray-900 p-4 rounded-lg shadow-xl">
        <div ref={gameContainerRef} className="border-2 border-gray-700 rounded" />
      </div>
    </div>
  );

}