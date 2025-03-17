
import { GameState, Player, MazeBlock, Booster, BoosterType } from './types';
import { updatePlayerMovement } from './playerUtils';
import { generateMaze, getBlockColor, checkBoosterCollision } from './mazeUtils';
import { checkCollision } from './collisionUtils';
import { saveScore, getScores } from './storageUtils';
import { updateAchievements } from './achievementsUtils';

// Initialize game state
export const initGameState = (canvasWidth: number, canvasHeight: number): GameState => {
  return {
    player: { 
      x: canvasWidth / 2, 
      y: canvasHeight - 100, 
      size: 10,
      speedX: 0,
      speedY: 0,
      invulnerable: false,
      invulnerableTimer: 0
    },
    maze: [],
    boosters: [],
    score: 0,
    gameSpeed: 2,
    attemptsLeft: 3,
    gameActive: false,
    colorPhase: 0,
    cursorControl: false,
    gameWon: false,
    collectedSafetyKeys: 0
  };
};

// Update game state for each frame
export const updateGameState = (
  state: GameState, 
  canvasWidth: number, 
  canvasHeight: number,
  keys: { [key: string]: boolean },
  cursorPosition: { x: number | null, y: number | null }
): { newState: GameState; collision: boolean; gameWon: boolean } => {
  if (!state.gameActive) {
    return { newState: state, collision: false, gameWon: false };
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
  
  // Decrease invulnerable timer if active
  if (newPlayer.invulnerable) {
    newPlayer.invulnerableTimer -= 1;
    if (newPlayer.invulnerableTimer <= 0) {
      newPlayer.invulnerable = false;
    }
  }
  
  // Update maze blocks
  let collision = false;
  const newMaze = state.maze
    .map(block => {
      // Move block down
      const newBlock = { ...block, y: block.y + state.gameSpeed };
      
      // Check collision (only if player is not invulnerable)
      if (!newPlayer.invulnerable && checkCollision(newPlayer, newBlock)) {
        collision = true;
      }
      
      return newBlock;
    })
    .filter(block => block.y < canvasHeight + 100); // Keep blocks that are still on or near screen
  
  // Update boosters
  const newBoosters = state.boosters
    .map(booster => {
      // Move booster down
      const newBooster = { ...booster, y: booster.y + state.gameSpeed };
      return newBooster;
    })
    .filter(booster => booster.y < canvasHeight + 100 && booster.active); // Keep active boosters on screen
    
  // Check for booster collisions
  let collectedBooster = false;
  let newCollectedSafetyKeys = state.collectedSafetyKeys;
  let scoreBoost = 0;
  
  newBoosters.forEach(booster => {
    if (booster.active && checkBoosterCollision(newPlayer.x, newPlayer.y, newPlayer.size, booster)) {
      booster.active = false; // Deactivate collected booster
      collectedBooster = true;
      
      if (booster.type === BoosterType.SAFETY_KEY) {
        newPlayer.invulnerable = true;
        newPlayer.invulnerableTimer = 1800; // 30 seconds at 60 FPS (60 * 30 = 1800)
        newCollectedSafetyKeys += 1; // Increment collected safety keys count
      } else if (booster.type === BoosterType.BACKDOOR) {
        // Add 3000 points when collecting a Backdoor
        scoreBoost = 3000;
      }
    }
  });
  
  // Generate new blocks and potentially boosters
  const { maze: updatedMaze, boosters: newGeneratedBoosters } = generateMaze(
    newMaze, 
    canvasWidth, 
    canvasHeight, 
    state.gameSpeed, 
    state.score
  );
  
  // Update score and color phase (add score boost from backdoor if collected)
  const newScore = state.score + 1 + scoreBoost;
  // Update color phase every 5000 points
  const newColorPhase = Math.floor(newScore / 5000);
  
  // Check if player has won (reached 100,000 points - 100% hack completion)
  const gameWon = newScore >= 100000;
  
  const newState = {
    ...state,
    player: newPlayer,
    maze: updatedMaze,
    boosters: [...newBoosters.filter(b => b.active), ...newGeneratedBoosters],
    score: newScore,
    colorPhase: newColorPhase,
    gameSpeed: Math.min(5, 2 + Math.floor(newScore / 2000)), // Gradually increase speed
    gameWon,
    collectedSafetyKeys: newCollectedSafetyKeys
  };
  
  return {
    newState,
    collision,
    gameWon
  };
};

// Format score as hack percentage
export const formatScoreAsPercentage = (score: number): string => {
  // 1000 points = 1% hack completion
  const percentage = score / 1000;
  
  // Format with 3 decimal places
  return percentage.toFixed(3) + '%';
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
    boosters: [],
    gameSpeed: 2,
    gameWon: false,
    collectedSafetyKeys: 0,
    player: {
      ...state.player,
      invulnerable: false,
      invulnerableTimer: 0
    }
  };
};

// End game and save score
export const endGame = (state: GameState): GameState => {
  saveScore(state.score);
  
  // Update achievements
  updateAchievements(state);
  
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
