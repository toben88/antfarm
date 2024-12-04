import React, { useRef, useEffect, useState } from 'react';
import { SPRITE_CONFIG } from './config/sprite';
import { TUNNEL_PATHS, GROUND_LEVEL, FRAME_COLOR, TUNNEL_COLOR, SAND_COLOR, SAND_LINES_COLOR } from './config/paths';
import { updateAntPosition, findNextTunnel, shouldReturnToGround } from './utils/antMovement';
import { drawAnt } from './utils/antDrawing';
import antGif from './assets/ant.png';

const AntFarm = () => {
  const canvasRef = useRef(null);
  const [ants, setAnts] = useState([]);
  const frameIndexRef = useRef(0);

  // Initialize ants with NFT contract addresses
  useEffect(() => {
    const fullAddresses = [
      '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', // Bored Ape Yacht Club
      '0x60E4d786628Fea6478F785A6d7e704777c86a7c6', // Mutant Ape Yacht Club
      '0x23581767a106ae21c074b2276D25e5C3e136a68b', // Moonbirds
      '0xED5AF388653567Af2F388E6224dC7C4b3241C544', // Azuki
      '0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B', // Clone X
      '0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e', // Doodles
      '0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7', // Meebits
      '0x1A92f7381B9F03921564a437210bB9396471050C'  // Cool Cats
    ];

    const truncateAddress = addr => {
      const prefix = addr.substring(0, 6);
      const suffix = addr.substring(addr.length - 4);
      return `${prefix}...${suffix}`;
    };

    // Find all valid tunnel paths (not ground or chambers)
    const tunnelPaths = TUNNEL_PATHS.filter(p => !p.type);
    
    const initialAnts = fullAddresses.map((address, index) => ({
      id: index,
      address: truncateAddress(address),
      pathIndex: TUNNEL_PATHS.indexOf(tunnelPaths[index % tunnelPaths.length]), // Distribute among tunnels
      pathProgress: Math.random(), // Random position along tunnel
      speed: (Math.random() * 0.004 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
      image: new Image(),
    }));

    initialAnts.forEach(ant => {
      ant.image.src = antGif;
    });

    setAnts(initialAnts);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastFrameTime = 0;

    const render = (timestamp) => {
      // Update frame index for sprite animation
      if (timestamp - lastFrameTime > 1000 / SPRITE_CONFIG.frameRate) {
        frameIndexRef.current = (frameIndexRef.current + 1) % SPRITE_CONFIG.totalFrames;
        lastFrameTime = timestamp;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw frame
      ctx.fillStyle = FRAME_COLOR;
      ctx.fillRect(0, 0, canvas.width, 40);
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      ctx.fillRect(0, 0, 40, canvas.height);
      ctx.fillRect(canvas.width - 40, 0, 40, canvas.height);

      // Fill sky
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(40, 40, canvas.width - 80, 80);

      // Fill underground
      ctx.fillStyle = SAND_COLOR;
      ctx.fillRect(40, GROUND_LEVEL, canvas.width - 80, canvas.height - 160);

      // Draw sand layers
      ctx.fillStyle = SAND_LINES_COLOR;
      for(let y = 200; y < canvas.height - 80; y += 80) {
        ctx.fillRect(40, y, canvas.width - 80, 2);
      }

      // Draw ground level
      ctx.strokeStyle = TUNNEL_COLOR;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, GROUND_LEVEL);
      ctx.lineTo(canvas.width - 40, GROUND_LEVEL);
      ctx.stroke();

      // Draw tunnels
      ctx.strokeStyle = TUNNEL_COLOR;
      ctx.lineWidth = 16;
      TUNNEL_PATHS.forEach(path => {
        if (!path.type) {
          ctx.beginPath();
          ctx.moveTo(path.start.x, path.start.y);
          ctx.bezierCurveTo(
            path.cp1.x, path.cp1.y,
            path.cp2.x, path.cp2.y,
            path.end.x, path.end.y
          );
          ctx.stroke();
        }
      });

      // Draw chambers
      ctx.strokeStyle = TUNNEL_COLOR;
      ctx.lineWidth = 2;
      TUNNEL_PATHS.forEach(path => {
        if (path.type === 'chamber') {
          ctx.beginPath();
          ctx.ellipse(
            path.x, 
            path.y, 
            path.width/2, 
            path.height/2, 
            0, 
            0, 
            Math.PI * 2
          );
          ctx.fillStyle = TUNNEL_COLOR;
          ctx.fill();
          ctx.stroke();
        }
      });

      // Update and draw ants
      ants.forEach(ant => {
        const path = TUNNEL_PATHS[ant.pathIndex];
        if (!path) return;

        const position = updateAntPosition(ant, path);
        
        // Handle path transitions
        if (path.type !== 'ground') {
          if (ant.pathProgress > 1 || ant.pathProgress < 0) {
            const nextPath = findNextTunnel(
              ant.pathIndex,
              ant.pathProgress > 1 ? path.end : path.start,
              TUNNEL_PATHS
            );

            if (nextPath !== -1) {
              ant.pathIndex = nextPath;
              ant.pathProgress = ant.pathProgress > 1 ? 0 : 1;
            } else if (shouldReturnToGround(position)) {
              ant.pathIndex = 0;
              ant.x = position.x;
            } else {
              ant.speed *= -1;
              ant.pathProgress = ant.pathProgress > 1 ? 1 : 0;
            }
          }
        }

        drawAnt(ctx, ant, position, frameIndexRef.current);
      });

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [ants]);

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={600}
      style={{ 
        border: `2px solid ${FRAME_COLOR}`,
        borderRadius: '10px',
        backgroundColor: SAND_COLOR
      }}
    />
  );
};

export default AntFarm; 