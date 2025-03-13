export interface Player {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
}

export interface MazeBlock {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameState {
  player: Player;
  maze: MazeBlock[];
  score: number;
  gameSpeed: number;
  attemptsLeft: number;
  gameActive: boolean;
  colorPhase: number;
  cursorControl: boolean; // Track if cursor control is active
}

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

// Generate maze blocks
export const generateMaze = (
  maze: MazeBlock[], 
  canvasWidth: number,
  canvasHeight: number,
  gameSpeed: number
): MazeBlock[] => {
  const newMaze = [...maze];
  
  // Generate new maze blocks with a reduced probability (half of the original)
  if (Math.random() < 0.025 || maze.length === 0) { // Changed from 0.05 to 0.025
    // Create a grid-based labyrinth section
    const gridSize = 160; // Doubled from 80 to increase distance between blocks
    const numCols = Math.floor(canvasWidth / gridSize);
    const minPathWidth = 80; // Doubled from 40 to make wider paths
    
    // Generate a random maze pattern
    for (let col = 0; col < numCols; col++) {
      // Skip some columns randomly to create paths
      if (Math.random() < 0.7) {
        // Determine block width (not full width)
        const blockWidth = Math.min(gridSize - minPathWidth, gridSize * 0.7 + Math.random() * 20);
        
        // Determine x position with some randomness
        const xOffset = Math.random() * (gridSize - blockWidth);
        const x = col * gridSize + xOffset;
        
        newMaze.push({
          x,
          y: -100, // Start above the canvas
          width: blockWidth,
          height: 30 + Math.random() * 40 // Varying heights
        });
      }
    }
    
    // Occasionally add horizontal connectors between blocks
    if (Math.random() < 0.3) {
      const y = -100 - Math.random() * 50;
      const width = gridSize * 2 + Math.random() * gridSize;
      const x = Math.random() * (canvasWidth - width);
      
      newMaze.push({
        x,
        y,
        width,
        height: 15 + Math.random() * 20
      });
    }
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

// Update player movement based on keyboard input and cursor position if enabled
export const updatePlayerMovement = (
  player: Player,
  keys: { [key: string]: boolean },
  canvasWidth: number,
  canvasHeight: number,
  cursorControl: boolean,
  cursorPosition: { x: number | null, y: number | null }
): Player => {
  const newPlayer = { ...player };
  const moveSpeed = 5;
  
  if (cursorControl && cursorPosition.x !== null && cursorPosition.y !== null) {
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
    // Keyboard controls (when cursor control is disabled)
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

// Check if player collides with a maze block
export const checkCollision = (player: Player, block: MazeBlock): boolean => {
  return (
    player.x + player.size > block.x &&
    player.x - player.size < block.x + block.width &&
    player.y + player.size > block.y &&
    player.y - player.size < block.y + block.height
  );
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
  
  // Generate new blocks
  const updatedMaze = generateMaze(newMaze, canvasWidth, canvasHeight, state.gameSpeed);
  
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
