import { Player } from './types';

// Update player movement based on keyboard input and cursor position if enabled
export const updatePlayerMovement = (
  player: Player,
  keys: { [key: string]: boolean },
  canvasWidth: number,
  canvasHeight: number,
  cursorControl: boolean,
  cursorPosition: { x: number | null, y: number | null }
): Player => {
  const moveSpeed = 5;
  
  // Create new player object with initial values from current player
  const newPlayer = { 
    x: player.x,
    y: player.y,
    size: player.size,
    speedX: 0,
    speedY: 0,
    invulnerable: player.invulnerable,
    invulnerableTimer: player.invulnerableTimer
  };
  
  if (cursorControl && cursorPosition.x !== null && cursorPosition.y !== null) {
    // Calculate direction vector towards cursor
    const dx = cursorPosition.x - player.x;
    const dy = cursorPosition.y - player.y;
    
    // Calculate distance to cursor
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {  // Only move if cursor is not too close
      // Normalize direction vector and multiply by move speed
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      newPlayer.speedX = normalizedDx * moveSpeed;
      newPlayer.speedY = normalizedDy * moveSpeed;
    }
  } else {
    // Keyboard controls (when cursor control is disabled)
    // Only set speed in one direction if keys are pressed
    if (keys.ArrowLeft || keys.a) {
      newPlayer.speedX = -moveSpeed;
    } else if (keys.ArrowRight || keys.d) {
      newPlayer.speedX = moveSpeed;
    }
    
    if (keys.ArrowUp || keys.w) {
      newPlayer.speedY = -moveSpeed;
    } else if (keys.ArrowDown || keys.s) {
      newPlayer.speedY = moveSpeed;
    }
  }
  
  // Update position
  newPlayer.x += newPlayer.speedX;
  newPlayer.y += newPlayer.speedY;
  
  // Keep player inside canvas bounds - use Math.min/max more efficiently
  newPlayer.x = Math.max(newPlayer.size, Math.min(canvasWidth - newPlayer.size, newPlayer.x));
  newPlayer.y = Math.max(newPlayer.size, Math.min(canvasHeight - newPlayer.size, newPlayer.y));
  
  return newPlayer;
};
