import { Player, GameState } from './types';

// Update player movement based on keyboard input and swipe direction on mobile
export const updatePlayerMovement = (
  gameState: GameState,
  keys: { [key: string]: boolean },
  cursorPosition: { x: number | null, y: number | null },
  isMobile: boolean = false,
  swipeDirection: { x: number, y: number } | null = null,
  canvasWidth: number,
  canvasHeight: number
): GameState => {
  const newGameState = { ...gameState };
  const player = { ...gameState.player };
  const moveSpeed = 6.67; // Reduced from 10 to 6.67 (1.5x slower)
  
  // На мобильных устройствах используем свайп-направление
  if (isMobile) {
    if (swipeDirection) {
      // Если есть активное свайп-направление, двигаемся в этом направлении
      player.speedX = swipeDirection.x * moveSpeed;
      player.speedY = swipeDirection.y * moveSpeed;
    } else {
      // Если свайп-направления нет (палец не движется или отпущен), останавливаемся
      player.speedX = 0;
      player.speedY = 0;
    }
  }
  // Desktop cursor control
  else if (newGameState.cursorControl && !isMobile && cursorPosition.x !== null && cursorPosition.y !== null) {
    // Calculate direction vector towards cursor
    const dx = cursorPosition.x - player.x;
    const dy = cursorPosition.y - player.y;
    
    // Calculate distance to cursor
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {  // Only move if cursor is not too close
      // Normalize direction vector and multiply by move speed
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;
      
      player.speedX = normalizedDx * moveSpeed;
      player.speedY = normalizedDy * moveSpeed;
    } else {
      // If cursor is very close, stop movement
      player.speedX = 0;
      player.speedY = 0;
    }
  } else {
    // Keyboard controls (when cursor control is disabled and not on mobile)
    // Update speeds based on key presses
    if (keys.ArrowLeft || keys.a) {
      player.speedX = -moveSpeed;
    } else if (keys.ArrowRight || keys.d) {
      player.speedX = moveSpeed;
    } else {
      // Decelerate X movement when no keys pressed
      player.speedX = 0;
    }
    
    if (keys.ArrowUp || keys.w) {
      player.speedY = -moveSpeed;
    } else if (keys.ArrowDown || keys.s) {
      player.speedY = moveSpeed;
    } else {
      // Decelerate Y movement when no keys pressed
      player.speedY = 0;
    }
  }
  
  // Update position
  player.x += player.speedX;
  player.y += player.speedY;
  
  // Keep player inside canvas bounds
  player.x = Math.max(player.size, Math.min(canvasWidth - player.size, player.x));
  player.y = Math.max(player.size, Math.min(canvasHeight - player.size, player.y));
  
  // Update player in gameState
  newGameState.player = player;
  
  return newGameState;
};
