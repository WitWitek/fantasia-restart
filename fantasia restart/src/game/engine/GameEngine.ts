// src/game/engine/GameEngine.ts
import type { GameState, Phase } from "../types";
import { endOfSimulationPhase } from "../logic";

type EngineCallbacks = {
  onGameStateChange: (state: GameState) => void;
  onPhaseChange: (phase: Phase) => void;
};

export class GameEngine {
  private ctx: CanvasRenderingContext2D;
  private gameState!: GameState;
  private phase: Phase = "freeze";

  private callbacks: EngineCallbacks;
  private rafId: number | null = null;

  // symulacja 30s
  private simStartTime: number | null = null;
  private SIMULATION_DURATION = 30000; // 30 sekund

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Brak context2d w canvasie.");

    this.ctx = ctx;
    this.callbacks = callbacks;

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
    this.update(timestamp);
    this.render();

    this.rafId = requestAnimationFrame(this.loop);
  }

  /** ************************************************************
   * UPDATE — logika 30-sekundowej tury
   ************************************************************* */
  private update(timestamp: number) {
    if (this.phase !== "simulation") return;

    if (this.simStartTime === null) this.simStartTime = timestamp;

    const elapsed = timestamp - this.simStartTime;

    
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
    ctx.fillRect(350, 180, 100, 100);

    ctx.fillStyle = "#ddd";
    ctx.font = "16px sans-serif";
    ctx.fillText("HQ", 385, 235);

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
