// src/game/logic.ts
import { BUILDING_COSTS, createResources } from "./types";
import type { BuildingType, GameState, Resources, WorkerRole } from "./types";
// Ile produkuje pojedynczy worker danej roli na turę
const PRODUCTION_PER_WORKER: Record<WorkerRole, Resources> = {
  woodcutter: createResources(1, 0, 0, 0),
  miner: createResources(0, 1, 0, 0),
  gatherer: createResources(0, 0, 1, 0),
  clayPicker: createResources(0, 0, 0, 1),
  peasant: createResources(0, 0, 0, 0),
   warrior: createResources(0, 0, -2, 0),
    ranged: createResources(0, 0, -1, 0),
};

export const addResources = (a: Resources, b: Resources): Resources => ({
  wood: a.wood + b.wood,
  stone: a.stone + b.stone,
  food: a.food + b.food,
  clay: a.clay + b.clay,
});

export const subtractResources = (
  a: Resources,
  cost: Resources,
  lvl: number
): Resources => {
  const mult = 1 + lvl * 0.2;

  return {
    wood: a.wood - cost.wood * mult,
    stone: a.stone - cost.stone * mult,
    food: a.food - cost.food * mult,
    clay: a.clay - cost.clay * mult,
  };
};


export const canAfford = (
  resources: Resources,
  cost: Resources,
  lvl: number
): boolean => {
  const mult = 1 + lvl * 0.2;

  return (
    resources.wood >= cost.wood * mult &&
    resources.stone >= cost.stone * mult &&
    resources.food >= cost.food * mult &&
    resources.clay >= cost.clay * mult
  );
};

// 1. Produkcja surowców w turze (na razie "instant" na końcu tury)
export function simulateProduction(state: GameState): GameState {
  let totalGain = createResources();

  for (const w of state.workers) {
    totalGain = addResources(totalGain, PRODUCTION_PER_WORKER[w.role]);
  }

  return {
    ...state,
    resources: addResources(state.resources, totalGain),
  };
}

// 2. Wzrost populacji po zakończonej turze:contentReference[oaicite:2]{index=2}
export function applyPopulationGrowth(state: GameState): GameState {
  const houses = state.buildings.filter((b) => b.type === "house");
  const totalHousePower = houses.reduce(
    (sum, h) => sum + 2 * h.level,
    0
  );

  const newPeasantsCount = 2 + totalHousePower; // 2 + (houses * 2 * level)
  if (newPeasantsCount <= 0) return state;

  const lastId =
    state.workers.length > 0
      ? Math.max(...state.workers.map((w) => w.id))
      : 0;

  const newWorkers = Array.from({ length: newPeasantsCount }).map(
    (_, idx) => ({
      id: lastId + idx + 1,
      role: "peasant" as WorkerRole,
    })
  );

  return {
    ...state,
    workers: [...state.workers, ...newWorkers],
  };
}
function getBuildingLevel(state: GameState, building: BuildingType): number {
  const b = state.buildings.find((x) => x.type === building);
  return b ? b.level : 0; // brak = level 0
}

// 3. Dodanie budynku do kolejki (jeszcze bez odpalania animacji budowy)
export function enqueueBuilding(
  state: GameState,
  buildingType: BuildingType
): GameState {
  const cost = BUILDING_COSTS[buildingType];

  const currentLvl = getBuildingLevel(state, buildingType); // TU NOWE

  if (!canAfford(state.resources, cost, currentLvl)) {
    return state; // za drogo
  }

  const lastId =
    state.buildQueue.length > 0
      ? Math.max(...state.buildQueue.map((b) => b.id)) + 1
      : 1;

  const newQueueItem = {
    id: lastId,
    buildingType,
    cost,
    progress: 0,
    status: "planned" as const,
  };

  return {
    ...state,
    resources: subtractResources(state.resources, cost, currentLvl), // TU POPRAWIONE
    buildQueue: [...state.buildQueue, newQueueItem],
  };
}



// 4. Postęp budowy w fazie symulacji
//   (tutaj na razie: jeśli w kolejce jest budynek planned -> od razu finished)
export function simulateBuilding(state: GameState): GameState {
  if (state.buildQueue.length === 0) return state;

  // znajdź pierwszy element w statusie "planned"
  const plannedIndex = state.buildQueue.findIndex(
    (item) => item.status === "planned"
  );
  if (plannedIndex === -1) {
    // nic do budowania (wszystko finished)
    return state;
  }

  const plannedItem = state.buildQueue[plannedIndex];

  // kończymy budowę
  const finishedItem = {
    ...plannedItem,
    progress: 1,
    status: "finished" as const,
  };

  // szukamy istniejącego budynku tego samego typu
  const existingIndex = state.buildings.findIndex(
    (b) => b.type === finishedItem.buildingType
  );

  let newBuildings: GameState["buildings"];

  if (existingIndex !== -1) {
    // budynek istnieje -> podbijamy level
    newBuildings = state.buildings.map((b, idx) =>
      idx === existingIndex ? { ...b, level: b.level + 1 } : b
    );
  } else {
    // brak takiego typu -> tworzymy nowy
    const newBuildingId =
      state.buildings.length > 0
        ? Math.max(...state.buildings.map((b) => b.id)) + 1
        : 1;

    const newBuilding = {
      id: newBuildingId,
      type: finishedItem.buildingType,
      level: 1,
    };

    newBuildings = [...state.buildings, newBuilding];
  }

  // podmieniamy tylko jeden element kolejki na "finished"
  const newQueue = state.buildQueue.map((item, idx) =>
    idx === plannedIndex ? finishedItem : item
  );

  return {
    ...state,
    buildings: newBuildings,
    buildQueue: newQueue,
  };
}



// 5. Zastosowanie wyborów gracza w fazie freeze
export interface PlayerChoices {
  newPeasantRoles: WorkerRole[]; // lista ról, którymi chcemy obsadzić peasants
  buildingToQueue?: BuildingType | null;
}

export function applyPlayerChoices(
  state: GameState,
  choices: PlayerChoices
): GameState {
  let newState = { ...state };

  // 5a. Przypisanie ról dla peasants
  const peasantsIndexes = newState.workers
    .map((w, idx) => ({ w, idx }))
    .filter(({ w }) => w.role === "peasant")
    .map(({ idx }) => idx);

  const rolesToAssign = choices.newPeasantRoles;

  const updatedWorkers = [...newState.workers];

  for (let i = 0; i < rolesToAssign.length && i < peasantsIndexes.length; i++) {
    const workerIndex = peasantsIndexes[i];
    updatedWorkers[workerIndex] = {
      ...updatedWorkers[workerIndex],
      role: rolesToAssign[i],
    };
  }

  newState = {
    ...newState,
    workers: updatedWorkers,
  };

  // 5b. Kolejka budynku
  if (choices.buildingToQueue) {
    newState = enqueueBuilding(newState, choices.buildingToQueue);
  }

  return newState;
}

// 6. Pełne przejście "koniec symulacji -> nowa tura + freeze"
export function endOfSimulationPhase(state: GameState): GameState {
  // Produkcja
  let s = simulateProduction(state);
  // Budowa
  s = simulateBuilding(s);
  // Populacja
  s = applyPopulationGrowth(s);

  return {
    ...s,
    turn: s.turn + 1,
    secondsInPhase: 0,
  };
}
