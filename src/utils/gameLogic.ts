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
  
  // Generate new maze blocks with a further reduced probability (quarter of the original)
  if (Math.random() < 0.0125 || maze.length === 0) { // Changed from 0.025 to 0.0125
    // Create a grid-based labyrinth section
    const gridSize = 160; // Keep distance between blocks large
    const numCols = Math.floor(canvasWidth / gridSize);
    const minPathWidth = 80; // Keep wider paths
    
    // Calculate maximum allowed block width (prevent full-width blocks)
    const maxBlockWidth = canvasWidth * 0.8; // Maximum 80% of screen width
    
    // Keep track of newly created blocks to check for overlaps
    const newBlocks: MazeBlock[] = [];
    
    // Generate a random maze pattern
    for (let col = 0; col < numCols; col++) {
      // Skip some columns randomly to create paths
      if (Math.random() < 0.7) {
        // Determine block width (not full width)
        const blockWidth = Math.min(
          gridSize - minPathWidth, 
          gridSize * 0.7 + Math.random() * 20,
          maxBlockWidth
        );
        
        // Determine block height (limiting height to not be more than twice the width)
        const maxHeight = blockWidth * 2;
        const blockHeight = Math.min(30 + Math.random() * 40, maxHeight);
        
        // Determine x position with some randomness
        const xOffset = Math.random() * (gridSize - blockWidth);
        const x = col * gridSize + xOffset;
        const y = -100; // Start above the canvas
        
        // Create the potential new block
        const newBlock = {
          x,
          y,
          width: blockWidth,
          height: blockHeight
        };
        
        // Check if this block overlaps with any of the newly created blocks
        const overlaps = checkBlockOverlap(newBlock, newBlocks);
        
        // Only add the block if it doesn't overlap with other new blocks
        if (!overlaps) {
          newBlocks.push(newBlock);
          newMaze.push(newBlock);
        }
      }
    }
    
    // Occasionally add horizontal connectors between blocks (but not full width)
    if (Math.random() < 0.3) {
      // Width limited to 80% of screen width to ensure there's always a path
      const width = Math.min(
        gridSize * 2 + Math.random() * gridSize,
        canvasWidth * 0.8
      );
      
      // Height limited to not be more than twice the width
      const maxHeight = width * 0.5; // Even more restrictive for connectors
      const height = Math.min(15 + Math.random() * 20, maxHeight);
      
      const x = Math.random() * (canvasWidth - width);
      const y = -100 - Math.random() * 50;
      
      // Create the potential new connector block
      const newConnector = {
        x,
        y,
        width,
        height
      };
      
      // Check if this connector overlaps with any of the newly created blocks
      const overlaps = checkBlockOverlap(newConnector, newBlocks);
      
      // Only add the connector if it doesn't overlap
      if (!overlaps) {
        newBlocks.push(newConnector);
        newMaze.push(newConnector);
      }
    }
  }
  
  return newMaze;
};

// Helper function to check if a block overlaps with any block in a given array
const checkBlockOverlap = (block: MazeBlock, blocks: MazeBlock[]): boolean => {
  // Add a small buffer to prevent blocks from being too close
  const buffer = 5;
  
  for (const existingBlock of blocks) {
    // Check if blocks overlap using their coordinates and dimensions with buffer
    if (
      block.x - buffer < existingBlock.x + existingBlock.width &&
      block.x + block.width + buffer > existingBlock.x &&
      block.y - buffer < existingBlock.y + existingBlock.height &&
      block.y + block.height + buffer > existingBlock.y
    ) {
      return true; // Overlap detected
    }
  }
  
  return false; // No overlap
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
