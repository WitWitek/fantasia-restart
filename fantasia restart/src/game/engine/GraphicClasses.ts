



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

	
	constructor(x: number, y: number, w: number, h: number, src: string){
		super(x,y,w,h,src);
		
	}
	moveToAnchor(x: number,y: number){
		if(x>this.x)this.x++;
		else if(x<this.x)this.x--
		if(y>this.y)this.y++;
		else if(y<this.y)this.y--
	
	}
}