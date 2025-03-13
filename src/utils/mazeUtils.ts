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
  const boosters = [];
  
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
      
      // Keep track of all newly created blocks to check for overlaps
      const newBlocks: MazeBlock[] = [];
      
      // Choose a random starting position that's not strictly aligned to the grid
      // but still ensures the shape stays within canvas boundaries
      const randomOffset = Math.random() * (gridSize / 2); // 0 to half a grid cell offset
      const col = Math.floor(Math.random() * (numCols - 2)); // Leave space for larger shapes
      const x = col * gridSize + randomOffset;
      const y = -gridSize * 2; // Start above the canvas
      
      // Randomly select one of the four shape types
      const shapeType = getRandomShapeType();
      
      // Create the selected shape
      const shapeBlocks = createShape(shapeType, x, y, gridSize);
      
      // Check if the entire shape can be placed without overlapping existing blocks
      const existingBlocks = [...maze]; // All currently existing blocks
      const canPlaceShape = !shapeBlocks.some(block => 
        checkBlockOverlap(block, existingBlocks, gridSize) || 
        checkBlockOverlap(block, newBlocks, gridSize)
      );
      
      // Only add the shape if it can be placed without overlaps
      if (canPlaceShape) {
        // Add all blocks of the shape
        shapeBlocks.forEach(block => {
          newBlocks.push(block);
          newMaze.push(block);
        });
      }
    }
  }
  
  // Changed: Spawn booster every 1500 points with 80% chance
  if (score > 0 && score % 1500 === 0 && Math.random() < 0.8) {
    const booster = generateBooster(canvasWidth, canvasHeight, [...newMaze], score);
    if (booster) {
      boosters.push(booster);
    }
  }
  
  return { maze: newMaze, boosters };
};

// Generate a booster at a random valid position
const generateBooster = (
  canvasWidth: number,
  canvasHeight: number,
  existingBlocks: MazeBlock[],
  score: number
): Booster | null => {
  const size = 30; // Size of the booster
  const padding = 50; // Padding from edges
  
  // Try up to 10 times to find a valid position
  for (let i = 0; i < 10; i++) {
    const x = padding + Math.random() * (canvasWidth - padding * 2 - size);
    const y = padding + Math.random() * (canvasHeight - padding * 2 - size);
    
    // Create a temporary block to represent the booster for collision checking
    const tempBlock: MazeBlock = { x, y, width: size, height: size };
    
    // Check if the booster would overlap with any existing block
    if (!checkBlockOverlap(tempBlock, existingBlocks, 10)) {
      // Valid position found, create the booster
      return {
        x,
        y,
        size,
        type: BoosterType.SAFETY_KEY,
        active: true
      };
    }
  }
  
  // Could not find a valid position after 10 attempts
  return null;
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
  
  switch(type) {
    case ShapeType.SINGLE:
      // Single square block
      blocks.push({
        x: startX,
        y: startY,
        width: gridSize,
        height: gridSize
      });
      break;
      
    case ShapeType.VERTICAL_DOUBLE:
      // Two squares stacked vertically
      blocks.push({
        x: startX,
        y: startY,
        width: gridSize,
        height: gridSize
      });
      blocks.push({
        x: startX,
        y: startY + gridSize,
        width: gridSize,
        height: gridSize
      });
      break;
      
    case ShapeType.HORIZONTAL_DOUBLE:
      // Two squares side by side horizontally
      blocks.push({
        x: startX,
        y: startY,
        width: gridSize,
        height: gridSize
      });
      blocks.push({
        x: startX + gridSize,
        y: startY,
        width: gridSize,
        height: gridSize
      });
      break;
      
    case ShapeType.L_SHAPE:
      // L-shape made of 3 squares
      blocks.push({
        x: startX,
        y: startY,
        width: gridSize,
        height: gridSize
      });
      blocks.push({
        x: startX,
        y: startY + gridSize,
        width: gridSize,
        height: gridSize
      });
      blocks.push({
        x: startX + gridSize,
        y: startY + gridSize,
        width: gridSize,
        height: gridSize
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

// Get block color based on score - changing every 5000 points with new color sequence
export const getBlockColor = (score: number): string => {
  // Change color every 5000 points instead of 1000
  const colorPhase = Math.floor(score / 5000);
  switch(colorPhase % 5) {
    case 0: return '#00ff00'; // Неоново-зеленый
    case 1: return '#00ccff'; // Неоново-синий
    case 2: return '#ff0000'; // Неоново-красный
    case 3: return '#ffffff'; // Неоново-белый
    case 4: return '#cc00ff'; // Неоново-фиолетовый
    default: return '#00ff00';
  }
};

// Get the opposite color of the current block color
export const getOppositeColor = (score: number): string => {
  const colorPhase = Math.floor(score / 5000);
  switch(colorPhase % 5) {
    case 0: return '#ff00ff'; // Opposite of green (magenta)
    case 1: return '#ff3300'; // Opposite of blue (orange/red)
    case 2: return '#00ffff'; // Opposite of red (cyan)
    case 3: return '#000000'; // Opposite of white (black)
    case 4: return '#33ff00'; // Opposite of purple (lime green)
    default: return '#ff00ff';
  }
};

// Get enhanced glow color for the blocks based on the block color
export const getGlowColor = (blockColor: string): string => {
  // Make glow more intense for neon effect
  return blockColor + 'CC'; // Adding CC hex (204 decimal, 80% opacity)
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
