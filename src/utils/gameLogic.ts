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
  const bossThresholds = [33000, 66000, 99000];
  
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
  
  // Calculate square sizes (making sure it fits on mobile screens)
  const maxSize = Math.min(canvasWidth, canvasHeight) * 0.4;
  const outerSquareSize = maxSize;
  const innerSquareSize = maxSize * 0.5;
  
  // Create lines for two outer squares
  const outerLines: BossCoreLine[] = [];
  
  // Function to create square lines
  const createSquareLines = (size: number, baseId: string): BossCoreLine[] => {
    const lines: BossCoreLine[] = [];
    const halfSize = size / 2;
    
    // Each side of the square
    [
      [[x - halfSize, y - halfSize], [x + halfSize, y - halfSize]], // Top
      [[x + halfSize, y - halfSize], [x + halfSize, y + halfSize]], // Right
      [[x + halfSize, y + halfSize], [x - halfSize, y + halfSize]], // Bottom
      [[x - halfSize, y + halfSize], [x - halfSize, y - halfSize]]  // Left
    ].forEach((points, idx) => {
      // Split each side into 2 lines
      const midPoint = [
        (points[0][0] + points[1][0]) / 2,
        (points[0][1] + points[1][1]) / 2
      ];
      
      // First half
      lines.push({
        id: `${baseId}-${idx}-1`,
        points: [points[0], midPoint] as [number, number][],
        isVulnerable: false,
        destroyed: false
      });
      
      // Second half
      lines.push({
        id: `${baseId}-${idx}-2`,
        points: [midPoint, points[1]] as [number, number][],
        isVulnerable: false,
        destroyed: false
      });
    });
    
    return lines;
  };
  
  // Create two outer squares (16 lines total)
  const outerSquare1 = createSquareLines(outerSquareSize, 'outer1');
  const outerSquare2 = createSquareLines(outerSquareSize, 'outer2');
  const outerLines = [...outerSquare1, ...outerSquare2];
  
  // Create two inner squares (8 lines total)
  const innerSquare1 = createSquareLines(innerSquareSize, 'inner1');
  const innerSquare2 = createSquareLines(innerSquareSize, 'inner2');
  const innerLines = [...innerSquare1, ...innerSquare2];
  
  // Create memory card at center
  const memoryCard = {
    x,
    y,
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
    vulnerableLinesTimer: 0,
    cooldownTimer: 0,
  };
};

// Update boss core state
export const updateBossCore = (
  bossCore: BossCore, 
  deltaTime: number, 
  player: Player
): { updatedBoss: BossCore, bossDefeated: boolean, collision: boolean } => {
  const updatedBoss = { ...bossCore };
  let bossDefeated = false;
  let collision = false;
  
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
  // Helper function to check collision with lines
  const checkLineCollisions = (lines: BossCoreLine[], rotationAngle: number) => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.destroyed) {
        // Transform the line points based on the rotation
        const transformedPoints = line.points.map(point => {
          const [px, py] = point;
          const dx = px - updatedBoss.x;
          const dy = py - updatedBoss.y;
          const angle = rotationAngle * (Math.PI / 180);
          const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
          const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);
          return [rotatedX + updatedBoss.x, rotatedY + updatedBoss.y] as [number, number];
        });
        
        // Create a temporary line object with transformed points for collision check
        const tempLine: BossCoreLine = {
          ...line,
          points: transformedPoints
        };
        
        const { collision: lineCollision, isLethal } = checkBossLineCollision(player, tempLine);
        if (lineCollision) {
          if (isLethal) {
            collision = true; // Set game-wide collision flag
          } else {
            lines[i].destroyed = true; // Destroy the line if it's vulnerable
          }
        }
      }
    }
  };
  
  // Check collisions for outer and inner lines
  checkLineCollisions(updatedBoss.outerLines, updatedBoss.outerRotationAngle);
  checkLineCollisions(updatedBoss.innerLines, updatedBoss.innerRotationAngle);
  
  // Can only destroy inner lines if all outer lines are destroyed
  const allOuterLinesDestroyed = updatedBoss.outerLines.every(line => line.destroyed);
  if (allOuterLinesDestroyed) {
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
  
  return { updatedBoss, bossDefeated, collision };
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
  
  // Apply deltaTime normalization
  const timeScale = Math.min(deltaTime, 2);
  
  // Update player position
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
  let shouldUpdateScore = true;
  
  if (shouldSpawnBoss(state.score, bossCore)) {
    console.log(`Spawning boss at score ${state.score}`);
    bossCore = initBossCore(state.score, canvasWidth, canvasHeight);
  }
  
  // Handle boss interaction if active
  let bossDefeated = false;
  let collision = false;
  
  if (bossCore && bossCore.active) {
    const { updatedBoss, bossDefeated: defeated, collision: bossCollision } = 
      updateBossCore(bossCore, timeScale, newPlayer);
    bossCore = updatedBoss;
    bossDefeated = defeated;
    collision = bossCollision;
    
    // Don't generate new blocks or update score while boss is active
    shouldGenerateNewBlocks = false;
    shouldUpdateScore = false;
  } else if (bossCore && !bossCore.active && bossCore.cooldownTimer > 0) {
    const { updatedBoss } = updateBossCore(bossCore, timeScale, newPlayer);
    bossCore = updatedBoss;
    shouldGenerateNewBlocks = false;
    shouldUpdateScore = false;
  }
  
  // Update maze blocks
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
  
  // Update score only if no active boss
  const bonusPoints = bossDefeated ? 5000 * (bossCore?.level || 1) : 0;
  const newScore = shouldUpdateScore ? 
    state.score + (1.33 * timeScale) + scoreBoost + bonusPoints :
    state.score;
  
  // Update color phase (add score boost from backdoor if collected)
  // Also add bonus points if boss defeated
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
