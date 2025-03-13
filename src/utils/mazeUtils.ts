import { MazeBlock, ShapeType } from './types';

// Generate maze blocks with Tetris-like shapes
export const generateMaze = (
  maze: MazeBlock[], 
  canvasWidth: number,
  canvasHeight: number,
  gameSpeed: number
): MazeBlock[] => {
  const newMaze = [...maze];
  
  // Generate new maze blocks with a reduced probability
  if (Math.random() < 0.0125 || maze.length === 0) {
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
  
  return newMaze;
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
