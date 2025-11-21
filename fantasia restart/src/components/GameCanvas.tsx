// src/components/GameCanvas.tsx
import { useEffect, useRef } from "react";
import type { GameState, Phase } from "../game/engine/types";
import { GameEngine } from "../game/engine/GameEngine";

type GameCanvasProps = {
  gameState: GameState;
  phase: Phase;
  onGameStateChange: (state: GameState) => void;
  onPhaseChange: (phase: Phase) => void;
};

export function GameCanvas({
  gameState,
  phase,
  onGameStateChange,
  onPhaseChange,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // inicjalizujemy silnik tylko raz
    if (!engineRef.current) {
      engineRef.current = new GameEngine(canvas, {
        onGameStateChange,
        onPhaseChange,
      });
    }

    // przy każdej zmianie stanu / fazy przekazujemy je do engine
    engineRef.current.setGameState(gameState);
    engineRef.current.setPhase(phase);

    // opcjonalnie cleanup przy unmount
    return () => {
      
      // engineRef.current?.dispose();
    };
  }, [gameState, phase, onGameStateChange, onPhaseChange]);

  return (
    <canvas
      ref={canvasRef}
      className="border border-slate-700 rounded-2xl bg-black shadow-lg shadow-slate-950/50"
      width={800}
      height={450}
    />
  );
}
