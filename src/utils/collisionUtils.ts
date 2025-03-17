
import { Player, MazeBlock } from './types';

// Check if player collides with a maze block
export const checkCollision = (player: Player, block: MazeBlock): boolean => {
  // Use an even more forgiving collision box for better gameplay
  const collisionBuffer = 6; // Increased buffer for more forgiving collisions (up from 4)
  
  return (
    player.x + player.size - collisionBuffer > block.x &&
    player.x - player.size + collisionBuffer < block.x + block.width &&
    player.y + player.size - collisionBuffer > block.y &&
    player.y - player.size + collisionBuffer < block.y + block.height
  );
};
