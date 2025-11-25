// src/components/TurnUI.tsx
import { useMemo, useState } from "react";
import type {
  BuildingType,
  GameState,
  Phase,
  WorkerRole,
  Resources,
} from "../game/engine/Types";
import { BUILDING_COSTS } from "../game/engine/Types";

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
  "warrior",
  "ranged",
];

function hasBarracks(gameState: GameState): boolean {
  const b = gameState.buildings.find((b) => b.type === "barracks");
  return !!b && b.level >= 1;
}

function isRoleUnlocked(role: WorkerRole, gameState: GameState): boolean {
  if (role === "warrior" || role === "ranged") {
    return hasBarracks(gameState);
  }
  return true; // reszta zawsze dostępna
}



const AVAILABLE_BUILDINGS: BuildingType[] = [
  "farm",
  "hunterHut",
  "carpentry",
  "masonry",
  "pottery",
  "house",
  "barracks",
];


// czy nas stać na budynek przy danym aktualnym poziomie
function canAfford(
  resources: Resources,
  building: BuildingType,
  currentLevel: number
): boolean {
  const baseCost = BUILDING_COSTS[building];
  if (!baseCost) return true;

  // +20% kosztu za każdy istniejący poziom (lvl 0 = bazowy koszt)
  const multiplier = 1 + currentLevel * 0.2;

  const neededWood = Math.floor(baseCost.wood * multiplier);
  const neededStone = Math.floor(baseCost.stone * multiplier);
  const neededFood = Math.floor(baseCost.food * multiplier);
  const neededClay = Math.floor(baseCost.clay * multiplier);

  if (resources.wood < neededWood) return false;
  if (resources.stone < neededStone) return false;
  if (resources.food < neededFood) return false;
  if (resources.clay < neededClay) return false;

  return true;
}
function getBuildingLevel(state: GameState, type: BuildingType): number {
  const b = state.buildings.find((x) => x.type === type);
  return b ? b.level : 0;
}

function getCostForLevel(base: Resources, lvl: number): Resources {
  const mult = 1 + lvl * 0.2;
  return {
    wood: Math.floor(base.wood * mult),
    stone: Math.floor(base.stone * mult),
    food: Math.floor(base.food * mult),
    clay: Math.floor(base.clay * mult),
  };
}

function canAffordUI(
  resources: Resources,
  costForLevel: Resources
): boolean {
  return (
    resources.wood >= costForLevel.wood &&
    resources.stone >= costForLevel.stone &&
    resources.food >= costForLevel.food &&
    resources.clay >= costForLevel.clay
  );
}

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
                      {AVAILABLE_ROLES.map((role) => {
						  const unlocked = isRoleUnlocked(role, gameState);

						  const label =
							!unlocked && (role === "warrior" || role === "ranged")
							  ? `${role} (barracks required)`
							  : role;

						  return (
							<option
							  value={role}
							  key={role}
							  disabled={!unlocked}
							  className={!unlocked ? "text-red-400" : ""}
							>
							  {label}
							</option>
						  );
						})}

                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BUDYNKI */}
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

              {AVAILABLE_BUILDINGS.map((b) => {
				  const lvl = getBuildingLevel(gameState, b);
				  const baseCost = BUILDING_COSTS[b];
				  const cost = getCostForLevel(baseCost, lvl);

				  const affordable = canAffordUI(gameState.resources, cost);

				  const label = `${b.toUpperCase()} ${
					lvl > 0 ? `(LVL ${lvl})` : "(LVL 0)"
				  } — [ 🌲 Wood: ${cost.wood}, 🪨 Stone: ${cost.stone}, 🍎 Food: ${cost.food}, 🧱 Clay: ${cost.clay}]`;

				  return (
					<option
					  key={b}
					  value={b}
					  disabled={!affordable}
					  className={!affordable ? "text-red-400 font-semibold" : ""}
					>
					  {label}
					  {!affordable ? " — ZA DROGO" : ""}
					</option>
				  );
				})}

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
