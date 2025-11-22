

import { seedParser } from "./seedParser";
import type{WorkerRole} from "./Types";

export const GFX: Record<string, HTMLImageElement> = {
  worker: loadImage("../../../graphics/worker.png"),
  hq: loadImage("../../../graphics/hq.png"),
  tree: loadImage("../../../graphics/tree.png"),
};

function loadImage(src: string): HTMLImageElement {
  const img = new Image();
  img.src = src;
  return img;
}

export class GraphicObject{
	public x: number;
public y: number;
public w: number;
public h: number;

public graphics: HTMLImageElement | undefined;
	constructor(x: number, y: number, w: number, h: number, src: string){
		this.x=x;
		this.y=y;
		this.w=w;
		this.h=h;
		this.graphics=GFX[src];
	}
	draw(ctx: CanvasRenderingContext2D){
		  if (!this.graphics) return;
		ctx.drawImage(this.graphics,this.x,this.y,this.w,this.h);
	}
}
export class Worker extends GraphicObject{
		public data:any;
		public target:string;
		public role:WorkerRole;
		public speed:number;
	constructor(x: number, y: number, w: number, h: number, src: string,seed:string,role:WorkerRole){
		super(x,y,w,h,src);
		this.data = seed ? seedParser(seed) : null;
		this.role=role;
		this.target="hq";
		this.speed = 40 + Math.random() * 40; // 40–80 px/s
	}
	moveToAnchor(targetX: number, targetY: number,  dt: number) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return; // już praktycznie na miejscu

    // jednostka wektorowa kierunku
    const nx = dx / dist;
    const ny = dy / dist;

    // ruch (pixele na sekundę * czas w sekundach)
    const step = this.speed * dt;

    // żeby jednostka nie "przeleciała" celu
    if (step >= dist) {
        this.x = targetX;
        this.y = targetY;
        return;
    }

    this.x += nx * step;
    this.y += ny * step;
}

	aiMovement(building:{name:string},dt:number,phase:string){
		const hq=this.data.objects.hq;
		const stone=this.data.objects.stone;
		const wood=this.data.objects.wood;
		const fruits=this.data.objects.fruits;
		const clay=this.data.objects.clay;
		switch(phase){
			case "hq":
			this.moveToAnchor(hq.x,hq.y,dt);
			break;
			case"gather":
				switch(this.role){
					case "woodcutter":
					this.moveToAnchor(wood.x,wood.y,dt);
					break;
					case "miner":
					this.moveToAnchor(stone.x,stone.y,dt);
					break;
					case "gatherer":
					this.moveToAnchor(fruits.x,fruits.y,dt);
					break;
					case"clayPicker":
					this.moveToAnchor(clay.x,clay.y,dt);
					break;
				}
			
			break;	
				case"building":
				switch(building.name){
				case"farm":
				this.moveToAnchor(hq.x+30,hq.y,dt);
			
				break;
				case"hunterHut":
				this.moveToAnchor(hq.x+30,hq.y-20,dt);
				
				break;
				case"carpentry":
				this.moveToAnchor(hq.x+30,hq.y+20,dt);
				
				break;
				case"masonry":
				this.moveToAnchor(hq.x-30,hq.y,dt);
				
				break;
				case"pottery":
				this.moveToAnchor(hq.x-30,hq.y-20,dt);
				
				break;
				case"house":
				this.moveToAnchor(hq.x-30,hq.y+20,dt);

				break;
				}
			break;
		}
		
	}
	
}
