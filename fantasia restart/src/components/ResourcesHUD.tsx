// src/components/ResourcesHUD.tsx
import type { Resources } from "../game/engine/Types";

type ResourcesHUDProps = {
  resources: Resources;
};

export function ResourcesHUD({ resources }: ResourcesHUDProps) {
  const { wood, stone, food, clay } = resources;

  return (
    <div className="w-full max-w-xl mx-auto mt-2 mb-2">
      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700">
          <div className="font-semibold">Wood</div>
          <div className="text-lg font-mono">{wood}</div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700">
          <div className="font-semibold">Stone</div>
          <div className="text-lg font-mono">{stone}</div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700">
          <div className="font-semibold">Food</div>
          <div className="text-lg font-mono">{food}</div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700">
          <div className="font-semibold">Clay</div>
          <div className="text-lg font-mono">{clay}</div>
        </div>
      </div>
    </div>
  );
}
