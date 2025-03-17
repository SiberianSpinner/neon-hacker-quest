
import React from 'react';
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
        
        // Each block is now a single matrix symbol
        return (
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
        );
      })}
    </>
  );
};

export default MazeBlocks;
