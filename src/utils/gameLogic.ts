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
    gameSpeed: 3, // Set back to 3 for proper speed
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

// Update game state for each frame - optimize performance
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
  
  // Update maze blocks - more efficiently
  let collision = false;
  const gameSpeed = state.gameSpeed;
  const newMaze = [];
  
  // Pre-calculate canvas height + buffer
  const maxY = canvasHeight + 100;
  
  // Process blocks more efficiently
  for (let i = 0; i < state.maze.length; i++) {
    const block = state.maze[i];
    // Move block down
    const newBlock = { 
      x: block.x, 
      y: block.y + gameSpeed,
      width: block.width, 
      height: block.height 
    };
    
    // Only keep blocks that are still on or near screen
    if (newBlock.y < maxY) {
      newMaze.push(newBlock);
      
      // Check collision (only if player is not invulnerable)
      if (!newPlayer.invulnerable && !collision && checkCollision(newPlayer, newBlock)) {
        collision = true;
      }
    }
  }
  
  // Update boosters more efficiently
  const newBoosters = [];
  let collectedSafetyKeys = state.collectedSafetyKeys;
  let collectedBackdoors = state.collectedBackdoors;
  let scoreBoost = 0;
  
  // Process boosters more efficiently
  for (let i = 0; i < state.boosters.length; i++) {
    const booster = state.boosters[i];
    // Only process active boosters
    if (booster.active) {
      // Move booster down
      const newBooster = { 
        x: booster.x, 
        y: booster.y + gameSpeed,
        size: booster.size,
        type: booster.type,
        active: true 
      };
      
      // Check if booster is still on screen
      if (newBooster.y < maxY) {
        // Check for booster collisions
        if (checkBoosterCollision(newPlayer.x, newPlayer.y, newPlayer.size, newBooster)) {
          // Handle booster collection
          if (newBooster.type === BoosterType.SAFETY_KEY) {
            newPlayer.invulnerable = true;
            newPlayer.invulnerableTimer = 1800; // 30 seconds at 60 FPS
            collectedSafetyKeys += 1;
          } else if (newBooster.type === BoosterType.BACKDOOR) {
            scoreBoost = 3000;
            collectedBackdoors += 1;
          }
        } else {
          // Only keep boosters that haven't been collected
          newBoosters.push(newBooster);
        }
      }
    }
  }
  
  // Generate new blocks and potentially boosters
  const { maze: updatedMaze, boosters: newGeneratedBoosters } = generateMaze(
    newMaze, 
    canvasWidth, 
    canvasHeight, 
    state.gameSpeed, 
    state.score
  );
  
  // Update score and check if player has won
  const newScore = state.score + 1 + scoreBoost;
  const gameWon = newScore >= 100000;
  
  // Create new state object efficiently
  const newState = {
    ...state,
    player: newPlayer,
    maze: updatedMaze,
    boosters: [...newBoosters, ...newGeneratedBoosters],
    score: newScore,
    colorPhase: Math.floor(newScore / 5000),
    gameSpeed: Math.min(5, 2 + Math.floor(newScore / 2000)),
    gameWon,
    collectedSafetyKeys,
    collectedBackdoors
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
