
import { Player, MazeBlock } from './types';

// Check if player collides with a maze block
export const checkCollision = (player: Player, block: MazeBlock): boolean => {
  return (
    player.x + player.size > block.x &&
    player.x - player.size < block.x + block.width &&
    player.y + player.size > block.y &&
    player.y - player.size < block.y + block.height
  );
};
