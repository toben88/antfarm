import { SPRITE_CONFIG } from '../config/sprite';

export const drawAnt = (ctx, ant, position, frameIndex) => {
  ctx.save();
  
  // Draw the address above the ant
  ctx.fillStyle = '#000000';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(ant.address, position.x, position.y - 15);
  
  // Draw the ant
  ctx.translate(position.x, position.y);
  ctx.rotate(position.angle);
  
  ctx.drawImage(
    ant.image,
    (frameIndex % SPRITE_CONFIG.columns) * SPRITE_CONFIG.width,
    Math.floor(frameIndex / SPRITE_CONFIG.columns) * SPRITE_CONFIG.height,
    SPRITE_CONFIG.width,
    SPRITE_CONFIG.height,
    -SPRITE_CONFIG.width/12,
    -SPRITE_CONFIG.height/12,
    SPRITE_CONFIG.width/6,
    SPRITE_CONFIG.height/6
  );
  
  ctx.restore();
}; 