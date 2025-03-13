
import { GameState, Player, MazeBlock } from './types';
import { updatePlayerMovement } from './playerUtils';
import { generateMaze, getBlockColor } from './mazeUtils';
import { checkCollision } from './collisionUtils';
import { saveScore, getScores } from './storageUtils';

// Initialize game state
export const initGameState = (canvasWidth: number, canvasHeight: number): GameState => {
  return {
    player: { 
      x: canvasWidth / 2, 
      y: canvasHeight - 100, 
      size: 10,
      speedX: 0,
      speedY: 0
    },
    maze: [],
    score: 0,
    gameSpeed: 2,
    attemptsLeft: 3,
    gameActive: false,
    colorPhase: 0,
    cursorControl: false
  };
};

// Update game state for each frame
export const updateGameState = (
  state: GameState, 
  canvasWidth: number, 
  canvasHeight: number,
  keys: { [key: string]: boolean },
  cursorPosition: { x: number | null, y: number | null }
): { newState: GameState; collision: boolean } => {
  if (!state.gameActive) {
    return { newState: state, collision: false };
  }
  
  // Update player position based on keyboard input and cursor position
  const newPlayer = updatePlayerMovement(
    state.player, 
    keys, 
    canvasWidth, 
    canvasHeight, 
    state.cursorControl,
    cursorPosition
  );
  
  // Update maze blocks
  let collision = false;
  const newMaze = state.maze
    .map(block => {
      // Move block down
      const newBlock = { ...block, y: block.y + state.gameSpeed };
      
      // Check collision
      if (checkCollision(newPlayer, newBlock)) {
        collision = true;
      }
      
      return newBlock;
    })
    .filter(block => block.y < canvasHeight + 100); // Keep blocks that are still on or near screen
  
  // Generate new blocks - now passing the score to adjust spawn rate
  const updatedMaze = generateMaze(newMaze, canvasWidth, canvasHeight, state.gameSpeed, state.score);
  
  // Update score and color phase
  const newScore = state.score + 1;
  // Update color phase every 5000 points instead of 1000
  const newColorPhase = Math.floor(newScore / 5000);
  
  return {
    newState: {
      ...state,
      player: newPlayer,
      maze: updatedMaze,
      score: newScore,
      colorPhase: newColorPhase,
      gameSpeed: Math.min(5, 2 + Math.floor(newScore / 2000)) // Gradually increase speed
    },
    collision
  };
};

// Toggle cursor control
export const toggleCursorControl = (state: GameState): GameState => {
  return {
    ...state,
    cursorControl: !state.cursorControl
  };
};

// Start a new game
export const startGame = (state: GameState): GameState => {
  console.log("Starting game with state:", state);
  return {
    ...state,
    gameActive: true,
    score: 0,
    maze: [],
    gameSpeed: 2
  };
};

// End game and save score
export const endGame = (state: GameState): GameState => {
  saveScore(state.score);
  
  return {
    ...state,
    gameActive: false
  };
};

// Add attempts
export const addAttempts = (state: GameState, amount: number): GameState => {
  return {
    ...state,
    attemptsLeft: state.attemptsLeft + amount
  };
};

// Set unlimited attempts
export const setUnlimitedAttempts = (state: GameState): GameState => {
  return {
    ...state,
    attemptsLeft: Infinity
  };
};

// Re-export everything from the separate modules for backward compatibility
export { updatePlayerMovement } from './playerUtils';
export { generateMaze, getBlockColor } from './mazeUtils';
export { checkCollision } from './collisionUtils';
export { saveScore, getScores } from './storageUtils';
