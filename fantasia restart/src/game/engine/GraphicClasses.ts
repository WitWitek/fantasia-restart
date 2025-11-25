

import { seedParser } from "./seedParser";
import type{WorkerRole} from "./Types";

export const GFX: Record<string, HTMLImageElement> = {
  worker: loadImage("../../../graphics/worker.png"),
  hq: loadImage("../../../graphics/hq.png"),
  wood: loadImage("../../../graphics/wood.png"),
  stone : loadImage("../../../graphics/stone.png"),
    fruits: loadImage("../../../graphics/fruits.png"),
	 clay: loadImage("../../../graphics/clay.png"),
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
	draw(ctx: CanvasRenderingContext2D,cameraX:number,cameraY:number){
		    if (!this.graphics || !this.graphics.complete) {
    // placeholder – kolorowy kwadrat zamiast obrazka
    ctx.fillStyle = "#ff00ff";
    ctx.fillRect(this.x+cameraX, this.y+cameraY, this.w, this.h);
    return;
  }
    ctx.fillStyle = "#ff00ff";
    ctx.fillRect(this.x+cameraX, this.y+cameraY, this.w, this.h);
		//ctx.drawImage(this.graphics,this.x,this.y,this.w,this.h);
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
		if(this.role==="ranged"||this.role==="warrior"){
			if(phase==="hq"||phase==="building")this.moveToAnchor(hq.x,hq.y,dt);
			else{
				this.moveToAnchor(336,300,dt);
			}
			 return;  // ← ← ← KLUCZOWE !!!
		}else{
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
						this.moveToAnchor(hq.x+30,hq.y+20,dt);
						
						break;
						case"carpentry":
						this.moveToAnchor(hq.x+30,hq.y-20,dt);
						
						break;
						case"masonry":
						this.moveToAnchor(hq.x-30,hq.y,dt);
						
						break;
						case"pottery":
						this.moveToAnchor(hq.x-30,hq.y+30,dt);
						
						break;
						case"barracks":
						this.moveToAnchor(hq.x-30,hq.y-30,dt);

						break;
						
						case"house":
						this.moveToAnchor(hq.x+30,hq.y,dt);

						break;
						}
					break;
				}
				 return;  // ← ← ← KLUCZOWE !!!
		}
	}
	
}
export class FlyingResource extends GraphicObject {
  public vx: number;
  public vy: number;
  public alive: boolean = true;

  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    src: string,
    targetX: number,
    targetY: number,
    speed: number
  ) {
    super(x, y, w, h, src);

    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const nx = dx / dist;
    const ny = dy / dist;

    this.vx = nx * speed;
    this.vy = ny * speed;
  }

  update(dt: number, targetX: number, targetY: number) {
    if (!this.alive) return;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // dotarło do HQ
    if (dist < 4) {
      this.alive = false;
      return;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
}
