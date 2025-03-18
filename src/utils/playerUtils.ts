
import { Player } from './types';

// Update player movement based on keyboard input and swipe direction on mobile
export const updatePlayerMovement = (
  player: Player,
  keys: { [key: string]: boolean },
  canvasWidth: number,
  canvasHeight: number,
  cursorControl: boolean,
  cursorPosition: { x: number | null, y: number | null },
  isMobile: boolean = false,
  swipeDirection: { x: number, y: number } | null = null
): Player => {
  const newPlayer = { ...player };
  const moveSpeed = 6.67; // Reduced from 10 to 6.67 (1.5x slower)
  
  // На мобильных устройствах используем свайп-направление
  if (isMobile) {
    if (swipeDirection) {
      // Если есть активное свайп-направление, двигаемся в этом направлении
      newPlayer.speedX = swipeDirection.x * moveSpeed;
      newPlayer.speedY = swipeDirection.y * moveSpeed;
    } else {
      // Если свайп-направления нет (палец не движется или отпущен), останавливаемся
      newPlayer.speedX = 0;
      newPlayer.speedY = 0;
    }
  }
  // Desktop cursor control
  else if (cursorControl && !isMobile && cursorPosition.x !== null && cursorPosition.y !== null) {
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
    } else {
      // If cursor is very close, stop movement
      newPlayer.speedX = 0;
      newPlayer.speedY = 0;
    }
  } else {
    // Keyboard controls (when cursor control is disabled and not on mobile)
    // Update speeds based on key presses
    if (keys.ArrowLeft || keys.a) {
      newPlayer.speedX = -moveSpeed;
    } else if (keys.ArrowRight || keys.d) {
      newPlayer.speedX = moveSpeed;
    } else {
      // Decelerate X movement when no keys pressed
      newPlayer.speedX = 0;
    }
    
    if (keys.ArrowUp || keys.w) {
      newPlayer.speedY = -moveSpeed;
    } else if (keys.ArrowDown || keys.s) {
      newPlayer.speedY = moveSpeed;
    } else {
      // Decelerate Y movement when no keys pressed
      newPlayer.speedY = 0;
    }
  }
  
  // Update position
  newPlayer.x += newPlayer.speedX;
  newPlayer.y += newPlayer.speedY;
  
  // Keep player inside canvas bounds
  newPlayer.x = Math.max(newPlayer.size, Math.min(canvasWidth - newPlayer.size, newPlayer.x));
  newPlayer.y = Math.max(newPlayer.size, Math.min(canvasHeight - newPlayer.size, newPlayer.y));
  
  return newPlayer;
};
