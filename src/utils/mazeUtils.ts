import { MazeBlock, ShapeType, Booster, BoosterType } from './types';

// Generate maze blocks with corridor-like patterns
export const generateMaze = (
  maze: MazeBlock[], 
  canvasWidth: number,
  canvasHeight: number,
  gameSpeed: number,
  score: number
): { maze: MazeBlock[], boosters: Booster[] } => {
  const newMaze = [...maze];
  const boosters: Booster[] = [];
  
  // Calculate spawn rate increase based on score
  const baseSpawnRate = 0.025; // Increased from 0.0125 for more continuous generation
  const spawnRateIncrease = Math.floor(score / 1000) * 0.0005; 
  const currentSpawnRate = baseSpawnRate + spawnRateIncrease;
  
  // Size for each matrix symbol
  const symbolSize = 16;
  
  // Grid system for maze generation
  const gridSize = symbolSize * 1.5; // Space between symbols
  const numCols = Math.floor(canvasWidth / gridSize);
  
  // Track current paths to ensure we always have a way through
  const pathColumns = new Set<number>();
  if (maze.length === 0) {
    // Initialize with 2-3 paths on first generation
    const numInitialPaths = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numInitialPaths; i++) {
      pathColumns.add(Math.floor(Math.random() * numCols));
    }
  } else {
    // Find existing paths in the last row of blocks
    const lastRowY = maze.length > 0 ? 
      Math.max(...maze.map(block => block.y)) : -gridSize;
      
    const lastRowBlocks = maze.filter(block => 
      Math.abs(block.y - lastRowY) < gridSize/2);
      
    // Find gaps in the last row (these are paths)
    const blockedColumns = new Set<number>();
    lastRowBlocks.forEach(block => {
      const col = Math.floor(block.x / gridSize);
      blockedColumns.add(col);
    });
    
    // Identify path columns
    for (let col = 0; col < numCols; col++) {
      if (!blockedColumns.has(col)) {
        pathColumns.add(col);
      }
    }
    
    // Ensure we have at least one path
    if (pathColumns.size === 0) {
      pathColumns.add(Math.floor(Math.random() * numCols));
    }
  }
  
  // Generate new row of maze with some probability
  if (Math.random() < currentSpawnRate || maze.length === 0) {
    const y = maze.length > 0 ? 
      Math.max(...maze.map(block => block.y)) + gridSize : -gridSize;
    
    // Sometimes shift paths (make turns) - more likely at higher scores
    const pathShiftProbability = 0.1 + (score / 50000); // Max 30% at 100k score
    if (Math.random() < pathShiftProbability) {
      const pathArray = Array.from(pathColumns);
      
      // Randomly choose a path to shift
      if (pathArray.length > 0) {
        const pathToShift = pathArray[Math.floor(Math.random() * pathArray.length)];
        pathColumns.delete(pathToShift);
        
        // Shift left or right
        const direction = Math.random() > 0.5 ? 1 : -1;
        const newPath = Math.max(0, Math.min(numCols - 1, pathToShift + direction));
        pathColumns.add(newPath);
        
        // Sometimes add a corner piece to make the turn smoother
        if (Math.random() < 0.7) {
          // Add the connection block for the turn
          newMaze.push({
            x: (Math.min(pathToShift, newPath)) * gridSize,
            y: y - gridSize,
            width: gridSize,
            height: gridSize,
            colorPhase: 0
          });
        }
      }
    }
    
    // Sometimes add a new path or remove an existing one
    if (Math.random() < 0.15 && pathColumns.size > 1) {
      const pathArray = Array.from(pathColumns);
      // Remove a random path
      pathColumns.delete(pathArray[Math.floor(Math.random() * pathArray.length)]);
    } else if (Math.random() < 0.15 && pathColumns.size < numCols / 3) {
      // Add a new random path
      let newPath;
      do {
        newPath = Math.floor(Math.random() * numCols);
      } while (pathColumns.has(newPath));
      pathColumns.add(newPath);
    }
    
    // Generate the new row with walls where there are no paths
    for (let col = 0; col < numCols; col++) {
      if (!pathColumns.has(col)) {
        newMaze.push({
          x: col * gridSize,
          y: y,
          width: gridSize,
          height: gridSize,
          colorPhase: 0
        });
      }
    }
  }
  
  // Update maze blocks - move down and remove off-screen blocks
  const updatedMaze = newMaze
    .map(block => ({
      ...block,
      y: block.y + gameSpeed
    }))
    .filter(block => block.y < canvasHeight + gridSize);
  
  // Choose only one booster type to spawn per frame - keep existing logic
  // Pick a random number between 0 and 1
  const boosterRandom = Math.random();
  
  // Safety Key booster (30% chance if eligible)
  if (score > 0 && Math.round(score) % 3000 < 2 && boosterRandom < 0.3) {
    const booster = generateBooster(canvasWidth, canvasHeight, [...updatedMaze], score, BoosterType.SAFETY_KEY);
    if (booster) {
      boosters.push(booster);
    }
  } 
  // Backdoor booster (30% chance if eligible and safety key wasn't spawned)
  else if (score > 0 && Math.round(score) % 1400 < 2 && boosterRandom >= 0.3 && boosterRandom < 0.6) {
    const booster = generateBooster(canvasWidth, canvasHeight, [...updatedMaze], score, BoosterType.BACKDOOR);
    if (booster) {
      boosters.push(booster);
    }
  }
  
  return { maze: updatedMaze, boosters };
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
    const tempBlock: MazeBlock = { 
      x, 
      y, 
      width: size, 
      height: size, 
      colorPhase: 0 // Add colorPhase property
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
