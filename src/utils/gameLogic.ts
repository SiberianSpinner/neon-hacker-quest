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
  const outerRotationSpeed = (360 / (15)) / 60; // 15 seconds for full rotation
  const innerRotationSpeed = -1.5 * outerRotationSpeed;
  
  updatedBoss.outerRotationAngle += outerRotationSpeed * deltaTime;
  updatedBoss.innerRotationAngle += innerRotationSpeed * deltaTime;
  
  // Keep angles within 0-360
  updatedBoss.outerRotationAngle %= 360;
  updatedBoss.innerRotationAngle %= 360;
  
  // Update vulnerable lines timer
  updatedBoss.vulnerableLinesTimer -= deltaTime;
  if (updatedBoss.vulnerableLinesTimer <= 0) {
    // Reset timer to 5 seconds (300 frames at 60fps)
    updatedBoss.vulnerableLinesTimer = 300;
    
    // Reset vulnerability status for all lines
    [...updatedBoss.outerLines, ...updatedBoss.innerLines].forEach(line => {
      line.isVulnerable = false;
    });
    
    // Select 4 random lines to make vulnerable
    const allLines = [
      ...updatedBoss.outerLines.filter(line => !line.destroyed),
      ...updatedBoss.innerLines.filter(line => !line.destroyed)
    ];
    
    const linesToMakeVulnerable = Math.min(4, allLines.length);
    const shuffledLines = [...allLines].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < linesToMakeVulnerable; i++) {
      const lineIndex = shuffledLines[i].id;
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
  
  // Check collisions with both outer and inner lines
  const checkLineCollisions = (lines: BossCoreLine[], rotation: number) => {
    lines.forEach((line, index) => {
      if (!line.destroyed) {
        const transformedPoints = line.points.map(point => {
          const [px, py] = point;
          const dx = px - updatedBoss.x;
          const dy = py - updatedBoss.y;
          const angle = rotation * (Math.PI / 180);
          const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
          const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);
          return [rotatedX + updatedBoss.x, rotatedY + updatedBoss.y] as [number, number];
        });
        
        const tempLine = { ...line, points: transformedPoints };
        
        if (checkBossLineCollision(player, tempLine)) {
          if (line.isVulnerable) {
            // If line is vulnerable (green), destroy it
            lines[index].destroyed = true;
          } else {
            // If line is not vulnerable (red), player loses
            if (!player.invulnerable) {
              throw new Error("collision");
            }
          }
        }
      }
    });
  };
  
  // Check collisions for both outer and inner lines
  try {
    checkLineCollisions(updatedBoss.outerLines, updatedBoss.outerRotationAngle);
    checkLineCollisions(updatedBoss.innerLines, updatedBoss.innerRotationAngle);
    
    // Check for collision with memory core center
    const coreSize = 30;
    const dx = player.x - updatedBoss.x;
    const dy = player.y - updatedBoss.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < player.size + coreSize/2) {
      // Player touched the memory core center, boss is defeated
      updatedBoss.active = false;
      updatedBoss.cooldownTimer = 120; // 2 seconds cooldown at 60fps
      bossDefeated = true;
    }
    
  } catch (error) {
    if (error.message === "collision" && !player.invulnerable) {
      throw error; // Re-throw collision error for game over handling
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
  deltaTime: number = 1,
  isMobile: boolean = false,
  swipeDirection: { x: number, y: number } | null = null
): { newState: GameState; collision: boolean; gameWon: boolean } => {
  if (!state.gameActive) {
    return { newState: state, collision: false, gameWon: false };
  }

  const timeScale = Math.min(deltaTime, 2);
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

  if (newPlayer.invulnerable) {
    newPlayer.invulnerableTimer -= 1 * timeScale;
    if (newPlayer.invulnerableTimer <= 0) {
      newPlayer.invulnerable = false;
    }
  }

  let bossCore = state.bossCore;
  let shouldGenerateNewBlocks = true;
  let shouldUpdateScore = true;

  if (shouldSpawnBoss(state.score, bossCore)) {
    console.log(`Spawning boss at score ${state.score}`);
    bossCore = initBossCore(state.score, canvasWidth, canvasHeight);
  }

  let bossDefeated = false;
  if (bossCore && bossCore.active) {
    try {
      const { updatedBoss, bossDefeated: defeated } = updateBossCore(bossCore, timeScale, newPlayer);
      bossCore = updatedBoss;
      bossDefeated = defeated;
      shouldGenerateNewBlocks = false;
      shouldUpdateScore = false;
    } catch (error: any) {
      if (error.message === "collision") {
        return { newState: state, collision: true, gameWon: false };
      }
    }
  } else if (bossCore && !bossCore.active && bossCore.cooldownTimer > 0) {
    const { updatedBoss } = updateBossCore(bossCore, timeScale, newPlayer);
    bossCore = updatedBoss;
    shouldGenerateNewBlocks = false;
    shouldUpdateScore = false;
  }

  let collision = false;
  const newMaze = state.maze
    .map(block => {
      const newBlock = { ...block, y: block.y + state.gameSpeed * timeScale };
      
      if (!newPlayer.invulnerable && checkCollision(newPlayer, newBlock)) {
        collision = true;
      }
      
      return newBlock;
    })
    .filter(block => block.y < canvasHeight + 100);

  const newBoosters = state.boosters
    .map(booster => {
      const newBooster = { ...booster, y: booster.y + state.gameSpeed * timeScale };
      return newBooster;
    })
    .filter(booster => booster.y < canvasHeight + 100 && booster.active);
    
  let collectedBooster = false;
  let newCollectedSafetyKeys = state.collectedSafetyKeys;
  let newCollectedBackdoors = state.collectedBackdoors;
  let scoreBoost = 0;
  
  newBoosters.forEach(booster => {
    if (booster.active && checkBoosterCollision(newPlayer.x, newPlayer.y, newPlayer.size, booster)) {
      booster.active = false;
      collectedBooster = true;
      
      if (booster.type === BoosterType.SAFETY_KEY) {
        newPlayer.invulnerable = true;
        newPlayer.invulnerableTimer = 1800;
        newCollectedSafetyKeys += 1;
      } else if (booster.type === BoosterType.BACKDOOR) {
        scoreBoost = 3000;
        newCollectedBackdoors += 1;
      }
    }
  });

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

  const bonusPoints = bossDefeated ? 5000 * (bossCore?.level || 1) : 0;
  const newScore = shouldUpdateScore ? state.score + (1.33 * timeScale) + scoreBoost + bonusPoints : state.score;
  
  const newColorPhase = Math.floor(newScore / 5000);
  
  const gameWon = newScore >= 100000;
  
  const newState = {
    ...state,
    player: newPlayer,
    maze: updatedMaze,
    boosters: [...newBoosters.filter(b => b.active), ...newGeneratedBoosters],
    score: newScore,
    colorPhase: newColorPhase,
    gameSpeed: Math.min(10, 2.67 + Math.floor(newScore / 2000)),
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
  const percentage = score / 1000;
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
    selectedSkin: state.selectedSkin,
    bossCore: null
  };
};

// Track daily game plays
export const updateDailyGameStats = (): void => {
  const today = new Date().toISOString().split('T')[0];
  const DAILY_STATS_KEY = 'netrunner_daily_stats';
  
  const statsJson = localStorage.getItem(DAILY_STATS_KEY);
  let stats = statsJson ? JSON.parse(statsJson) : { date: today, gamesPlayed: 0 };
  
  if (stats.date !== today) {
    stats = { date: today, gamesPlayed: 0 };
  }
  
  stats.gamesPlayed += 1;
  
  console.log(`Daily game stats updated: ${stats.gamesPlayed} games played today`);
  
  localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats));
};

// Function to get daily game stats
export const getDailyGameStats = (): { date: string, gamesPlayed: number } => {
  const DAILY_STATS_KEY = 'netrunner_daily_stats';
  const statsJson = localStorage.getItem(DAILY_STATS_KEY);
  
  if (statsJson) {
    return JSON.parse(statsJson);
  }
  
  return { 
    date: new Date().toISOString().split('T')[0], 
    gamesPlayed: 0 
  };
};

// End game and save score
export const endGame = (state: GameState): GameState => {
  console.log("Ending game, saving score:", state.score);
  saveScore(state.score);
  
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

export { updatePlayerMovement } from './playerUtils';
export { generateMaze, getBlockColor, checkBoosterCollision } from './mazeUtils';
export { checkCollision } from './collisionUtils';
export { saveScore, getScores } from './storageUtils';
