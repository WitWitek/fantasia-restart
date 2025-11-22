// src/game/engine/GameEngine.ts

import { endOfSimulationPhase } from "./logic";
import type { GameState, Phase } from "./types";
import { INITIAL_GAME_STATE ,BuildingType} from "./types";
import { seedParser } from "./seedParser";
import { Worker, GraphicObject } from "./GraphicsClasses";
type EngineCallbacks = {
  onGameStateChange: (state: GameState) => void;
  onPhaseChange: (phase: Phase) => void;
};

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private gameState!: GameState;
  private phase: Phase = "freeze";
private workers: Worker[] = [];
  private callbacks: EngineCallbacks;
  private rafId: number | null = null;
	private data:any;
	private currentBuilding:BuildingType;
  // symulacja 30s
  private simStartTime: number | null = null;
  private lastTimestamp: number = performance.now();

  private SIMULATION_DURATION = 30000; // 30 sekund
	private wood:GraphicObject;
	private stone:GraphicObject;
	private fruits:GraphicObject;
	private clay:GraphicObject;
	
  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
	 
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Brak context2d w canvasie.");
	this.ctx = ctx;
	 this.callbacks = callbacks; 
this.gameState = INITIAL_GAME_STATE;
this.data = seedParser(this.gameState.seed);
const hq = this.data.objects.hq;
const last = this.gameState.buildQueue[this.gameState.buildQueue.length - 1];
this.currentBuilding = last ? last.buildingType : "farm";
for (const w of this.gameState.workers) {
  this.workers.push(
    new Worker(
      hq.x + 100,
      hq.y,
      50,
      50,
      "worker",
      this.gameState.seed,
      w.role
    )
	
  );
}
	this.wood = new GraphicObject(this.data.objects.wood.x, this.data.objects.wood.y, 25, 25, "wood");
this.stone = new GraphicObject(this.data.objects.stone.x, this.data.objects.stone.y, 25, 25, "stone");
this.fruits = new GraphicObject(this.data.objects.fruits.x, this.data.objects.fruits.y, 25, 25, "fruits");
this.clay = new GraphicObject(this.data.objects.clay.x, this.data.objects.clay.y, 25, 25, "clay");

	
    this.loop = this.loop.bind(this);
    this.startLoop();
  }

  /** Wywoływane przez React gdy stan gry się zmienia */
  setGameState(state: GameState) {
    this.gameState = state;
  }

  /** Wywoływane przez React przy zmianie fazy */
  setPhase(phase: Phase) {
    // wchodzimy w symulację
    if (phase === "simulation" && this.phase !== "simulation") {
      this.simStartTime = performance.now();
    }

    this.phase = phase;
  }

  /** Start pętli animacji */
  private startLoop() {
    if (this.rafId != null) return;
    this.rafId = requestAnimationFrame(this.loop);
  }

  /** Stop (opcjonalne) */
  dispose() {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** Główna pętla silnika */
  private loop(timestamp: number) {
    const dt = (timestamp - this.lastTimestamp) / 1000; // w sekundach
    this.lastTimestamp = timestamp;

    this.update(timestamp, dt);
    this.render();

    this.rafId = requestAnimationFrame(this.loop);
}


  /** ************************************************************
   * UPDATE — logika 30-sekundowej tury
   ************************************************************* */
  private update(timestamp: number, dt: number) {
	  
    if (this.phase !== "simulation") return;

    if (this.simStartTime === null) this.simStartTime = timestamp;

    const elapsed = timestamp - this.simStartTime;
	
	
const last = this.gameState.buildQueue[this.gameState.buildQueue.length - 1];
this.currentBuilding = last ? last.buildingType : this.currentBuilding;
	const buildingString=this.currentBuilding;
if(elapsed>0&&elapsed<5000){
	
	for(const worker of this.workers){
		worker.aiMovement({ name: buildingString }, dt, "hq");
	}
}
    if(elapsed>10000&&elapsed<15000){
	
	for(const worker of this.workers){
		worker.aiMovement({ name: buildingString }, dt, "gather");
	}
}
if(elapsed>20000&&elapsed<25000){
	
	for(const worker of this.workers){
		worker.aiMovement({ name: buildingString }, dt, "building");
	}
}
    // 0–5 ruch workerów + item spawns
    // 5–15 produkcja animacyjna
    // 15–20 przejście do placu budowy
    // 20–30 budowa
    // (placeholder — łatwe do rozbudowy)

    // koniec 30-sekundowej tury
    if (elapsed >= this.SIMULATION_DURATION) {
      const newState = endOfSimulationPhase(this.gameState);

      this.callbacks.onGameStateChange(newState);
      this.callbacks.onPhaseChange("freeze");

      this.simStartTime = null; // reset
    }
  }

  /** ************************************************************
   * RENDER — placeholder canvas
   ************************************************************* */
  private render() {
    const ctx = this.ctx;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Tło
    ctx.fillStyle = "rgb(18,18,18)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // HQ placeholder
    ctx.fillStyle = "#444";
ctx.fillRect(this.data.objects.hq.x - 25, this.data.objects.hq.y - 25, 50, 50);

    ctx.fillStyle = "#ddd";
    ctx.font = "16px sans-serif";
    ctx.fillText("HQ", this.data.objects.hq.x, this.data.objects.hq.y);
//workersi

for(const w of this.workers)w.draw(ctx);

//nody
this.wood.draw(ctx);
this.stone.draw(ctx);
this.fruits.draw(ctx);
this.clay.draw(ctx);
    // Faza
    ctx.fillStyle = "white";
    ctx.font = "14px monospace";
    ctx.fillText(`Phase: ${this.phase}`, 20, 20);

    // Produkcja debug
    ctx.fillText(
      `Workers: ${this.gameState.workers.length}`,
      20,
      40
    );

    // Budynki debug
    ctx.fillText(
      `Buildings: ${this.gameState.buildings.length}`,
      20,
      60
    );

    // Czas symulacji (np. animacja paska)
    if (this.phase === "simulation" && this.simStartTime !== null) {
      const elapsed = performance.now() - this.simStartTime;
      const pct = Math.min(1, elapsed / this.SIMULATION_DURATION);

      ctx.fillStyle = "#333";
      ctx.fillRect(20, 400, 760, 20);

      ctx.fillStyle = "#44ff66";
      ctx.fillRect(20, 400, 760 * pct, 20);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${Math.floor(elapsed / 1000)}s / 30s`, 360, 395);
    }
  }
}
