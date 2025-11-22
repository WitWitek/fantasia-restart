

import { seedParser } from "/seedParser";
import type{WorkerRole} from "/Types";

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
	constructor(x: number, y: number, w: number, h: number, src: string,seed:string,role:WorkerRole){
		super(x,y,w,h,src);
		if(!seed)this.data=null;
		this.data=seedParser(seed);
		this.role=role;
		this.target="hq";
	}
	moveToAnchor(x: number,y: number){
		if(x>this.x)this.x++;
		else if(x<this.x)this.x--
		if(y>this.y)this.y++;
		else if(y<this.y)this.y--
	
	}
	aiMovement(building:{name:string}){
		const hq=this.data.objects.hq;
		const stone=this.data.objects.stone;
		const wood=this.data.objects.wood;
		const fruits=this.data.objects.fruits;
		const clay=this.data.objects.clay;
		switch(this.target){
			case "hq":
			this.moveToAnchor(hq.x,hq.y);
			if(this.x==hq.x&&this.y==hq.y){
				switch(this.role){
					case "woodcutter":
					this.target="wood";
					break;
					case "miner":
					this.target="stone";
					break;
					case "gatherer":
					this.target="fruits";
					break;
					case"clayPicker":
					this.target="clay";
					break;
				}
			}
			break;
			case"wood":
			this.moveToAnchor(wood.x,wood.y);
			if(this.x==wood.x&&this.y==wood.y)this.target=building.name;
			break;
			case"stone":
			this.moveToAnchor(stone.x,stone.y);
			if(this.x==stone.x&&this.y==stone.y)this.target=building.name;
			break;
			case"fruits":
			this.moveToAnchor(fruits.x,fruits.y);
			if(this.x==fruits.x&&this.y==fruits.y)this.target=building.name;
			break;
			case"clay":
			this.moveToAnchor(clay.x,clay.y);
			if(this.x==clay.x&&this.y==clay.y)this.target=building.name;
			break;
			case"farm":
			this.moveToAnchor(hq.x+30,hq.y);
			if(this.x==hq.x+30&&this.y==hq.y){
				this.target="hq"
			}
			break;
			case"hunterHut":
			this.moveToAnchor(hq.x+30,hq.y-20);
			if(this.x==hq.x+30&&this.y==hq.y-20){
				this.target="hq"
			}
			break;
			case"carpentry":
			this.moveToAnchor(hq.x+30,hq.y+20);
			if(this.x==hq.x+30&&this.y==hq.y+20){
				this.target="hq"
			}
			break;
			case"masonry":
			this.moveToAnchor(hq.x-30,hq.y);
			if(this.x==hq.x-30&&this.y==hq.y){
				this.target="hq"
			}
			break;
			case"pottery":
			this.moveToAnchor(hq.x-30,hq.y-20);
			if(this.x==hq.x-30&&this.y==hq.y-20){
				this.target="hq"
			}
			break;
			case"house":
			this.moveToAnchor(hq.x-30,hq.y+20);
			if(this.x==hq.x-30&&this.y==hq.y+20){
				this.target="hq"
			}
			break;
		}
		
	}
	multipleAi(speedPerTick, building) {
  for (let i = 0; i < speedPerTick; i++) {
    this.aiMovement(building);
  }
}
}
