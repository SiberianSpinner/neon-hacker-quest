
import { MazeBlock, ShapeType, Booster, BoosterType } from './types';

// Generate maze blocks with Tetris-like shapes
export const generateMaze = (
  maze: MazeBlock[], 
  canvasWidth: number,
  canvasHeight: number,
  gameSpeed: number,
  score: number
): { maze: MazeBlock[], boosters: Booster[] } => {
  const newMaze = [...maze];
  const boosters: Booster[] = [];
  
  // Calculate spawn rate increase based on score (2% per 1000 points instead of 5%)
  const baseSpawnRate = 0.0125;
  const spawnRateIncrease = Math.floor(score / 1000) * 0.00025; // 2% of 0.0125 = 0.00025
  const currentSpawnRate = baseSpawnRate + spawnRateIncrease;
  
  // Calculate number of shapes to spawn (increase by 5% every 2500 points)
  const baseShapeCount = 1;
  const shapeCountIncrease = Math.floor(score / 2500) * 0.05;
  const shapesToSpawn = Math.max(1, Math.floor(baseShapeCount * (1 + shapeCountIncrease)));
  
  // Generate new maze blocks with adjusted probability and increased shape count
  if (Math.random() < currentSpawnRate || maze.length === 0) {
    for (let i = 0; i < shapesToSpawn; i++) {
      const gridSize = 50; // Base size for each block cube
      
      // Calculate how many potential columns we have
      const numCols = Math.floor(canvasWidth / gridSize);

      // Create a maze pattern
      createMazePattern(newMaze, canvasWidth, canvasHeight, gridSize);
    }
  }
  
  // === BOOSTER GENERATION LOGIC ===
  // Generate boosters with fixed probability
  
  // Safety Key booster (30% chance if eligible)
  if (score > 0 && Math.round(score) % 3000 < 20 && Math.random() < 0.3) {
    const booster = generateBooster(canvasWidth, canvasHeight, [...newMaze], score, BoosterType.SAFETY_KEY);
    if (booster) {
      boosters.push(booster);
      console.log("Safety key booster spawned at score:", score);
    }
  } 
  // Backdoor booster (30% chance if eligible)
  else if (score > 0 && Math.round(score) % 1400 < 20 && Math.random() < 0.3) {
    const booster = generateBooster(canvasWidth, canvasHeight, [...newMaze], score, BoosterType.BACKDOOR);
    if (booster) {
      boosters.push(booster);
      console.log("Backdoor booster spawned at score:", score);
    }
  }
  
  return { maze: newMaze, boosters };
};

// Create a more structured maze pattern
const createMazePattern = (
  maze: MazeBlock[],
  canvasWidth: number,
  canvasHeight: number,
  gridSize: number
) => {
  // Start position - randomly positioned at the top
  const startX = Math.floor(Math.random() * (canvasWidth - gridSize * 3));
  const startY = -gridSize * 2; // Start above the canvas
  
  // Corridor width/height
  const corridorWidth = gridSize * (3 + Math.floor(Math.random() * 2)); // 3-4 grid cells
  
  // Create a vertical main path with branches
  let currentX = startX;
  let currentY = startY;
  
  // Generate a path with turns and branches
  const pathLength = 4 + Math.floor(Math.random() * 3); // 4-6 segments
  
  for (let i = 0; i < pathLength; i++) {
    // Decide if we should create a horizontal corridor
    const createHorizontalCorridor = Math.random() < 0.4; // 40% chance
    
    if (createHorizontalCorridor) {
      // Decide corridor direction: left or right
      const goRight = Math.random() < 0.5;
      const corridorLength = gridSize * (2 + Math.floor(Math.random() * 2)); // 2-3 grid cells
      
      // Create horizontal corridor
      const horizontalBlockX = goRight ? currentX : currentX - corridorLength;
      createBlock(maze, {
        x: horizontalBlockX,
        y: currentY,
        width: corridorLength,
        height: corridorWidth,
        colorPhase: 0
      });
      
      // Update current position
      if (goRight) {
        currentX += corridorLength;
      } else {
        currentX -= corridorLength;
      }
    }
    
    // Create vertical corridor segment
    const verticalLength = gridSize * (2 + Math.floor(Math.random() * 2)); // 2-3 grid cells
    createBlock(maze, {
      x: currentX,
      y: currentY,
      width: corridorWidth,
      height: verticalLength,
      colorPhase: 0
    });
    
    // Update Y position for next segment
    currentY += verticalLength;
    
    // Randomly shift X position for the next vertical segment (create turns)
    const shift = Math.random() < 0.3; // 30% chance to shift
    if (shift) {
      const shiftDirection = Math.random() < 0.5 ? -1 : 1;
      const shiftAmount = gridSize * (1 + Math.floor(Math.random() * 2));
      currentX += shiftDirection * shiftAmount;
      
      // Ensure we stay within canvas bounds
      currentX = Math.max(0, Math.min(canvasWidth - corridorWidth, currentX));
    }
  }
};

// Helper to create a block and add it to the maze
const createBlock = (maze: MazeBlock[], block: MazeBlock) => {
  // Ensure block is within canvas bounds
  if (block.x >= 0 && block.y >= -1000) { // Allow some blocks to be off-screen at the top
    maze.push(block);
  }
};

// Generate a booster at a random valid position
const generateBooster = (
  canvasWidth: number,
  canvasHeight: number,
  existingBlocks: MazeBlock[],
  score: number,
  boosterType: BoosterType
): Booster | null => {
  // Booster size
  const size = 40;
  const padding = 50; // Padding from edges
  
  // Try up to 10 times to find a valid position
  for (let i = 0; i < 10; i++) {
    const x = padding + Math.random() * (canvasWidth - padding * 2 - size);
    const y = padding + Math.random() * (canvasHeight / 2 - padding * 2 - size);
    
    // Create a temporary block to represent the booster for collision checking
    const tempBlock: MazeBlock = { 
      x, 
      y, 
      width: size, 
      height: size, 
      colorPhase: 0
    };
    
    // Check if the booster would overlap with any existing block
    if (!checkBlockOverlap(tempBlock, existingBlocks, 10)) {
      // Valid position found, create the booster
      return {
        x,
        y,
        size,
        type: boosterType,
        active: true
      };
    }
  }
  
  // Could not find a valid position after tries
  // As a fallback, place it in a fixed position with higher chance of visibility
  return {
    x: canvasWidth / 2 - size / 2,
    y: canvasHeight / 4,
    size,
    type: boosterType,
    active: true
  };
};

// Get a random shape type
const getRandomShapeType = (): ShapeType => {
  const shapes = [
    ShapeType.SINGLE, 
    ShapeType.VERTICAL_DOUBLE, 
    ShapeType.HORIZONTAL_DOUBLE, 
    ShapeType.L_SHAPE
  ];
  const randomIndex = Math.floor(Math.random() * shapes.length);
  return shapes[randomIndex];
};

// Create a shape based on the given type, position and grid size
const createShape = (
  type: ShapeType, 
  startX: number, 
  startY: number, 
  gridSize: number
): MazeBlock[] => {
  const blocks: MazeBlock[] = [];
  const colorPhase = 0; // Default colorPhase
  
  switch(type) {
    case ShapeType.SINGLE:
      // Single square block
      blocks.push({
        x: startX,
        y: startY,
        width: gridSize,
        height: gridSize,
        colorPhase
      });
      break;
      
    case ShapeType.VERTICAL_DOUBLE:
      // Two squares stacked vertically
      blocks.push({
        x: startX,
        y: startY,
        width: gridSize,
        height: gridSize,
        colorPhase
      });
      blocks.push({
        x: startX,
        y: startY + gridSize,
        width: gridSize,
        height: gridSize,
        colorPhase
      });
      break;
      
    case ShapeType.HORIZONTAL_DOUBLE:
      // Two squares side by side horizontally
      blocks.push({
        x: startX,
        y: startY,
        width: gridSize,
        height: gridSize,
        colorPhase
      });
      blocks.push({
        x: startX + gridSize,
        y: startY,
        width: gridSize,
        height: gridSize,
        colorPhase
      });
      break;
      
    case ShapeType.L_SHAPE:
      // L-shape made of 3 squares
      blocks.push({
        x: startX,
        y: startY,
        width: gridSize,
        height: gridSize,
        colorPhase
      });
      blocks.push({
        x: startX,
        y: startY + gridSize,
        width: gridSize,
        height: gridSize,
        colorPhase
      });
      blocks.push({
        x: startX + gridSize,
        y: startY + gridSize,
        width: gridSize,
        height: gridSize,
        colorPhase
      });
      break;
  }
  
  return blocks;
};

// Helper function to check if a block overlaps with any block in a given array
export const checkBlockOverlap = (
  block: MazeBlock, 
  blocks: MazeBlock[],
  minimumGap: number = 0
): boolean => {
  for (const existingBlock of blocks) {
    // Check if blocks overlap or are too close (within minimum gap)
    if (
      block.x - minimumGap < existingBlock.x + existingBlock.width &&
      block.x + block.width + minimumGap > existingBlock.x &&
      block.y - minimumGap < existingBlock.y + existingBlock.height &&
      block.y + block.height + minimumGap > existingBlock.y
    ) {
      return true; // Overlap or too close
    }
  }
  
  return false; // No overlap and not too close
};

// Get block color based on score - new sequence of colors
export const getBlockColor = (score: number): string => {
  // First sequence (single colors): every 5000 points
  const totalPhases = 20; // Total number of color phases (7 single + 13 gradient)
  const colorPhase = Math.floor(score / 5000);
  
  // First 7 phases are single colors
  if (colorPhase < 7) {
    switch(colorPhase % 7) {
      case 0: return '#00ff00'; // Neon Green
      case 1: return '#ffff00'; // Neon Yellow
      case 2: return '#00ccff'; // Neon Blue
      case 3: return '#ff9900'; // Neon Orange
      case 4: return '#cc00ff'; // Neon Purple
      case 5: return '#ff0000'; // Neon Red
      case 6: return '#ffffff'; // Neon White
      default: return '#00ff00';
    }
  } 
  // After 35000 points (7 phases), use dual-color gradients
  else {
    // For matrix symbol blocks, we'll use solid colors instead of gradients
    // as gradients don't work well with text rendering
    const gradientPhase = colorPhase - 7;
    switch(gradientPhase % 13) {
      case 0: return '#7fff00'; // Chartreuse (Green-Yellow)
      case 1: return '#00ffcc'; // Aqua (Green-Blue)
      case 2: return '#66ccff'; // Light Blue (Yellow-Blue)
      case 3: return '#ffcc00'; // Gold (Yellow-Orange)
      case 4: return '#00ccff'; // Sky Blue (Blue-Orange)
      case 5: return '#cc66ff'; // Amethyst (Blue-Purple)
      case 6: return '#ff9966'; // Peach (Orange-Purple)
      case 7: return '#ff6600'; // Dark Orange (Orange-Red)
      case 8: return '#ff66cc'; // Pink (Purple-Red)
      case 9: return '#cc99ff'; // Lavender (Purple-White)
      case 10: return '#ff9999'; // Light Pink (Red-White)
      case 11: return '#ffffff'; // White
      case 12: return '#cccccc'; // Light Gray (White-Black)
      default: return '#00ff00';
    }
  }
};

// Get the opposite color of the current block color
export const getOppositeColor = (score: number): string => {
  const colorPhase = Math.floor(score / 5000);
  if (colorPhase < 7) {
    switch(colorPhase % 7) {
      case 0: return '#ff00ff'; // Opposite of green (magenta)
      case 1: return '#0000ff'; // Opposite of yellow (blue)
      case 2: return '#ff6600'; // Opposite of blue (orange)
      case 3: return '#0066ff'; // Opposite of orange (blue)
      case 4: return '#33ff00'; // Opposite of purple (lime green)
      case 5: return '#00ffff'; // Opposite of red (cyan)
      case 6: return '#000000'; // Opposite of white (black)
      default: return '#ff00ff';
    }
  } else {
    // For gradient phases, use a contrasting single color
    return '#00ffcc';
  }
};

// Get enhanced glow color for the blocks based on the block color
export const getGlowColor = (blockColor: string): string => {
  // For matrix symbol blocks, simplify the glow
  // Use a higher opacity
  return blockColor + 'FF'; // Adding FF hex (255 decimal, 100% opacity)
};

// Check if player collides with a booster
export const checkBoosterCollision = (
  playerX: number,
  playerY: number,
  playerSize: number,
  booster: Booster
): boolean => {
  const distance = Math.sqrt(
    Math.pow(playerX - (booster.x + booster.size / 2), 2) +
    Math.pow(playerY - (booster.y + booster.size / 2), 2)
  );
  
  return distance < (playerSize + booster.size / 2);
};
