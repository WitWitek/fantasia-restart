// src/game/types.ts

// Faza tury: 30s symulacji vs freeze (wybory gracza)
export type Phase = "simulation" | "freeze";

// Frakcje (na razie opcjonalne, możesz rozwinąć później)
export type Faction = "wars" | "knights" | "elves";

export type ResourceType = "wood" | "stone" | "food" | "clay";

export type WorkerRole =
  | "woodcutter"
  | "miner"
  | "gatherer"
  | "clayPicker"
  | "peasant";

export interface Resources {
  wood: number;
  stone: number;
  food: number;
  clay: number;
}

export type BuildingType =
  | "farm"
  | "hunterHut"
  | "carpentry"
  | "masonry"
  | "pottery"
  | "house";

export type BuildStatus = "planned" | "building" | "finished";

export interface Worker {
  id: number;
  role: WorkerRole;
}

export interface Building {
  id: number;
  type: BuildingType;
  level: number;
}

export interface BuildQueueItem {
  id: number;
  buildingType: BuildingType;
  cost: Resources;
  progress: number; // 0..1
  status: BuildStatus;
}

// Podstawowy shape stanu gry wg dokumentacji v2
export interface GameState {
  turn: number;
  faction: Faction | null;
  resources: Resources;
  workers: Worker[];
  buildings: Building[];
  buildQueue: BuildQueueItem[];
  // Dodatkowe pole pomocnicze do timingu 30s
  secondsInPhase: number;
  seed: string; // ← DODAJ TO
}

// Pomocnicze: tworzenie obiektu Resources
export const createResources = (
  wood = 0,
  stone = 0,
  food = 0,
  clay = 0
): Resources => ({
  wood,
  stone,
  food,
  clay,
});

// Koszty budynków (wg dokumentu v2)
export const BUILDING_COSTS: Record<BuildingType, Resources> = {
  farm: createResources(3, 2, 0, 0),
  hunterHut: createResources(5, 2, 0, 0),
  carpentry: createResources(5, 3, 0, 0),
  masonry: createResources(5, 5, 0, 0),
  pottery: createResources(4, 3, 0, 0),
  house: createResources(4, 2, 0, 0), // przykładowy koszt domku, możesz zmienić
};

// Stan początkowy (2 woodcutter, 1 miner, 5 gatherer, 3 peasant itd.):contentReference[oaicite:1]{index=1}
export const INITIAL_GAME_STATE: GameState = {
  turn: 1,
  faction: null,
  seed:"321313",
  resources: createResources(0, 0, 0, 0),
  workers: [
    { id: 1, role: "woodcutter" },
    { id: 2, role: "woodcutter" },
    { id: 3, role: "miner" },
    { id: 4, role: "gatherer" },
    { id: 5, role: "gatherer" },
    { id: 6, role: "gatherer" },
    { id: 7, role: "gatherer" },
    { id: 8, role: "gatherer" },
    { id: 9, role: "peasant" },
    { id: 10, role: "peasant" },
    { id: 11, role: "peasant" },
  ],
  buildings: [],
  buildQueue: [],
  secondsInPhase: 0,
};
