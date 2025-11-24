
import { seedParser } from "./seedParser";
import type {SeedParseResult,SeedObject} from "./seedParser";
import { Worker, GraphicObject ,FlyingResource  } from "./GraphicClasses";





export class Faction{
	public data:SeedParseResult;
	
	public hq:SeedObject;
	public wood:SeedObject;
	public stone:SeedObject;
	public fruits:SeedObject;
	public clay:SeedObject;
	
	public woodImg:GraphicObject;
	public stoneImg:GraphicObject;
	public fruitsImg:GraphicObject;
	public clayImg:GraphicObject;
	
	public hqImg:GraphicObject;
	
	
	public workers: Worker[] = [];

	public flyingResources: FlyingResource[] = [];
	public actualBuilding:{name:string};
	public ai:boolean;
	public seed:string;
	constructor(seed:string,workers:{id:number,role:string}[],ai:boolean){
		this.seed=seed;
		this.data=seedParser(seed);
		this.hq=this.data.objects.hq;
		this.wood=this.data.objects.wood;
		this.stone=this.data.objects.stone;
		this.fruits=this.data.objects.fruits;
		this.clay=this.data.objects.clay;
		this.ai=ai;
		this.hqImg=new GraphicObject(this.hq.x,this.hq.y,25,25,"hq");
		
		this.woodImg=new GraphicObject(this.wood.x,this.wood.y,25,25,"wood");
		this.stoneImg=new GraphicObject(this.stone.x,this.stone.y,25,25,"stone");
		this.fruitsImg=new GraphicObject(this.fruits.x,this.fruits.y,25,25,"fruits");
		this.clayImg=new GraphicObject(this.clay.x,this.clay.y,25,25,"clay");
		this.actualBuilding={name:"farm"};
		for (const w of workers) {
		  this.workers.push(
			new Worker(
			  this.hq.x + 100,
			  this.hq.y,
			  50,
			  50,
			  "worker",
			  seed,
			  w.role
			)
			
		  );
		}
		
	}
	drawEverything(ctx:CanvasRenderingContext2D,cameraX:number,cameraY:number){
		this.hqImg.draw(ctx,cameraX,cameraY);
		this.woodImg.draw(ctx,cameraX,cameraY);
		this.stoneImg.draw(ctx,cameraX,cameraY);
		this.fruitsImg.draw(ctx,cameraX,cameraY);
		this.clayImg.draw(ctx,cameraX,cameraY);
		for(const w of this.workers){
			w.draw(ctx,cameraX,cameraY);
		}
		for(const r of this.flyingResources) {
			r.draw(ctx, cameraX, cameraY);
		}
	}
	allAI(building:{name:string},dt:number,elapsed:number){
		
		
						if(elapsed>0&&elapsed<5000){
				
							for(const worker of this.workers){
								worker.aiMovement(building, dt, "hq");
							}
						}
				if(elapsed>10000&&elapsed<15000){
						
						for(const worker of this.workers){
							worker.aiMovement(building, dt, "gather");
						}
					}
			if(elapsed>15000&&elapsed<20000){
				  if (Math.random() < 0.1) {
				this.flyingResources.push(
				  new FlyingResource(
					this.data.objects.wood.x,
					this.data.objects.wood.y,
					10,
					10,
					"wood",      // klucz do GFX albo fallback
					this.hqImg.x,
					this.hqImg.y,
					30          // prędkość px/s
				  )
				);
			  }
				if (Math.random() < 0.1) {
				this.flyingResources.push(
				  new FlyingResource(
					this.data.objects.stone.x,
					this.data.objects.stone.y,
					10,
					10,
					"stone",      // klucz do GFX albo fallback
					this.hqImg.x,
					this.hqImg.y,
					30          // prędkość px/s
				  )
				);
			  }
				if (Math.random() < 0.1) {
				this.flyingResources.push(
				  new FlyingResource(
					this.data.objects.fruits.x,
					this.data.objects.fruits.y,
					10,
					10,
					"fruits",      // klucz do GFX albo fallback
					this.hqImg.x,
					this.hqImg.y,
					30          // prędkość px/s
				  )
				);
			  }
				if (Math.random() < 0.1) {
				this.flyingResources.push(
				  new FlyingResource(
					this.data.objects.clay.x,
					this.data.objects.clay.y,
					10,
					10,
					"clay",      // klucz do GFX albo fallback
					this.hqImg.x,
					this.hqImg.y,
					30          // prędkość px/s
				  )
				);
			  }
			}
			if(elapsed>20000&&elapsed<25000){
				
				for(const worker of this.workers){
					worker.aiMovement(building, dt, "building");
				}
					
			}
			for (const r of this.flyingResources) {
			  r.update(dt, this.hq.x, this.hq.y);
			}
			this.flyingResources = this.flyingResources.filter(r => r.alive);
	}
	randomBuilding(){
		let rand=Math.random();
		if(rand<0.15)return{name:"farm"};
		else if(rand<0.3)return{name:"hunterHut"};
		else if(rand<0.45)return{name:"carpentry"};
		else if(rand<0.6)return{name:"masonry"};
		else if(rand<0.75)return{name:"pottery"};
		else if(rand<1)return{name:"house"};
	}
	addRandomWorkers(){
		let rand=Math.random();
		if(rand<0.25)return"woodcutter";
		else if(rand<0.5)return"miner";
		else if(rand<0.75)return"gatherer";
		else if(rand<1)return"clayPicker";
	}
	choosingAI(){
		this.actualBuilding=this.randomBuilding();
		this.workers.push(new Worker(
			  this.hq.x + 100,
			  this.hq.y,
			  50,
			  50,
			  "worker",
			  this.seed,
			  this.addRandomWorkers()
			));
			this.workers.push(new Worker(
			  this.hq.x + 100,
			  this.hq.y,
			  50,
			  50,
			  "worker",
			  this.seed,
			  this.addRandomWorkers()
			));
	}
	autoAi(dt:number,elapsed:number){
		this.allAI(this.actualBuilding,dt,elapsed)
	}
}
function setSeedPos(seed: string, index: number, digit: string): string {
  return seed.substring(0, index) + digit + seed.substring(index + 1);
}
export class GameFactions{
	public factions:Faction[]=[];
	public data:SeedParseResult;
	
	constructor(seed:string,workers:{id:number,role:string}[]){
		this.data=seedParser(seed);
		let seed1 = setSeedPos(seed, 5, "3");
		let seed2 = setSeedPos(seed, 5, "2");
		let seed3 = setSeedPos(seed, 5, "1");
		this.factions.push(new Faction(seed1,workers,false));
		this.factions.push(new Faction(seed2,workers,true));
		this.factions.push(new Faction(seed3,workers,true));
	}
	
	
}