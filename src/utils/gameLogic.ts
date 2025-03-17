
import { GameState, Player, MazeBlock, Booster, BoosterType, PlayerSkin } from './types';
import { updatePlayerMovement } from './playerUtils';
import { generateMaze, getBlockColor, checkBoosterCollision } from './mazeUtils';
import { checkCollision } from './collisionUtils';
import { saveScore, getScores } from './storageUtils';
import { updateAchievements } from './achievementsUtils';
import { getSelectedSkin } from './skinsUtils';

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
    gameSpeed: 4, // Doubled from 2 to 4
    attemptsLeft: 3,
    gameActive: false,
    colorPhase: 0,
    cursorControl: false,
    gameWon: false,
    collectedSafetyKeys: 0,
    collectedBackdoors: 0,
    selectedSkin: getSelectedSkin() // Get selected skin from localStorage
  };
};

// Update game state for each frame
export const updateGameState = (
  state: GameState, 
  canvasWidth: number, 
  canvasHeight: number,
  keys: { [key: string]: boolean },
  cursorPosition: { x: number | null, y: number | null },
  deltaTime: number = 1 // Default to 1 for backward compatibility
): { newState: GameState; collision: boolean; gameWon: boolean } => {
  if (!state.gameActive) {
    return { newState: state, collision: false, gameWon: false };
  }
  
  // Apply deltaTime normalization to make game speed consistent
  const timeScale = Math.min(deltaTime, 2); // Cap at 2 to prevent huge jumps
  
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
    newPlayer.invulnerableTimer -= 1 * timeScale;
    if (newPlayer.invulnerableTimer <= 0) {
      newPlayer.invulnerable = false;
    }
  }
  
  // Update maze blocks
  let collision = false;
  const newMaze = state.maze
    .map(block => {
      // Move block down with time scaling
      const newBlock = { ...block, y: block.y + state.gameSpeed * timeScale };
      
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
      // Move booster down with time scaling
      const newBooster = { ...booster, y: booster.y + state.gameSpeed * timeScale };
      return newBooster;
    })
    .filter(booster => booster.y < canvasHeight + 100 && booster.active); // Keep active boosters on screen
    
  // Check for booster collisions
  let collectedBooster = false;
  let newCollectedSafetyKeys = state.collectedSafetyKeys;
  let newCollectedBackdoors = state.collectedBackdoors;
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
        newCollectedBackdoors += 1; // Increment collected backdoors count
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
  const newScore = state.score + (2 * timeScale) + scoreBoost; // Score increment with time scaling
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
    gameSpeed: Math.min(10, 4 + Math.floor(newScore / 2000)), // Doubled base speed (2->4) and max speed (5->10)
    gameWon,
    collectedSafetyKeys: newCollectedSafetyKeys,
    collectedBackdoors: newCollectedBackdoors
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
  // Track daily game plays
  updateDailyGameStats();
  
  return {
    ...state,
    gameActive: true,
    score: 0,
    maze: [],
    boosters: [],
    gameSpeed: 2,
    gameWon: false,
    collectedSafetyKeys: 0,
    collectedBackdoors: 0,
    player: {
      ...state.player,
      invulnerable: false,
      invulnerableTimer: 0
    },
    selectedSkin: state.selectedSkin // Preserve selected skin
  };
};

// Track daily game plays
export const updateDailyGameStats = (): void => {
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const DAILY_STATS_KEY = 'netrunner_daily_stats';
  
  // Get existing stats
  const statsJson = localStorage.getItem(DAILY_STATS_KEY);
  let stats = statsJson ? JSON.parse(statsJson) : { date: today, gamesPlayed: 0 };
  
  // If it's a new day, reset counter
  if (stats.date !== today) {
    stats = { date: today, gamesPlayed: 0 };
  }
  
  // Increment games played today
  stats.gamesPlayed += 1;
  
  // Save back to storage
  localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats));
};

// Function to get daily game stats
export const getDailyGameStats = (): { date: string, gamesPlayed: number } => {
  const DAILY_STATS_KEY = 'netrunner_daily_stats';
  const statsJson = localStorage.getItem(DAILY_STATS_KEY);
  
  if (statsJson) {
    return JSON.parse(statsJson);
  }
  
  // Default if no stats exist
  return { 
    date: new Date().toISOString().split('T')[0], 
    gamesPlayed: 0 
  };
};

// End game and save score
export const endGame = (state: GameState): GameState => {
  // Save the score to local storage
  console.log("Ending game, saving score:", state.score);
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
export { generateMaze, getBlockColor, checkBoosterCollision } from './mazeUtils';
export { checkCollision } from './collisionUtils';
export { saveScore, getScores } from './storageUtils';
