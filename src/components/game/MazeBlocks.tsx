
import React, { useRef } from 'react';
import { MazeBlock } from '@/utils/types';
import { getBlockColor, getGlowColor } from '@/utils/mazeUtils';

interface MazeBlocksProps {
  blocks: MazeBlock[];
  score: number;
}

const MazeBlocks: React.FC<MazeBlocksProps> = ({ blocks, score }) => {
  // Matrix symbols pool to use for blocks
  const matrixSymbols = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
  
  // Function to get a random matrix symbol
  const getRandomMatrixSymbol = () => {
    return matrixSymbols[Math.floor(Math.random() * matrixSymbols.length)];
  };
  
  return (
    <>
      {blocks.map((block, index) => {
        const blockColor = getBlockColor(score);
        const glowColor = getGlowColor(blockColor);
        const symbolSize = 16;
        const symbolsPerRow = 3;
        const symbolsPerCol = 3;
        const cellWidth = block.width / symbolsPerRow;
        const cellHeight = block.height / symbolsPerCol;
        
        return (
          <g key={`block-${index}`} filter="url(#blockGlow)">
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
};

export default MazeBlocks;
