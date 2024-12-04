import { getBezierPoint, getBezierTangent } from './bezierHelpers';
import { GROUND_LEVEL, TUNNEL_PATHS } from '../config/paths';

export const updateAntPosition = (ant, path) => {
  // Ground movement
  if (path.type === 'ground') {
    // Initialize position if needed
    if (typeof ant.x === 'undefined') {
      ant.x = path.minX + (Math.random() * (path.maxX - path.minX));
      ant.y = Math.random() * (GROUND_LEVEL - 20); // Keep away from ground
      ant.angle = Math.random() * Math.PI * 2; // Random direction
      ant.wanderAngle = ant.angle;
    }

    // Update wander angle slightly each frame - reduced from 0.3 to 0.05
    ant.wanderAngle += (Math.random() - 0.5) * 0.05; // Slower wandering

    // Avoid edges more aggressively
    const margin = 5; // Distance to start avoiding edges
    const topMargin = 45; // Keep away from top 45 pixels
    
    if (ant.x < path.minX + margin) {
      ant.wanderAngle = Math.PI * 0.5;
    } else if (ant.x > path.maxX - margin) {
      ant.wanderAngle = -Math.PI * 0.5;
    }
    if (ant.y < topMargin) {  // Changed from margin to topMargin
      ant.wanderAngle = Math.PI * 0.5;  // Force downward movement
    } else if (ant.y > GROUND_LEVEL - margin) {
      ant.wanderAngle = -Math.PI * 0.5;
    }

    // Gradually turn towards wander angle - reduced from 0.1 to 0.03
    const turnSpeed = 0.03; // Slower turning
    const angleDiff = ((ant.wanderAngle - ant.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    ant.angle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnSpeed);

    // Move in current direction
    const speed = Math.abs(ant.speed) * 50;
    ant.x += Math.cos(ant.angle) * speed;
    ant.y += Math.sin(ant.angle) * speed;

    // Keep within bounds
    ant.x = Math.max(path.minX + margin, Math.min(path.maxX - margin, ant.x));
    ant.y = Math.max(margin, Math.min(GROUND_LEVEL - margin, ant.y));

    // Check for tunnel entrances
    if (Math.abs(ant.y - GROUND_LEVEL) < 20 && Math.random() < 0.02) {
      const entrance = TUNNEL_PATHS.find(p => 
        !p.type && 
        p.start.y === GROUND_LEVEL && 
        Math.abs(p.start.x - ant.x) < 5
      );
      
      if (entrance) {
        ant.pathIndex = TUNNEL_PATHS.indexOf(entrance);
        ant.pathProgress = 0.1;
        ant.speed = Math.abs(ant.speed);
        delete ant.x;
        delete ant.y;
        delete ant.angle;
        delete ant.wanderAngle;
      }
    }

    return {
      x: ant.x,
      y: ant.y,
      angle: ant.angle + Math.PI/2
    };
  }

  // Tunnel movement
  if (!path.type) {
    if (typeof ant.pathProgress === 'undefined') {
      ant.pathProgress = 0.1;
    }
    
    const oldPos = getBezierPoint(
      ant.pathProgress,
      path.start,
      path.cp1,
      path.cp2,
      path.end
    );
    
    ant.pathProgress += ant.speed;

    // Handle tunnel transitions more smoothly
    if (ant.pathProgress > 1 || ant.pathProgress < 0) {
      const point = ant.pathProgress > 1 ? path.end : path.start;
      
      // Check if we're at a ground exit
      if (Math.abs(point.y - GROUND_LEVEL) < 10) {
        // Return to ground smoothly
        ant.pathIndex = 0;
        ant.x = point.x;
        ant.y = GROUND_LEVEL;
        ant.angle = Math.random() * Math.PI * 2;
        ant.wanderAngle = ant.angle;
        delete ant.pathProgress;
        return {
          x: ant.x,
          y: ant.y,
          angle: ant.angle + Math.PI/2
        };
      }
      
      // Find ALL possible connecting tunnels with increased detection range
      const possibleConnections = TUNNEL_PATHS.filter((p, idx) => {
        // Skip invalid paths, ground paths, and current path
        if (!p || idx === ant.pathIndex || p.type === 'ground') return false;
        
        // Skip if path endpoints aren't defined
        if (!p.start || !p.end || !p.start.x || !p.start.y || !p.end.x || !p.end.y) return false;
        
        // Increase detection range specifically near the 3rd chamber
        const detectionRange = (point.y > 350 && point.x > 600) ? 25 : 10;
        
        // Check both ends of the tunnel for connections
        const startMatch = Math.abs(p.start.x - point.x) < detectionRange && 
                          Math.abs(p.start.y - point.y) < detectionRange;
        const endMatch = Math.abs(p.end.x - point.x) < detectionRange && 
                        Math.abs(p.end.y - point.y) < detectionRange;
        
        // Add extra check for vertical movement options when stuck
        if ((startMatch || endMatch) && point.y > 350) {
          return p.start.y < point.y || p.end.y < point.y;  // Prefer upward paths
        }
        
        return startMatch || endMatch;
      });

      if (possibleConnections.length > 0) {
        // Choose a random connecting tunnel
        const nextTunnel = possibleConnections[Math.floor(Math.random() * possibleConnections.length)];
        ant.pathIndex = TUNNEL_PATHS.indexOf(nextTunnel);
        
        // Determine which end of the new tunnel to start from
        const startDist = Math.hypot(nextTunnel.start.x - point.x, nextTunnel.start.y - point.y);
        const endDist = Math.hypot(nextTunnel.end.x - point.x, nextTunnel.end.y - point.y);
        
        // Force upward movement when stuck low
        if (point.y > 350) {
          ant.pathProgress = nextTunnel.start.y < nextTunnel.end.y ? 0 : 1;
          ant.speed = Math.abs(ant.speed);
        } else {
          ant.pathProgress = startDist < endDist ? 0 : 1;
        }
      } else {
        // If no connection and stuck low, force upward movement
        if (point.y > 350) {
          ant.speed = -Math.abs(ant.speed);
        }
        ant.pathProgress = ant.pathProgress > 1 ? 1 : 0;
      }
    }

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

    return {
      x: pos.x,
      y: pos.y,
      angle: angle + (ant.speed < 0 ? Math.PI * 1.5 : Math.PI/2)
    };
  }

  // Chamber movement
  if (path.type === 'chamber') {
    // Random chance to exit chamber - increased to 10%
    if (Math.random() < 0.1) {  // 10% chance to leave chamber each frame
      console.log('Attempting to leave chamber at:', path.x, path.y); // Debug log
      
      // Find connecting tunnels
      const nearestTunnel = TUNNEL_PATHS.findIndex(p => 
        p && // Check if path exists
        !p.type && // Not a chamber or ground
        ((Math.abs(p.start.x - path.x) < 30 && Math.abs(p.start.y - path.y) < 30) ||
           (Math.abs(p.end.x - path.x) < 30 && Math.abs(p.end.y - path.y) < 30))
      );

      if (nearestTunnel !== -1) {
        console.log('Found exit tunnel:', TUNNEL_PATHS[nearestTunnel]); // Debug log
        ant.pathIndex = nearestTunnel;
        ant.pathProgress = 0;
        delete ant.chamberAngle;
        delete ant.x;
        delete ant.y;
        delete ant.angle;
        delete ant.wanderAngle;
        return updateAntPosition(ant, TUNNEL_PATHS[nearestTunnel]);
      } else {
        console.log('No valid exit found'); // Debug log
        // Force return to ground if no tunnel found
        ant.pathIndex = 0; // Set to ground path
        ant.x = path.x;
        ant.y = GROUND_LEVEL;
        ant.angle = Math.random() * Math.PI * 2;
        ant.wanderAngle = ant.angle;
        delete ant.chamberAngle;
        delete ant.pathProgress;
        return updateAntPosition(ant, TUNNEL_PATHS[0]);
      }
    }

    // Wander within chamber
    if (!ant.chamberAngle) {
      ant.chamberAngle = Math.random() * Math.PI * 2;
    }
    
    // Rotate faster
    ant.chamberAngle += (Math.random() - 0.5) * 0.3;

    // Calculate position within chamber with larger radius
    const radius = 25;
    return {
      x: path.x + Math.cos(ant.chamberAngle) * radius,
      y: path.y + Math.sin(ant.chamberAngle) * radius,
      angle: ant.chamberAngle + Math.PI/2
    };
  }
};

export const findNextTunnel = (currentPath, currentEnd, tunnelPaths) => {
  return tunnelPaths.findIndex((p, index) => {
    return index !== currentPath && 
           p.type !== 'ground' && 
           Math.abs(p.start.x - currentEnd.x) < 5 && 
           Math.abs(p.start.y - currentEnd.y) < 5;
  });
};

export const shouldReturnToGround = (position) => {
  return Math.abs(position.y - GROUND_LEVEL) < 5;
}; 