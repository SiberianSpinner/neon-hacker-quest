
import { Player, MazeBlock, SideBarrier } from './types';

// Check if player collides with a maze block
export const checkCollision = (player: Player, block: MazeBlock): boolean => {
  return (
    player.x + player.size > block.x &&
    player.x - player.size < block.x + block.width &&
    player.y + player.size > block.y &&
    player.y - player.size < block.y + block.height
  );
};

// Check if player collides with side barrier
export const checkSideBarrierCollision = (player: Player, barrier: SideBarrier): boolean => {
  if (barrier.side === 'left') {
    return player.x - player.size <= barrier.width;
  } else {
    return player.x + player.size >= barrier.x;
  }
};

