import React, { useEffect, useRef, useState } from 'react';
import antGif from '../assets/ant.png';

const SPRITE_CONFIG = {
  width: 101,     // 202 * 0.5
  height: 124,    // 248 * 0.5
  columns: 8,     // Your sprite sheet columns
  rows: 8,        // Your sprite sheet rows
  totalFrames: 62,// Your total frames
  frameRate: 8   // Animation speed
};

// Define walking animation frames (adjust these numbers based on your sprite sheet)
const WALK_ANIMATION = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61]; // Use indices of your walking animation frames

// Add these path definitions at the top of your component
const PATHS = {
  groundLevel: { y: 120, minX: 40, maxX: 960 },
  tunnels: [
    // Main entrance tunnels from surface
    { x1: 200, y1: 120, x2: 200, y2: 250, type: 'vertical' },
    { x1: 400, y1: 120, x2: 400, y2: 200, type: 'vertical' },
    { x1: 600, y1: 120, x2: 600, y2: 180, type: 'vertical' },
    
    // Branching paths with angles
    { x1: 200, y1: 250, x2: 300, y2: 300, type: 'diagonal' },
    { x1: 300, y1: 300, x2: 400, y2: 280, type: 'diagonal' },
    { x1: 400, y1: 280, x2: 500, y2: 320, type: 'diagonal' },
    
    // Secondary branches
    { x1: 400, y1: 200, x2: 450, y2: 250, type: 'diagonal' },
    { x1: 450, y1: 250, x2: 500, y2: 230, type: 'diagonal' },
    { x1: 600, y1: 180, x2: 550, y2: 220, type: 'diagonal' },
    
    // Deep tunnels
    { x1: 300, y1: 300, x2: 300, y2: 450, type: 'vertical' },
    { x1: 500, y1: 320, x2: 500, y2: 480, type: 'vertical' },
    
    // Lower connections
    { x1: 300, y1: 450, x2: 400, y2: 470, type: 'diagonal' },
    { x1: 400, y1: 470, x2: 500, y2: 480, type: 'diagonal' },
    
    // Chambers at various depths
    { x1: 250, y1: 250, x2: 350, y2: 250, type: 'chamber' },
    { x1: 450, y1: 320, x2: 550, y2: 320, type: 'chamber' },
    { x1: 350, y1: 470, x2: 450, y2: 470, type: 'chamber' },
    
    // Small side tunnels
    { x1: 250, y1: 250, x2: 220, y2: 280, type: 'diagonal' },
    { x1: 350, y1: 250, x2: 380, y2: 270, type: 'diagonal' },
    { x1: 450, y1: 320, x2: 420, y2: 350, type: 'diagonal' },
    { x1: 550, y1: 320, x2: 580, y2: 340, type: 'diagonal' }
  ]
};

// Add these helper functions at the top of your component
const getBezierPoint = (t, p0, p1, p2, p3) => {
  const oneMinusT = 1 - t;
  return {
    x: Math.pow(oneMinusT, 3) * p0.x +
       3 * Math.pow(oneMinusT, 2) * t * p1.x +
       3 * oneMinusT * Math.pow(t, 2) * p2.x +
       Math.pow(t, 3) * p3.x,
    y: Math.pow(oneMinusT, 3) * p0.y +
       3 * Math.pow(oneMinusT, 2) * t * p1.y +
       3 * oneMinusT * Math.pow(t, 2) * p2.y +
       Math.pow(t, 3) * p3.y
  };
};

const getBezierTangent = (t, p0, p1, p2, p3) => {
  const oneMinusT = 1 - t;
  const tx = -3 * p0.x * Math.pow(oneMinusT, 2) +
             3 * p1.x * (1 - 4*t + 3*Math.pow(t, 2)) +
             3 * p2.x * (2*t - 3*Math.pow(t, 2)) +
             3 * p3.x * Math.pow(t, 2);
  const ty = -3 * p0.y * Math.pow(oneMinusT, 2) +
             3 * p1.y * (1 - 4*t + 3*Math.pow(t, 2)) +
             3 * p2.y * (2*t - 3*Math.pow(t, 2)) +
             3 * p3.y * Math.pow(t, 2);
  return Math.atan2(ty, tx);
};

// Define tunnel paths
const TUNNEL_PATHS = [
  {
    type: 'ground',
    y: 120,
    minX: 40,
    maxX: 960
  },
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
  // Add more path segments for each tunnel curve
];

const AntFarm = () => {
  const canvasRef = useRef(null);
  const [ants, setAnts] = useState([]);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex(prev => {
        // Only cycle through walking animation frames
        const nextIndex = (prev + 1) % WALK_ANIMATION.length;
        return WALK_ANIMATION[nextIndex];
      });
    }, SPRITE_CONFIG.frameRate);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const mockAddresses = [
      '0x1234...abcd',
      '0x5678...efgh',
      '0x90ab...ijkl',
      '0xcdef...mnop',
      '0x4567...qrst',
      '0x8901...uvwx',
      '0x2345...yz12',
      '0x6789...3456',
    ];

    const initialAnts = mockAddresses.map((address, index) => ({
      id: index,
      address,
      pathIndex: Math.floor(Math.random() * TUNNEL_PATHS.length),
      pathProgress: Math.random(),
      speed: (Math.random() * 0.002 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
      image: new Image(),
    }));

    initialAnts.forEach(ant => {
      ant.image.src = antGif;
    });

    setAnts(initialAnts);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw wooden frame
      ctx.fillStyle = '#81E798';
      ctx.fillRect(0, 0, canvas.width, 40);
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      ctx.fillRect(0, 0, 40, canvas.height);
      ctx.fillRect(canvas.width - 40, 0, 40, canvas.height);

      // Fill with sand color
      ctx.fillStyle = '#F2E9D0';
      ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);

      // Add sand texture/layers
      ctx.fillStyle = '#E5DCC3';
      for(let y = 100; y < canvas.height - 80; y += 80) {
        ctx.fillRect(40, y, canvas.width - 80, 2);
      }

      // Fill sky (above ground) with white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(40, 40, canvas.width - 80, 80); // From top frame to ground level

      // Fill underground with sand color
      ctx.fillStyle = '#F2E9D0';
      ctx.fillRect(40, 120, canvas.width - 80, canvas.height - 160);

      // Draw ground level line
      ctx.strokeStyle = '#7D2F0F';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, 120);
      ctx.lineTo(canvas.width - 40, 120);
      ctx.stroke();

      // Draw tunnels with organic curves
      ctx.strokeStyle = '#7D2F0F';
      ctx.fillStyle = '#7D2F0F';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Entry holes
      ctx.beginPath();
      [200, 350, 500, 650, 800].forEach(x => {
        ctx.arc(x, 120, 6, 0, Math.PI * 2);
      });
      ctx.fill();

      // Draw and fill chambers first (so tunnels draw over them)
      ctx.beginPath();
      [
        [350, 300, 40, 25],
        [500, 350, 45, 30],
        [650, 320, 35, 25],
        [450, 450, 50, 35]
      ].forEach(([x, y, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();  // Fill each chamber
      });

      // Then draw tunnel system (same as before)
      ctx.beginPath();
      
      // First main tunnel from left
      ctx.moveTo(200, 120);
      ctx.bezierCurveTo(200, 180, 250, 200, 300, 250);
      ctx.bezierCurveTo(350, 300, 300, 350, 350, 400);
      
      // Connect to second entrance
      ctx.moveTo(350, 120);
      ctx.bezierCurveTo(350, 160, 300, 200, 350, 250);
      ctx.bezierCurveTo(400, 300, 350, 350, 400, 380);
      
      // Middle entrance and connections
      ctx.moveTo(500, 120);
      ctx.bezierCurveTo(500, 170, 450, 220, 500, 280);
      ctx.bezierCurveTo(550, 340, 500, 380, 550, 420);
      
      // Right side entrances and tunnels
      ctx.moveTo(650, 120);
      ctx.bezierCurveTo(650, 180, 600, 220, 650, 270);
      ctx.bezierCurveTo(700, 320, 650, 370, 700, 400);
      
      ctx.moveTo(800, 120);
      ctx.bezierCurveTo(800, 160, 750, 200, 800, 250);
      ctx.bezierCurveTo(850, 300, 800, 350, 750, 380);

      // Horizontal connections
      ctx.moveTo(300, 250);
      ctx.bezierCurveTo(350, 250, 400, 260, 450, 250);
      
      ctx.moveTo(500, 280);
      ctx.bezierCurveTo(550, 280, 600, 290, 650, 270);
      
      ctx.moveTo(350, 400);
      ctx.bezierCurveTo(400, 400, 450, 410, 500, 400);
      
      ctx.moveTo(550, 420);
      ctx.bezierCurveTo(600, 420, 650, 430, 700, 400);

      ctx.stroke();

      ants.forEach(ant => {
        const path = TUNNEL_PATHS[ant.pathIndex];
        
        if (!path) return;

        if (path.type === 'ground') {
          // Ground movement
          if (typeof ant.x === 'undefined') {
            ant.x = path.minX + (Math.random() * (path.maxX - path.minX));
          }

          // Move along ground
          ant.x += ant.speed * 50;

          // Bounce at edges
          if (ant.x <= path.minX || ant.x >= path.maxX) {
            ant.speed *= -1;
            ant.x = Math.max(path.minX, Math.min(path.maxX, ant.x));
          }

          // Check for tunnel entrances
          const entrances = [200, 350, 500, 650, 800];  // match your tunnel entry points
          const nearestEntrance = entrances.find(x => Math.abs(x - ant.x) < 10);
          
          if (nearestEntrance && Math.random() < 0.01) {  // 1% chance to enter tunnel
            // Find corresponding tunnel path
            const tunnelIndex = TUNNEL_PATHS.findIndex(p => 
              p.type !== 'ground' && 
              Math.abs(p.start.x - nearestEntrance) < 5 &&
              p.start.y === 120
            );
            if (tunnelIndex !== -1) {
              ant.pathIndex = tunnelIndex;
              ant.pathProgress = 0;
              delete ant.x;
            }
          }

          // Draw ant on ground
          ctx.save();
          ctx.translate(ant.x, path.y);
          ctx.rotate(ant.speed < 0 ? Math.PI * 1.5 : Math.PI/2);
          
          ctx.drawImage(
            ant.image,
            (frameIndex % SPRITE_CONFIG.columns) * SPRITE_CONFIG.width,
            Math.floor(frameIndex / SPRITE_CONFIG.columns) * SPRITE_CONFIG.height,
            SPRITE_CONFIG.width,
            SPRITE_CONFIG.height,
            -SPRITE_CONFIG.width/16,
            -SPRITE_CONFIG.height/16,
            SPRITE_CONFIG.width/4,
            SPRITE_CONFIG.height/4
          );
          ctx.restore();

        } else {
          // Tunnel movement
          ant.pathProgress += ant.speed;
          
          if (ant.pathProgress > 1) {
            // Look for connecting tunnel at end point
            const currentEnd = path.end;
            const nextPath = TUNNEL_PATHS.findIndex((p, index) => {
              return index !== ant.pathIndex && // not the same tunnel
                     p.type !== 'ground' && // not the ground
                     Math.abs(p.start.x - currentEnd.x) < 5 && // x coordinate matches
                     Math.abs(p.start.y - currentEnd.y) < 5;   // y coordinate matches
            });

            if (nextPath !== -1) {
              // Found connecting tunnel, switch to it
              ant.pathIndex = nextPath;
              ant.pathProgress = 0;
            } else {
              // No connecting tunnel, check if at ground level
              if (Math.abs(currentEnd.y - 120) < 5) {
                // At ground level, switch to ground movement
                ant.pathIndex = 0;
                ant.x = currentEnd.x;
                delete ant.pathProgress;
              } else {
                // Not at ground, reverse direction
                ant.speed *= -1;
                ant.pathProgress = 1;
              }
            }
          } else if (ant.pathProgress < 0) {
            // Similar logic for start point
            const currentStart = path.start;
            const nextPath = TUNNEL_PATHS.findIndex((p, index) => {
              return index !== ant.pathIndex &&
                     p.type !== 'ground' &&
                     Math.abs(p.end.x - currentStart.x) < 5 &&
                     Math.abs(p.end.y - currentStart.y) < 5;
            });

            if (nextPath !== -1) {
              // Found connecting tunnel, switch to it
              ant.pathIndex = nextPath;
              ant.pathProgress = 1;
            } else {
              // No connecting tunnel, check if at ground level
              if (Math.abs(currentStart.y - 120) < 5) {
                // At ground level, switch to ground movement
                ant.pathIndex = 0;
                ant.x = currentStart.x;
                delete ant.pathProgress;
              } else {
                // Not at ground, reverse direction
                ant.speed *= -1;
                ant.pathProgress = 0;
              }
            }
          }

          // Continue with existing position calculation and drawing code
          const pos = getBezierPoint(
            ant.pathProgress,
            path.start,
            path.cp1,
            path.cp2,
            path.end
          );
          
          const angle = getBezierTangent(
            ant.pathProgress,
            path.start,
            path.cp1,
            path.cp2,
            path.end
          );

          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate(angle + (ant.speed < 0 ? Math.PI * 1.5 : Math.PI/2));
          
          ctx.drawImage(
            ant.image,
            (frameIndex % SPRITE_CONFIG.columns) * SPRITE_CONFIG.width,
            Math.floor(frameIndex / SPRITE_CONFIG.columns) * SPRITE_CONFIG.height,
            SPRITE_CONFIG.width,
            SPRITE_CONFIG.height,
            -SPRITE_CONFIG.width/16,
            -SPRITE_CONFIG.height/16,
            SPRITE_CONFIG.width/4,
            SPRITE_CONFIG.height/4
          );
          ctx.restore();
        }
      });

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [ants, frameIndex]);

  return (
    <div className="ant-farm">
      <canvas
        ref={canvasRef}
        width={1000}    // Wider for classic ant farm look
        height={600}    // Keep height the same
        style={{ 
          border: '2px solid #81E798',  // Match frame color
          borderRadius: '10px',         // Slightly rounded corners
          backgroundColor: '#8B4513'    // Match frame color
        }}
      />
    </div>
  );
};

export default AntFarm; 