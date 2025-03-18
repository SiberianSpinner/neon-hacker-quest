import { GameState, Player, MazeBlock, Booster, BoosterType, PlayerSkin, BossCore, BossCoreLine } from './types';
import { updatePlayerMovement } from './playerUtils';
import { generateMaze, getBlockColor, checkBoosterCollision } from './mazeUtils';
import { checkCollision, checkBossLineCollision, checkMemoryCardCollision } from './collisionUtils';
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
    gameSpeed: 2.67, // Reduced from 4 to 2.67 (1.5x slower)
    attemptsLeft: 3,
    gameActive: false,
    colorPhase: 0,
    cursorControl: false,
    gameWon: false,
    collectedSafetyKeys: 0,
    collectedBackdoors: 0,
    selectedSkin: getSelectedSkin(), // Get selected skin from localStorage
    bossCore: null
  };
};

// Check if it's time to spawn a boss based on score
const shouldSpawnBoss = (score: number, currentBoss: BossCore | null): boolean => {
  // Boss score thresholds
  const bossThresholds = [3000, 33000, 66000, 99000]; // Added 3000 points boss
  
  // Check if score has just crossed a threshold and there's no active boss
  for (const threshold of bossThresholds) {
    // Use a range check to avoid missing the exact threshold due to score increments
    const previousScore = score - 1.33;
    if (previousScore < threshold && score >= threshold && (!currentBoss || !currentBoss.active)) {
      return true;
    }
  }
  
  return false;
};

// Initialize boss core based on score
export const initBossCore = (score: number, canvasWidth: number, canvasHeight: number): BossCore => {
  // Determine boss level based on score
  let level: 1 | 2 | 3;
  if (score >= 99000) level = 3;
  else if (score >= 66000) level = 2;
  else level = 1;
  
  // Calculate boss position (center of the screen in upper third)
  const x = canvasWidth / 2;
  const y = canvasHeight / 3;
  
  // Calculate rotation speed based on level
  const rotationSpeed = level === 1 ? 24 : level === 2 ? 30 : 36; // Degrees per second
  
  // Calculate square sizes (making sure it fits on mobile screens)
  const maxSize = Math.min(canvasWidth, canvasHeight) * 0.4;
  const outerSquareSize = maxSize;
  const innerSquareSize = maxSize * 0.5;
  
  // Create outer square lines
  const outerLines: BossCoreLine[] = [];
  
  // Each side of the outer square
  // Top, right, bottom, left sides
  [
    [[x - outerSquareSize/2, y - outerSquareSize/2], [x + outerSquareSize/2, y - outerSquareSize/2]], // Top
    [[x + outerSquareSize/2, y - outerSquareSize/2], [x + outerSquareSize/2, y + outerSquareSize/2]], // Right
    [[x + outerSquareSize/2, y + outerSquareSize/2], [x - outerSquareSize/2, y + outerSquareSize/2]], // Bottom
    [[x - outerSquareSize/2, y + outerSquareSize/2], [x - outerSquareSize/2, y - outerSquareSize/2]]  // Left
  ].forEach((points, idx) => {
    // Split each side into 2 lines
    const midPoint = [
      (points[0][0] + points[1][0]) / 2,
      (points[0][1] + points[1][1]) / 2
    ];
    
    // First half
    outerLines.push({
      id: `outer-${idx}-1`,
      points: [points[0], midPoint] as [number, number][],
      isVulnerable: false,
      destroyed: false
    });
    
    // Second half
    outerLines.push({
      id: `outer-${idx}-2`,
      points: [midPoint, points[1]] as [number, number][],
      isVulnerable: false,
      destroyed: false
    });
  });
  
  // Create inner square lines
  const innerLines: BossCoreLine[] = [];
  
  // Each side of the inner square
  [
    [[x - innerSquareSize/2, y - innerSquareSize/2], [x + innerSquareSize/2, y - innerSquareSize/2]], // Top
    [[x + innerSquareSize/2, y - innerSquareSize/2], [x + innerSquareSize/2, y + innerSquareSize/2]], // Right
    [[x + innerSquareSize/2, y + innerSquareSize/2], [x - innerSquareSize/2, y + innerSquareSize/2]], // Bottom
    [[x - innerSquareSize/2, y + innerSquareSize/2], [x - innerSquareSize/2, y - innerSquareSize/2]]  // Left
  ].forEach((points, idx) => {
    innerLines.push({
      id: `inner-${idx}`,
      points: points as [number, number][],
      isVulnerable: false,
      destroyed: false
    });
  });
  
  // Create memory card at center
  const memoryCard: Booster = {
    x: x - 15, // Center position (adjusted for size)
    y: y - 15, // Center position (adjusted for size)
    size: 30,
    type: BoosterType.MEMORY_CARD,
    active: true
  };
  
  return {
    active: true,
    x,
    y,
    level,
    outerSquareSize,
    innerSquareSize,
    outerRotationAngle: 0,
    innerRotationAngle: 0,
    outerLines,
    innerLines,
    memoryCard,
    vulnerableLinesTimer: 0, // Will be set in update
    cooldownTimer: 0,
  };
};

// Update boss core state
export const updateBossCore = (
  bossCore: BossCore, 
  deltaTime: number, 
  player: Player
): { updatedBoss: BossCore, bossDefeated: boolean } => {
  const updatedBoss = { ...bossCore };
  let bossDefeated = false;
  
  // Update rotation angles
  // Base rotation speeds: L1 = 15 seconds, L2 = 12 seconds, L3 = 10 seconds
  // Convert to degrees per frame (60fps assumed)
  const outerRotationSpeed = (360 / (bossCore.level === 1 ? 15 : bossCore.level === 2 ? 12 : bossCore.level === 3 ? 10 : 15)) / 60;
  const innerRotationSpeed = -1.5 * outerRotationSpeed; // Inner rotates in opposite direction, faster
  
  updatedBoss.outerRotationAngle += outerRotationSpeed * deltaTime;
  updatedBoss.innerRotationAngle += innerRotationSpeed * deltaTime;
  
  // Keep angles within 0-360
  updatedBoss.outerRotationAngle %= 360;
  updatedBoss.innerRotationAngle %= 360;
  
  // Update vulnerable lines timer
  updatedBoss.vulnerableLinesTimer -= deltaTime;
  if (updatedBoss.vulnerableLinesTimer <= 0) {
    // Time to refresh vulnerable lines
    updatedBoss.vulnerableLinesTimer = 300; // 5 seconds (at 60fps)
    
    // Reset vulnerability status for all lines
    [...updatedBoss.outerLines, ...updatedBoss.innerLines].forEach(line => {
      line.isVulnerable = false;
    });
    
    // Select random lines to make vulnerable
    const allLines = [
      ...updatedBoss.outerLines.filter(line => !line.destroyed),
      ...updatedBoss.innerLines.filter(line => !line.destroyed)
    ];
    
    // Make 4 random lines vulnerable (or fewer if not enough lines left)
    const linesToMakeVulnerable = Math.min(4, allLines.length);
    const shuffledLines = [...allLines].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < linesToMakeVulnerable; i++) {
      const lineIndex = shuffledLines[i].id;
      // Find and update the actual line in our boss object
      const outerLineIndex = updatedBoss.outerLines.findIndex(l => l.id === lineIndex);
      if (outerLineIndex >= 0) {
        updatedBoss.outerLines[outerLineIndex].isVulnerable = true;
      } else {
        const innerLineIndex = updatedBoss.innerLines.findIndex(l => l.id === lineIndex);
        if (innerLineIndex >= 0) {
          updatedBoss.innerLines[innerLineIndex].isVulnerable = true;
        }
      }
    }
  }
  
  // Check player collision with vulnerable lines
  // For outer lines
  updatedBoss.outerLines.forEach((line, index) => {
    if (!line.destroyed && line.isVulnerable) {
      // Transform the line points based on the rotation
      const transformedPoints = line.points.map(point => {
        const [px, py] = point;
        const dx = px - updatedBoss.x;
        const dy = py - updatedBoss.y;
        const angle = updatedBoss.outerRotationAngle * (Math.PI / 180);
        const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
        const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);
        return [rotatedX + updatedBoss.x, rotatedY + updatedBoss.y] as [number, number];
      });
      
      // Create a temporary line object with transformed points for collision check
      const tempLine: BossCoreLine = {
        ...line,
        points: transformedPoints
      };
      
      if (checkBossLineCollision(player, tempLine)) {
        updatedBoss.outerLines[index].destroyed = true;
      }
    }
  });
  
  // Can only destroy inner lines if all outer lines are destroyed
  const allOuterLinesDestroyed = updatedBoss.outerLines.every(line => line.destroyed);
  if (allOuterLinesDestroyed) {
    // For inner lines
    updatedBoss.innerLines.forEach((line, index) => {
      if (!line.destroyed && line.isVulnerable) {
        // Transform the line points based on the rotation
        const transformedPoints = line.points.map(point => {
          const [px, py] = point;
          const dx = px - updatedBoss.x;
          const dy = py - updatedBoss.y;
          const angle = updatedBoss.innerRotationAngle * (Math.PI / 180);
          const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
          const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);
          return [rotatedX + updatedBoss.x, rotatedY + updatedBoss.y] as [number, number];
        });
        
        // Create a temporary line object with transformed points for collision check
        const tempLine: BossCoreLine = {
          ...line,
          points: transformedPoints
        };
        
        if (checkBossLineCollision(player, tempLine)) {
          updatedBoss.innerLines[index].destroyed = true;
        }
      }
    });
    
    // Check if all inner lines are destroyed to enable memory card collection
    const allInnerLinesDestroyed = updatedBoss.innerLines.every(line => line.destroyed);
    if (allInnerLinesDestroyed && updatedBoss.memoryCard.active) {
      // Check if player collides with memory card
      if (checkMemoryCardCollision(player, updatedBoss.memoryCard)) {
        // Memory card collected, boss defeated!
        updatedBoss.memoryCard.active = false;
        updatedBoss.active = false;
        updatedBoss.cooldownTimer = 180; // 3 seconds cooldown at 60fps
        bossDefeated = true;
      }
    }
  }
  
  // If boss is inactive but in cooldown, update timer
  if (!updatedBoss.active && updatedBoss.cooldownTimer > 0) {
    updatedBoss.cooldownTimer -= deltaTime;
  }
  
  return { updatedBoss, bossDefeated };
};

// Update game state for each frame
export const updateGameState = (
  state: GameState, 
  canvasWidth: number, 
  canvasHeight: number,
  keys: { [key: string]: boolean },
  cursorPosition: { x: number | null, y: number | null },
  deltaTime: number = 1, // Default to 1 for backward compatibility
  isMobile: boolean = false,
  swipeDirection: { x: number, y: number } | null = null
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
    cursorPosition,
    isMobile,
    swipeDirection
  );
  
  // Decrease invulnerable timer if active
  if (newPlayer.invulnerable) {
    newPlayer.invulnerableTimer -= 1 * timeScale;
    if (newPlayer.invulnerableTimer <= 0) {
      newPlayer.invulnerable = false;
    }
  }
  
  // Check if we should spawn a boss
  let bossCore = state.bossCore;
  let shouldGenerateNewBlocks = true;
  
  if (shouldSpawnBoss(state.score, bossCore)) {
    console.log(`Spawning boss at score ${state.score}`);
    bossCore = initBossCore(state.score, canvasWidth, canvasHeight);
  }
  
  // Handle boss interaction if active
  let bossDefeated = false;
  if (bossCore && bossCore.active) {
    const { updatedBoss, bossDefeated: defeated } = updateBossCore(bossCore, timeScale, newPlayer);
    bossCore = updatedBoss;
    bossDefeated = defeated;
    
    // Don't generate new blocks while boss is active
    shouldGenerateNewBlocks = false;
  } else if (bossCore && !bossCore.active && bossCore.cooldownTimer > 0) {
    // Boss defeated but still in cooldown
    const { updatedBoss } = updateBossCore(bossCore, timeScale, newPlayer);
    bossCore = updatedBoss;
    
    // Don't generate new blocks during cooldown
    shouldGenerateNewBlocks = false;
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
  
  // Generate new blocks and potentially boosters, but only if no boss is active
  let updatedMaze = newMaze;
  let newGeneratedBoosters: Booster[] = [];
  
  if (shouldGenerateNewBlocks) {
    const { maze: generatedMaze, boosters: generatedBoosters } = generateMaze(
      newMaze, 
      canvasWidth, 
      canvasHeight, 
      state.gameSpeed, 
      state.score
    );
    updatedMaze = generatedMaze;
    newGeneratedBoosters = generatedBoosters;
  }
  
  // Update score and color phase (add score boost from backdoor if collected)
  // Also add bonus points if boss defeated
  const bonusPoints = bossDefeated ? 5000 * (bossCore?.level || 1) : 0;
  const newScore = state.score + (1.33 * timeScale) + scoreBoost + bonusPoints;
  
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
    gameSpeed: Math.min(10, 2.67 + Math.floor(newScore / 2000)), // Reduced base speed from 4 to 2.67 (1.5x slower)
    gameWon,
    collectedSafetyKeys: newCollectedSafetyKeys,
    collectedBackdoors: newCollectedBackdoors,
    bossCore
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
    selectedSkin: state.selectedSkin, // Preserve selected skin
    bossCore: null // Reset boss core
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
  
  console.log(`Daily game stats updated: ${stats.gamesPlayed} games played today`);
  
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
  
  // Update achievements with final game state
  console.log("Game over, updating achievements");
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
