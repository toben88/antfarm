export const TUNNEL_PATHS = [
  {
    type: 'ground',
    y: 120,
    minX: 40,
    maxX: 960
  },
  // First main tunnel from left
  {
    start: { x: 200, y: 120 },
    cp1: { x: 200, y: 180 },
    cp2: { x: 250, y: 200 },
    end: { x: 300, y: 250 }
  },
  {
    start: { x: 300, y: 250 },
    cp1: { x: 350, y: 300 },
    cp2: { x: 300, y: 350 },
    end: { x: 350, y: 400 }
  },
  // Second entrance
  {
    start: { x: 350, y: 120 },
    cp1: { x: 350, y: 160 },
    cp2: { x: 300, y: 200 },
    end: { x: 350, y: 250 }
  },
  {
    start: { x: 350, y: 250 },
    cp1: { x: 400, y: 300 },
    cp2: { x: 350, y: 350 },
    end: { x: 400, y: 380 }
  },
  // Middle entrance
  {
    start: { x: 500, y: 120 },
    cp1: { x: 500, y: 170 },
    cp2: { x: 450, y: 220 },
    end: { x: 500, y: 280 }
  },
  {
    start: { x: 500, y: 280 },
    cp1: { x: 550, y: 340 },
    cp2: { x: 500, y: 380 },
    end: { x: 550, y: 420 }
  },
  // Right side entrances
  {
    start: { x: 650, y: 120 },
    cp1: { x: 650, y: 180 },
    cp2: { x: 600, y: 220 },
    end: { x: 650, y: 270 }
  },
  {
    start: { x: 650, y: 270 },
    cp1: { x: 700, y: 320 },
    cp2: { x: 650, y: 370 },
    end: { x: 700, y: 400 }
  },
  // Far right entrance
  {
    start: { x: 800, y: 120 },
    cp1: { x: 800, y: 160 },
    cp2: { x: 750, y: 200 },
    end: { x: 800, y: 250 }
  },
  {
    start: { x: 800, y: 250 },
    cp1: { x: 850, y: 300 },
    cp2: { x: 800, y: 350 },
    end: { x: 750, y: 380 }
  },
  // Horizontal connections
  {
    start: { x: 300, y: 250 },
    cp1: { x: 350, y: 250 },
    cp2: { x: 400, y: 260 },
    end: { x: 450, y: 250 }
  },
  {
    start: { x: 500, y: 280 },
    cp1: { x: 550, y: 280 },
    cp2: { x: 600, y: 290 },
    end: { x: 650, y: 270 }
  },
  {
    start: { x: 350, y: 400 },
    cp1: { x: 400, y: 400 },
    cp2: { x: 450, y: 410 },
    end: { x: 500, y: 400 }
  },
  {
    start: { x: 550, y: 420 },
    cp1: { x: 600, y: 420 },
    cp2: { x: 650, y: 430 },
    end: { x: 700, y: 400 }
  },
  // Chambers
  {
    type: 'chamber',
    x: 300,
    y: 300,
    width: 80,
    height: 60
  },
  {
    type: 'chamber',
    x: 500,
    y: 350,
    width: 100,
    height: 70
  },
  {
    type: 'chamber',
    x: 700,
    y: 320,
    width: 90,
    height: 65
  }
];

export const GROUND_LEVEL = 120;
export const FRAME_COLOR = '#13B11E';
export const TUNNEL_COLOR = '#795548'; 
export const SAND_COLOR = '#F2e9d0'; 
export const SAND_LINES_COLOR = '#E5DCC3'; 