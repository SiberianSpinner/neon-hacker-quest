
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
  
  // Changed: Spawn "Safety Key" booster every 1500 points with 80% chance
  if (score > 0 && score % 1500 === 0 && Math.random() < 0.8) {
    const booster = generateBooster(canvasWidth, canvasHeight, [...newMaze], score, BoosterType.SAFETY_KEY);
    if (booster) {
      boosters.push(booster);
    }
  }
  
  // New: Spawn "Backdoor" booster every 700 points with 70% chance
  if (score > 0 && score % 700 === 0 && Math.random() < 0.7) {
    const booster = generateBooster(canvasWidth, canvasHeight, [...newMaze], score, BoosterType.BACKDOOR);
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
  score: number,
  boosterType: BoosterType
): Booster | null => {
  // Increased booster size from 30 to 60 (doubled)
  const size = 60; // Size of the booster (doubled from 30)
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
        type: boosterType,
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
