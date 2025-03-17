
import { Player, MazeBlock } from './types';

// Check if player collides with a maze block
export const checkCollision = (player: Player, block: MazeBlock): boolean => {
  // Using a collision buffer to make collision detection more forgiving
  const collisionBuffer = 5; // Reduced buffer size for more accurate collisions
  
  return (
    player.x + player.size - collisionBuffer > block.x &&
    player.x - player.size + collisionBuffer < block.x + block.width &&
    player.y + player.size - collisionBuffer > block.y &&
    player.y - player.size + collisionBuffer < block.y + block.height
  );
};
