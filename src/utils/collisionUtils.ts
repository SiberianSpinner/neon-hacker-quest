
import { Player, MazeBlock } from './types';

// Check if player collides with a maze block
export const checkCollision = (player: Player, block: MazeBlock): boolean => {
  // Use a tighter collision box for single matrix symbol blocks
  // Reduce collision size slightly to make gameplay more forgiving
  const collisionBuffer = 2; // 2 pixel buffer for more forgiving collisions
  
  return (
    player.x + player.size - collisionBuffer > block.x &&
    player.x - player.size + collisionBuffer < block.x + block.width &&
    player.y + player.size - collisionBuffer > block.y &&
    player.y - player.size + collisionBuffer < block.y + block.height
  );
};
