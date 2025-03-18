import { Player, MazeBlock, BossCoreLine, Booster } from './types';

// Check if player collides with a maze block
export const checkCollision = (player: Player, block: MazeBlock): boolean => {
  return (
    player.x + player.size > block.x &&
    player.x - player.size < block.x + block.width &&
    player.y + player.size > block.y &&
    player.y - player.size < block.y + block.height
  );
};

// Update boss core collision check to handle regular and vulnerable lines separately
export const checkBossLineCollision = (
  player: Player, 
  line: BossCoreLine
): { collision: boolean, isLethal: boolean } => {
  // Check collision with each segment of the line
  for (let i = 0; i < line.points.length - 1; i++) {
    const [x1, y1] = line.points[i];
    const [x2, y2] = line.points[i + 1];
    
    // Calculate distance from player to line segment
    const distance = pointLineDistance(
      player.x, player.y,
      x1, y1,
      x2, y2
    );
    
    // If distance is less than player size, there's a collision
    if (distance < player.size) {
      return {
        collision: true,
        isLethal: !line.isVulnerable // Collision is lethal if line is not vulnerable
      };
    }
  }
  
  return { collision: false, isLethal: false };
};

// Calculate distance from point to line segment
const pointLineDistance = (
  px: number, py: number,  // Point
  x1: number, y1: number,  // Line segment start
  x2: number, y2: number   // Line segment end
): number => {
  // Calculate squared length of line segment
  const lengthSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  
  // If line segment is a point, calculate distance to that point
  if (lengthSq === 0) {
    return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  }
  
  // Calculate projection of point onto line segment
  const t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lengthSq));
  
  // Calculate nearest point on line segment
  const nearestX = x1 + t * (x2 - x1);
  const nearestY = y1 + t * (y2 - y1);
  
  // Calculate distance from point to nearest point on line segment
  return Math.sqrt((px - nearestX) * (px - nearestX) + (py - nearestY) * (py - nearestY));
};

// Check if player collides with the memory card (final boss component)
export const checkMemoryCardCollision = (player: Player, memoryCard: Booster): boolean => {
  // Calculate distance between player center and memory card center
  const dx = player.x - memoryCard.x;
  const dy = player.y - memoryCard.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // If distance is less than sum of player radius and memory card radius, there's a collision
  return distance < (player.size + memoryCard.size / 2);
};
