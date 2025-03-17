
import React, { useMemo } from 'react';
import { MazeBlock } from '@/utils/types';
import { getBlockColor, getGlowColor } from '@/utils/mazeUtils';

interface MazeBlocksProps {
  blocks: MazeBlock[];
  score: number;
}

// Use React.memo to prevent unnecessary re-renders
const MazeBlocks: React.FC<MazeBlocksProps> = React.memo(({ blocks, score }) => {
  // Limit the number of blocks rendered to improve performance
  const maxVisibleBlocks = 200;
  const visibleBlocks = blocks.slice(0, maxVisibleBlocks);
  
  // Reduced character set for better performance
  const matrixSymbols = '01アイウエオカキクケコサシスセソ';
  
  // Use useMemo for getRandomMatrixSymbol to avoid recreating on each render
  const getRandomMatrixSymbol = useMemo(() => {
    return () => matrixSymbols[Math.floor(Math.random() * matrixSymbols.length)];
  }, [matrixSymbols]);
  
  return (
    <>
      {visibleBlocks.map((block, index) => {
        const blockColor = getBlockColor(score);
        const glowColor = getGlowColor(blockColor);
        const symbolSize = 16;
        const symbolsPerRow = 3;
        const symbolsPerCol = 3;
        const cellWidth = block.width / symbolsPerRow;
        const cellHeight = block.height / symbolsPerCol;
        
        return (
          <g key={`block-${index}-${block.x}-${block.y}`} filter="url(#blockGlow)">
            {/* Render the block as matrix symbols */}
            {Array.from({ length: symbolsPerRow }).map((_, rowIndex) => (
              Array.from({ length: symbolsPerCol }).map((_, colIndex) => (
                <text
                  key={`symbol-${rowIndex}-${colIndex}`}
                  x={block.x + (colIndex + 0.5) * cellWidth}
                  y={block.y + (rowIndex + 0.5) * cellHeight}
                  fill={blockColor}
                  fontSize={symbolSize}
                  fontWeight="bold"
                  fontFamily='"JetBrains Mono", monospace'
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {getRandomMatrixSymbol()}
                </text>
              ))
            ))}
          </g>
        );
      })}
    </>
  );
});

MazeBlocks.displayName = 'MazeBlocks';

export default MazeBlocks;
