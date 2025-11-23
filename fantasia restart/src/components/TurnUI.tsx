// src/components/TurnUI.tsx
import { useMemo, useState } from "react";
import type {
  BuildingType,
  GameState,
  Phase,
  WorkerRole,
} from "../game/engine/Types";


import type { PlayerChoices } from "../game/logic";

type Props = {
  gameState: GameState;
  phase: Phase;
  onConfirmChoices: (choices: PlayerChoices) => void;
};

const AVAILABLE_ROLES: WorkerRole[] = [
  "woodcutter",
  "miner",
  "gatherer",
  "clayPicker",
  "peasant",
];

const AVAILABLE_BUILDINGS: BuildingType[] = [
  "farm",
  "hunterHut",
  "carpentry",
  "masonry",
  "pottery",
  "house",
];

export function TurnUI({ gameState, phase, onConfirmChoices }: Props) {
  const peasantsCount = useMemo(
    () => gameState.workers.filter((w) => w.role === "peasant").length,
    [gameState.workers]
  );

  const [selectedRoles, setSelectedRoles] = useState<WorkerRole[]>(
    Array.from({ length: peasantsCount }).map(() => "peasant")
  );

  const [selectedBuilding, setSelectedBuilding] =
    useState<BuildingType | null>(null);

  // reset localnego stanu przy zmianie liczby peasants
  if (selectedRoles.length !== peasantsCount) {
    setSelectedRoles(
      Array.from({ length: peasantsCount }).map((_, idx) =>
        selectedRoles[idx] ?? "peasant"
      )
    );
  }

  const handleRoleChange = (index: number, role: WorkerRole) => {
    setSelectedRoles((prev) => {
      const next = [...prev];
      next[index] = role;
      return next;
    });
  };

  const handleConfirm = () => {
    const filteredRoles = selectedRoles.filter((r) => r !== "peasant");
    onConfirmChoices({
      newPeasantRoles: filteredRoles,
      buildingToQueue: selectedBuilding,
    });
  };

  const isFreeze = phase === "freeze";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Tura #{gameState.turn}</h2>
        <p className="text-sm text-slate-400">
          Faza:{" "}
          <span className="font-mono">
            {phase === "freeze" ? "FREEZE (decyzje)" : "SYMULACJA 30s"}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="p-2 rounded-lg bg-slate-800/60">
          <div className="font-semibold mb-1">Zasoby</div>
          <div>🌲 Wood: {gameState.resources.wood}</div>
          <div>🪨 Stone: {gameState.resources.stone}</div>
          <div>🍎 Food: {gameState.resources.food}</div>
          <div>🧱 Clay: {gameState.resources.clay}</div>
        </div>

        <div className="p-2 rounded-lg bg-slate-800/60">
          <div className="font-semibold mb-1">Workerzy</div>
          <div>👥 Łącznie: {gameState.workers.length}</div>
          <div>🙂 Peasants: {peasantsCount}</div>
        </div>
      </div>

      {isFreeze ? (
        <>
          <div className="space-y-2">
            <div className="font-semibold text-sm">
              Role dla peasants ({peasantsCount})
            </div>
            {peasantsCount === 0 ? (
              <p className="text-xs text-slate-400">
                Brak peasants do przydzielenia w tej turze.
              </p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {Array.from({ length: peasantsCount }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-slate-300">Peasant #{idx + 1}</span>
                    <select
                      className="bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-xs"
                      value={selectedRoles[idx] ?? "peasant"}
                      onChange={(e) =>
                        handleRoleChange(idx, e.target.value as WorkerRole)
                      }
                    >
                      {AVAILABLE_ROLES.map((role) => (
                        <option value={role} key={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="font-semibold text-sm">Budowa w kolejnej turze</div>
            <select
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
              value={selectedBuilding ?? ""}
              onChange={(e) =>
                setSelectedBuilding(
                  (e.target.value || null) as BuildingType | null
                )
              }
            >
              <option value="">— brak nowego budynku —</option>
              {AVAILABLE_BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full mt-2 py-2 rounded-lg bg-emerald-500 text-slate-900 text-sm font-semibold hover:bg-emerald-400 transition disabled:opacity-50"
          >
            Potwierdź decyzje i rozpocznij symulację
          </button>
        </>
      ) : (
        <p className="text-sm text-slate-400">
          Symulacja tury trwa… Poczekaj aż się zakończy, aby podjąć decyzje.
        </p>
      )}
    </div>
  );
}
