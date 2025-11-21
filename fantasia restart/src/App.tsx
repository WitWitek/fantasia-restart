// App.tsx
import { useState } from "react";
import { GameCanvas } from "./components/GameCanvas";
import { TurnUI } from "./components/TurnUI";
import type { GameState, Phase } from "./game/types";

export default function App() {
  const [gameState, setGameState] = useState<GameState>(/* initial state */);
  const [phase, setPhase] = useState<Phase>("simulation"); // "simulation" | "freeze"

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      <div className="flex-1 flex items-center justify-center">
        <GameCanvas
          gameState={gameState}
          phase={phase}
          onGameStateChange={setGameState}
          onPhaseChange={setPhase}
        />
      </div>

      <div className="w-full md:w-96 border-t md:border-l border-slate-700 p-4">
        <TurnUI
          gameState={gameState}
          phase={phase}
          onConfirmChoices={(updates) => {
            
            // const newState = applyPlayerChoices(gameState, updates);
            // setGameState(newState);
            setPhase("simulation");
          }}
        />
      </div>
    </div>
  );
}
