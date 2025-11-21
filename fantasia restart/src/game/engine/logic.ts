// src/game/logic.ts
import {
  BUILDING_COSTS,
  BuildingType,
  GameState,
  Resources,
  WorkerRole,
  createResources,
} from "./types";

// Ile produkuje pojedynczy worker danej roli na turę
const PRODUCTION_PER_WORKER: Record<WorkerRole, Resources> = {
  woodcutter: createResources(1, 0, 0, 0),
  miner: createResources(0, 1, 0, 0),
  gatherer: createResources(0, 0, 1, 0),
  clayPicker: createResources(0, 0, 0, 1),
  peasant: createResources(0, 0, 0, 0),
};

export const addResources = (a: Resources, b: Resources): Resources => ({
  wood: a.wood + b.wood,
  stone: a.stone + b.stone,
  food: a.food + b.food,
  clay: a.clay + b.clay,
});

export const subtractResources = (a: Resources, b: Resources): Resources => ({
  wood: a.wood - b.wood,
  stone: a.stone - b.stone,
  food: a.food - b.food,
  clay: a.clay - b.clay,
});

export const canAfford = (resources: Resources, cost: Resources): boolean =>
  resources.wood >= cost.wood &&
  resources.stone >= cost.stone &&
  resources.food >= cost.food &&
  resources.clay >= cost.clay;

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

// 3. Dodanie budynku do kolejki (jeszcze bez odpalania animacji budowy)
export function enqueueBuilding(
  state: GameState,
  buildingType: BuildingType
): GameState {
  const cost = BUILDING_COSTS[buildingType];


  if (!canAfford(state.resources, cost)) {
    // Nie stać nas – nic nie zmieniamy
    return state;
  }

  const lastId =
    state.buildQueue.length > 0
      ? Math.max(...state.buildQueue.map((b) => b.id))
      : 0;

  const newQueueItem = {
    id: lastId + 1,
    buildingType,
    cost,
    progress: 0,
    status: "planned" as const,
  };

  return {
    ...state,
    resources: subtractResources(state.resources, cost),
    buildQueue: [...state.buildQueue, newQueueItem],
  };
}

// 4. Postęp budowy w fazie symulacji
//   (tutaj na razie: jeśli w kolejce jest budynek planned -> od razu finished)
export function simulateBuilding(state: GameState): GameState {
  if (state.buildQueue.length === 0) return state;

  const [first, ...rest] = state.buildQueue;

  if (first.status === "finished") {
    // już wcześniej ogarnięty
    return state;
  }

  // PROTOTYP: automatycznie kończymy pierwszy budynek w kolejce
  const finishedItem = { ...first, progress: 1, status: "finished" as const };

  const newBuildingId =
    state.buildings.length > 0
      ? Math.max(...state.buildings.map((b) => b.id)) + 1
      : 1;

  const newBuilding = {
    id: newBuildingId,
    type: finishedItem.buildingType,
    level: 1,
  };

  return {
    ...state,
    buildings: [...state.buildings, newBuilding],
    buildQueue: [finishedItem, ...rest],
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
