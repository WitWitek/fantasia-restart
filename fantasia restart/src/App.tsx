// App.tsx
import { useState } from "react";
import { GameCanvas } from "./components/GameCanvas";
import { TurnUI } from "./components/TurnUI";
import type { GameState, Phase } from "./game/engine/Types"; // albo "./game/types" – jak masz
import { INITIAL_GAME_STATE } from "./game/engine/Types";
import { applyPlayerChoices, type PlayerChoices } from "./game/engine/logic";
import { ResourcesHUD } from "./components/ResourcesHUD";
export default function App() {
  // start gry ze zdefiniowanego stanu
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [phase, setPhase] = useState<Phase>("freeze"); // startujemy w freeze

  // gracz potwierdza wybory w TurnUI
  const handleConfirmChoices = (choices: PlayerChoices) => {
    // 1. zastosuj wybory gracza (role + budynek do kolejki)
    const newState = applyPlayerChoices(gameState, choices);
    setGameState(newState);

    // 2. wystartuj 30s symulacji w silniku
    setPhase("simulation");
  };

  // callbacki z GameEngine (po 30s)
  const handleGameStateChangeFromEngine = (newState: GameState) => {
    setGameState(newState);
  };

  const handlePhaseChangeFromEngine = (newPhase: Phase) => {
    setPhase(newPhase);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      <div className="flex-1 flex items-center justify-center" style={{
        backgroundImage: `url('/src/graphics/canvasBackground.png')`,
        backgroundSize: "cover",      // albo "contain"
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center bottom", // trójkąt będzie „siedział” na dole
      }}>
        <GameCanvas
          gameState={gameState}
          phase={phase}
          onGameStateChange={handleGameStateChangeFromEngine}
          onPhaseChange={handlePhaseChangeFromEngine}
        />
      </div>

      <div className="w-full md:w-96 border-t md:border-l border-slate-700 p-4 flex flex-col gap-4">
        {/* HUD surowców */}
        <ResourcesHUD resources={gameState.resources} />

        {/* UI tury */}
        <TurnUI
          gameState={gameState}
          phase={phase}
          onConfirmChoices={handleConfirmChoices}
        />
      </div>
    </div>
  );
}
