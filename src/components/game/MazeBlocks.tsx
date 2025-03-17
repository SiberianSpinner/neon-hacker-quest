
import React, { useMemo } from 'react';
import { MazeBlock } from '@/utils/types';
import { getBlockColor, getGlowColor } from '@/utils/mazeUtils';

interface MazeBlocksProps {
  blocks: MazeBlock[];
  score: number;
}

const MazeBlocks: React.FC<MazeBlocksProps> = ({ blocks, score }) => {
  // Matrix symbols pool to use for blocks - reduced character set for better performance
  const matrixSymbols = '01アイウエオカキクケコサシス';
  
  // Use memoization to prevent excessive re-renders
  const renderedBlocks = useMemo(() => {
    const blockColor = getBlockColor(score);
    const glowColor = getGlowColor(blockColor);
    
    // Function to get a random matrix symbol
    const getRandomMatrixSymbol = () => {
      return matrixSymbols[Math.floor(Math.random() * matrixSymbols.length)];
    };
    
    // Limit the number of blocks rendered for better performance
    // Sort by Y position to render the most relevant blocks first
    const visibleBlocks = [...blocks]
      .sort((a, b) => a.y - b.y)
      .slice(0, 200); // Limit to 200 blocks maximum for performance
    
    return visibleBlocks.map((block, index) => (
      <g key={`block-${index}`} filter="url(#blockGlow)">
        <text
          x={block.x + block.width / 2}
          y={block.y + block.height / 2}
          fill={blockColor}
          fontSize={16}
          fontWeight="bold"
          fontFamily='"JetBrains Mono", monospace'
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {getRandomMatrixSymbol()}
        </text>
      </g>
    ));
  }, [blocks, score]);
  
  return <>{renderedBlocks}</>;
};

export default React.memo(MazeBlocks);
