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
  const baseSpawnRate = 0.025; 
  const spawnRateIncrease = Math.floor(score / 1000) * 0.0005; 
  const currentSpawnRate = baseSpawnRate + spawnRateIncrease;
  
  // Size for each matrix symbol
  const symbolSize = 16;
  
  // Grid system for maze generation
  const gridSize = symbolSize * 1.5; // Space between symbols
  const numCols = Math.floor(canvasWidth / gridSize);
  
  // Make wider passages (4-6 symbols wide)
  const minPassageWidth = 4;
  const maxPassageWidth = 6;
  
  // Track current paths to ensure we always have a way through
  const pathSegments: Array<{start: number, width: number}> = [];
  
  if (maze.length === 0) {
    // Initialize with 1-2 wide passages on first generation
    const numInitialPaths = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numInitialPaths; i++) {
      const passageWidth = minPassageWidth + Math.floor(Math.random() * (maxPassageWidth - minPassageWidth + 1));
      const maxStartPosition = numCols - passageWidth;
      const startPos = Math.floor(Math.random() * maxStartPosition);
      pathSegments.push({ start: startPos, width: passageWidth });
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
    
    // Identify path segments
    let currentSegmentStart: number | null = null;
    let currentSegmentWidth = 0;
    
    for (let col = 0; col < numCols; col++) {
      if (!blockedColumns.has(col)) {
        // This column is part of a path
        if (currentSegmentStart === null) {
          currentSegmentStart = col;
          currentSegmentWidth = 1;
        } else {
          currentSegmentWidth++;
        }
      } else if (currentSegmentStart !== null) {
        // End of a segment
        pathSegments.push({ start: currentSegmentStart, width: currentSegmentWidth });
        currentSegmentStart = null;
        currentSegmentWidth = 0;
      }
    }
    
    // Don't forget the last segment if it extends to the edge
    if (currentSegmentStart !== null) {
      pathSegments.push({ start: currentSegmentStart, width: currentSegmentWidth });
    }
    
    // Ensure we have at least one path
    if (pathSegments.length === 0) {
      const passageWidth = minPassageWidth + Math.floor(Math.random() * (maxPassageWidth - minPassageWidth + 1));
      const maxStartPosition = numCols - passageWidth;
      const startPos = Math.floor(Math.random() * maxStartPosition);
      pathSegments.push({ start: startPos, width: passageWidth });
    }
  }
  
  // Generate new row of maze with some probability
  if (Math.random() < currentSpawnRate || maze.length === 0) {
    const y = maze.length > 0 ? 
      Math.max(...maze.map(block => block.y)) + gridSize : -gridSize;
    
    // Enhanced labyrinth generation with more complex patterns and long corridors
    const pathUpdateProbability = 0.4 + (score / 20000); // Higher probability to create more complex patterns
    
    if (Math.random() < pathUpdateProbability && pathSegments.length > 0) {
      // Choose a random path segment to modify
      const segmentIndex = Math.floor(Math.random() * pathSegments.length);
      const segment = pathSegments[segmentIndex];
      
      // Decide how to modify the path - more complex decision tree for better labyrinth structure
      const modType = Math.random();
      
      if (modType < 0.7) { // High probability for horizontal shifts to create corridors
        // Shift path (left or right)
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        // Make larger and more dramatic shifts for better labyrinth structure
        // Larger shifts (2-4 columns) create more obvious corridors
        const shiftAmount = 2 + Math.floor(Math.random() * 3); 
        const newStart = Math.max(0, Math.min(numCols - segment.width, segment.start + direction * shiftAmount));
        
        // Only make change if we don't overlap with other paths
        let canShift = true;
        for (let i = 0; i < pathSegments.length; i++) {
          if (i !== segmentIndex) {
            const otherSeg = pathSegments[i];
            if (!(newStart + segment.width <= otherSeg.start || newStart >= otherSeg.start + otherSeg.width)) {
              canShift = false;
              break;
            }
          }
        }
        
        if (canShift) {
          // Update the segment
          pathSegments[segmentIndex] = { ...segment, start: newStart };
          
          // Create a proper horizontal corridor with longer extensions
          // Higher probability to create substantial corridors (95%)
          if (Math.random() < 0.95) {
            const minX = Math.min(segment.start, newStart);
            const maxX = Math.max(segment.start + segment.width, newStart + segment.width);
            
            // Add the connection blocks for the horizontal corridor
            for (let col = 0; col < numCols; col++) {
              if (col < minX || col >= maxX) {
                // Add wall blocks to create a corridor
                newMaze.push({
                  x: col * gridSize,
                  y: y - gridSize,
                  width: gridSize,
                  height: gridSize,
                  colorPhase: 0
                });
              }
            }
            
            // Often extend the corridor vertically to make it longer
            // This creates longer vertical corridors before turning
            if (Math.random() < 0.7) {
              // Create longer corridors (2-4 segments)
              const corridorLength = 2 + Math.floor(Math.random() * 3);
              
              for (let i = 1; i <= corridorLength; i++) {
                for (let col = 0; col < numCols; col++) {
                  if (col < minX || col >= maxX) {
                    newMaze.push({
                      x: col * gridSize,
                      y: y - gridSize * (i + 1),
                      width: gridSize,
                      height: gridSize,
                      colorPhase: 0
                    });
                  }
                }
              }
              
              // Sometimes create a T-junction by adding a perpendicular corridor
              if (Math.random() < 0.3 && corridorLength > 2) {
                const perpY = y - gridSize * (1 + Math.floor(Math.random() * corridorLength));
                const perpStartCol = Math.floor(Math.random() * (minX - 2)) + 1;
                const perpEndCol = Math.min(numCols - 1, perpStartCol + Math.floor(numCols * 0.6));
                
                for (let col = perpStartCol; col <= perpEndCol; col++) {
                  if (col < minX || col >= maxX) {
                    // Skip adding wall blocks where our vertical corridor already exists
                    const isInVerticalCorridor = col >= minX && col < maxX;
                    if (!isInVerticalCorridor) {
                      newMaze.push({
                        x: col * gridSize,
                        y: perpY,
                        width: gridSize,
                        height: gridSize,
                        colorPhase: 0
                      });
                    }
                  }
                }
              }
            }
          }
        }
      } else if (modType < 0.9) {
        // Narrow or widen the passage - less frequent but creates variety
        const newWidth = minPassageWidth + Math.floor(Math.random() * (maxPassageWidth - minPassageWidth + 1));
        const maxPossibleStart = numCols - newWidth;
        
        // Center the new passage around the old one's center
        const center = segment.start + segment.width / 2;
        const newStart = Math.max(0, Math.min(maxPossibleStart, Math.floor(center - newWidth / 2)));
        
        // Only make change if we don't overlap with other paths
        let canResize = true;
        for (let i = 0; i < pathSegments.length; i++) {
          if (i !== segmentIndex) {
            const otherSeg = pathSegments[i];
            if (!(newStart + newWidth <= otherSeg.start || newStart >= otherSeg.start + otherSeg.width)) {
              canResize = false;
              break;
            }
          }
        }
        
        if (canResize) {
          // Update the segment
          pathSegments[segmentIndex] = { start: newStart, width: newWidth };
        }
      } else {
        // Create a dead-end branch (10% chance) - adds complexity to the labyrinth
        if (pathSegments.length === 1) {
          // If there's only one path, create a second path that's a dead end
          const newWidth = minPassageWidth + Math.floor(Math.random() * (maxPassageWidth - minPassageWidth + 1));
          let newStart;
          
          // Try to place the new passage away from the existing one
          if (segment.start < numCols / 2) {
            // Existing path is on the left, put new one on the right
            newStart = Math.floor(numCols / 2) + Math.floor(Math.random() * (numCols / 4));
          } else {
            // Existing path is on the right, put new one on the left
            newStart = Math.floor(Math.random() * (numCols / 4));
          }
          
          // Make sure it fits
          newStart = Math.min(newStart, numCols - newWidth);
          
          // Add the new path segment
          pathSegments.push({ start: newStart, width: newWidth });
          
          // In 3 rows, it will become a dead end
          setTimeout(() => {
            // This is a placeholder - we'll handle dead ends naturally through path removal
          }, 3);
        }
      }
    }
    
    // Sometimes merge two paths to create loops in the labyrinth
    if (pathSegments.length >= 2 && Math.random() < 0.15) {
      // Sort segments by start position
      const sortedSegments = [...pathSegments].sort((a, b) => a.start - b.start);
      
      // Choose two adjacent segments
      const idx = Math.floor(Math.random() * (sortedSegments.length - 1));
      const seg1 = sortedSegments[idx];
      const seg2 = sortedSegments[idx + 1];
      
      // If they're close enough, merge them
      if (seg2.start - (seg1.start + seg1.width) <= 4) {
        // Calculate the new merged segment
        const newStart = seg1.start;
        const newWidth = seg2.start + seg2.width - seg1.start;
        
        // Replace the two segments with one merged segment
        pathSegments.splice(pathSegments.indexOf(seg1), 1);
        pathSegments.splice(pathSegments.indexOf(seg2), 1);
        pathSegments.push({ start: newStart, width: newWidth });
      }
    }
    
    // Sometimes add or remove paths to create more complex labyrinths
    if (Math.random() < 0.15 && pathSegments.length > 1) {
      // Remove a random path (but not the widest one) to create dead ends
      const sortedSegments = [...pathSegments].sort((a, b) => a.width - b.width);
      pathSegments.splice(pathSegments.indexOf(sortedSegments[0]), 1);
    } else if (Math.random() < 0.15 && pathSegments.length < 3) {
      // Add a new random path to create branching
      const newWidth = minPassageWidth + Math.floor(Math.random() * (maxPassageWidth - minPassageWidth + 1));
      const maxStart = numCols - newWidth;
      
      // Try 5 times to find a non-overlapping position
      for (let attempt = 0; attempt < 5; attempt++) {
        const newStart = Math.floor(Math.random() * maxStart);
        let overlaps = false;
        
        for (const segment of pathSegments) {
          if (!(newStart + newWidth <= segment.start || newStart >= segment.start + segment.width)) {
            overlaps = true;
            break;
          }
        }
        
        if (!overlaps) {
          pathSegments.push({ start: newStart, width: newWidth });
          break;
        }
      }
    }
    
    // Generate the new row with walls where there are no paths
    const isWall = new Array(numCols).fill(true);
    
    // Mark passage areas as not walls
    for (const segment of pathSegments) {
      for (let col = segment.start; col < segment.start + segment.width; col++) {
        if (col < numCols) {
          isWall[col] = false;
        }
      }
    }
    
    // Create wall blocks
    for (let col = 0; col < numCols; col++) {
      if (isWall[col]) {
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
  
  // Choose only one booster type to spawn per frame
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
