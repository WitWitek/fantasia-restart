// typ pojedynczego punktu na mapie
type SeedObject = {
  name: string;
  x: number;
  y: number;
};
type SeedParseResult = {
  objects: SeedObject[];
  layout: "left" | "right";
};
// 1-3 drzewo, 1-3 kamień, 1-3 krzewy, 1-3 glina, 0-1 layout, 1-3 miejsce
export function seedParser(seed: string): SeedObject[] {
  // bazowe współrzędne HQ
  const baseCoords: { x: number; y: number } = { x: 0, y: 0 };
  const layout = seed[4] === "0" ? "left" : "right";
  // seed[5] – miejsce HQ (6. znak seeda)
  switch (seed[5]) {
    case "1":
      baseCoords.x = 300;
      baseCoords.y = 0;
      break;
    case "2":
      baseCoords.x = 500;
      baseCoords.y = 400;
      break;
    case "3":
      baseCoords.x = 100;
      baseCoords.y = 400;
      break;
    default:
      // fallback, gdyby seed był krótszy / zły
      baseCoords.x = 300;
      baseCoords.y = 200;
      break;
  }

  const hq: SeedObject = { name: "hq", x: baseCoords.x, y: baseCoords.y };
  const wood: SeedObject = { name: "wood", x: hq.x, y: hq.y };
  const stone: SeedObject = { name: "stone", x: hq.x, y: hq.y };
  const fruits: SeedObject = { name: "fruits", x: hq.x, y: hq.y };
  const clay: SeedObject = { name: "clay", x: hq.x, y: hq.y };

  // wood – seed[0]
  switch (seed[0]) {
    case "1":
      wood.x = hq.x;
      wood.y = hq.y - 50;
      break;
    case "2":
      wood.x = hq.x + 100;
      wood.y = hq.y;
      break;
    case "3":
      wood.x = hq.x;
      wood.y = hq.y + 50;
      break;
  }

  // stone – seed[1]
  switch (seed[1]) {
    case "1":
      stone.x = hq.x + 10;
      stone.y = hq.y - 50;
      break;
    case "2":
      stone.x = hq.x + 100;
      stone.y = hq.y - 10;
      break;
    case "3":
      stone.x = hq.x + 10;
      stone.y = hq.y + 50;
      break;
  }

  // fruits – seed[2]
  switch (seed[2]) {
    case "1":
      fruits.x = hq.x + 20;
      fruits.y = hq.y - 50;
      break;
    case "2":
      fruits.x = hq.x + 100;
      fruits.y = hq.y - 20;
      break;
    case "3":
      fruits.x = hq.x + 20;
      fruits.y = hq.y + 50;
      break;
  }

  // clay – seed[3]
  switch (seed[3]) {
    case "1":
      clay.x = hq.x + 30;
      clay.y = hq.y - 50;
      break;
    case "2":
      clay.x = hq.x + 100;
      clay.y = hq.y - 30;
      break;
    case "3":
      clay.x = hq.x + 30;
      clay.y = hq.y + 50;
      break;
  }

    return {
    objects: [hq, wood, stone, fruits, clay],
    layout,
  };
}
