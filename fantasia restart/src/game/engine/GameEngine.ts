// src/game/engine/GameEngine.ts

import { endOfSimulationPhase } from "./logic";
import { GameFactions } from "./Factions";
import type { GameState, Phase } from "./types";
import { INITIAL_GAME_STATE } from "./types";
import type{BuildingType,WorkerRole} from "./types"
import { seedParser } from "./seedParser";
import { Worker, GraphicObject ,FlyingResource  } from "./GraphicClasses";
type EngineCallbacks = {
  onGameStateChange: (state: GameState) => void;
  onPhaseChange: (phase: Phase) => void;
};

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private gameState!: GameState;
  private phase: Phase = "freeze";
private cameraX: number = 0;
private cameraY: number = 0;
  private callbacks: EngineCallbacks;
  private rafId: number | null = null;
	private data:any;
	private currentBuilding:BuildingType;
  // symulacja 30s
  private simStartTime: number | null = null;
  private lastTimestamp: number = performance.now();

  private SIMULATION_DURATION = 30000; // 30 sekund
	private factions:GameFactions;
	private goldNode:GraphicObject;
	private magicCrystal:GraphicObject;
  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
	 
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Brak context2d w canvasie.");
	this.ctx = ctx;
	 this.callbacks = callbacks; 
this.gameState = INITIAL_GAME_STATE;
this.goldNode=new GraphicObject(335,300,25,25,"gold");
this.magicCrystal=new GraphicObject(365,300,25,25,"crystal");

const currentWorkers: { id:number, role:string }[] = this.gameState.workers;



this.factions=new GameFactions(this.gameState.seed,currentWorkers)
for (let f of this.factions.factions){
	for(let w of f.workers){
		w.x=f.hq.x+100;
		w.y=f.hq.y;
	}
}



const last = this.gameState.buildQueue[this.gameState.buildQueue.length - 1];
this.currentBuilding = last ? last.buildingType : "farm";

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
		this.syncPlayerWorkers();
      this.simStartTime = performance.now();
    }

    this.phase = phase;
  }

  /** Start pętli animacji */
  private startLoop() {
	  
const currentWorkers: { id:number, role:string }[] = this.gameState.workers;
let activeWorkers:Worker[]=[];
for(const w of currentWorkers){
	activeWorkers.push(new Worker(this.factions.factions[0].hq.x+100,this.factions.factions[0].hq.y,25,25,"worker",this.factions.factions[0].seed,w.role));
}
  this.factions.factions[0].workers=activeWorkers;
  console.log('workersi ',this.factions.factions[0].workers,this.factions.factions[1].workers);
    if (this.rafId != null) return;
	for(let f of this.factions.factions){
		if(f.ai)f.choosingAI();
	}
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
private syncPlayerWorkers() {
  const base = this.factions.factions[0];
  const workersFromState = this.gameState.workers;

  base.workers = workersFromState.map(
    w => new Worker(
      base.hq.x + 100,
      base.hq.y,
      25,
      25,
      "worker",
      base.seed,
      w.role
    )
  );
}


  private update(timestamp: number, dt: number) {
	  
    if (this.phase !== "simulation") return;

    if (this.simStartTime === null) this.simStartTime = timestamp;

    const elapsed = timestamp - this.simStartTime;
	
	
const last = this.gameState.buildQueue[this.gameState.buildQueue.length - 1];
this.currentBuilding = last ? last.buildingType : this.currentBuilding;
	const buildingString=this.currentBuilding;
for (let f of this.factions.factions) {
  if (f.ai) {
    // AI frakcji używa swojego losowego budynku
    f.allAI(f.actualBuilding, dt, elapsed);
  } else {
    // frakcja gracza używa budynku z kolejki
    f.allAI({ name: this.currentBuilding }, dt, elapsed);
  }
}
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
    //ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	
    // HQ placeholder
    ctx.fillStyle = "#444";
	this.goldNode.draw(ctx,this.cameraX,this.cameraY);
	this.magicCrystal.draw(ctx,this.cameraX,this.cameraY);
//ctx.fillRect(this.data.objects.hq.x - 25, this.data.objects.hq.y - 25, 50, 50);
	for(let f of this.factions.factions)f.drawEverything(ctx,this.cameraX,this.cameraY);
    ctx.fillStyle = "#ddd";
    ctx.font = "16px sans-serif";
    
//workersi


//nody



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
      ctx.fillRect(20, 570, 760, 20);

      ctx.fillStyle = "#44ff66";
      ctx.fillRect(20, 570, 760 * pct, 20);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${Math.floor(elapsed / 1000)}s / 30s`, 360, 565);
    }
  }
}
