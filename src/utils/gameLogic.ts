
export interface Player {
  x: number;
  y: number;
  size: number;
}

export interface MazeBlock {
  y: number;
  leftWidth: number;
  rightWidth: number;
}

export interface GameState {
  player: Player;
  maze: MazeBlock[];
  score: number;
  gameSpeed: number;
  attemptsLeft: number;
  gameActive: boolean;
  colorPhase: number;
}

// Initialize game state
export const initGameState = (canvasWidth: number, canvasHeight: number): GameState => {
  return {
    player: { 
      x: canvasWidth / 2, 
      y: canvasHeight - 50, 
      size: 10 
    },
    maze: [],
    score: 0,
    gameSpeed: 2,
    attemptsLeft: 3,
    gameActive: false,
    colorPhase: 0
  };
};

// Generate maze blocks
export const generateMaze = (
  maze: MazeBlock[], 
  canvasWidth: number
): MazeBlock[] => {
  const newMaze = [...maze];
  
  if (Math.random() < 0.1 || maze.length === 0) {
    // Create a minimum gap width for player to navigate through
    const minGapWidth = 80; // Enough space for player to navigate
    const maxBlockWidth = canvasWidth * 0.7; // Maximum width of a block (70% of canvas)
    
    // Random position for the gap
    const gapPosition = Math.random() * (canvasWidth - minGapWidth);
    
    // Calculate left and right widths, ensuring neither exceeds the maximum block width
    let leftWidth = Math.min(gapPosition, maxBlockWidth);
    let rightWidth = Math.min(canvasWidth - gapPosition - minGapWidth, maxBlockWidth);
    
    // Ensure there's always space on both sides for the player to navigate
    if (leftWidth + rightWidth > canvasWidth - minGapWidth * 1.5) {
      // If blocks are too large, reduce them proportionally
      const reduction = (leftWidth + rightWidth) / (canvasWidth - minGapWidth * 1.5);
      leftWidth = leftWidth / reduction;
      rightWidth = rightWidth / reduction;
    }
    
    newMaze.push({
      y: -50,
      leftWidth,
      rightWidth
    });
  }
  
  return newMaze;
};

// Get block color based on score
export const getBlockColor = (score: number): string => {
  const colorPhase = Math.floor(score / 1000);
  switch(colorPhase % 4) {
    case 0: return '#00ffcc'; // Cyan
    case 1: return '#ff00ff'; // Magenta
    case 2: return '#ff3300'; // Orange
    case 3: return '#00ff00'; // Green
    default: return '#00ffcc';
  }
};

// Update game state for each frame
export const updateGameState = (
  state: GameState, 
  canvasWidth: number, 
  canvasHeight: number,
  mouseX: number
): { newState: GameState; collision: boolean } => {
  if (!state.gameActive) {
    return { newState: state, collision: false };
  }
  
  // Update player position
  const newPlayer = {
    ...state.player,
    x: mouseX
  };
  
  // Update maze blocks
  let collision = false;
  const newMaze = state.maze
    .map(block => {
      // Move block down
      const newBlock = { ...block, y: block.y + state.gameSpeed };
      
      // Check collision
      if (
        newBlock.y + 50 > newPlayer.y && 
        newBlock.y < newPlayer.y &&
        (newPlayer.x < newBlock.leftWidth || newPlayer.x > canvasWidth - newBlock.rightWidth)
      ) {
        collision = true;
      }
      
      return newBlock;
    })
    .filter(block => block.y < canvasHeight);
  
  // Generate new blocks
  const updatedMaze = generateMaze(newMaze, canvasWidth);
  
  // Update score and color phase
  const newScore = state.score + 1;
  const newColorPhase = Math.floor(newScore / 1000);
  
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

// Save score to local storage
export const saveScore = (score: number): void => {
  try {
    const scoresJson = localStorage.getItem('netrunner_scores') || '[]';
    const scores = JSON.parse(scoresJson);
    scores.push(score);
    scores.sort((a: number, b: number) => b - a);
    localStorage.setItem('netrunner_scores', JSON.stringify(scores.slice(0, 10)));
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

// Get scores from local storage
export const getScores = (): number[] => {
  try {
    const scoresJson = localStorage.getItem('netrunner_scores') || '[]';
    return JSON.parse(scoresJson);
  } catch (error) {
    console.error('Error loading scores:', error);
    return [];
  }
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
