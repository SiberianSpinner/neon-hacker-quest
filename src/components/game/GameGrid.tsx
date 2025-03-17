
import React from 'react';

interface GameGridProps {
  canvasWidth: number;
  canvasHeight: number;
}

const GameGrid: React.FC<GameGridProps> = ({ canvasWidth, canvasHeight }) => {
  // Generate grid lines
  const horizontalLines = [];
  const verticalLines = [];
  
  // Horizontal lines
  for (let i = 0; i < canvasHeight; i += 50) {
    horizontalLines.push(
      <line 
        key={`h-${i}`}
        x1={0}
        y1={i}
        x2={canvasWidth}
        y2={i}
        stroke="rgba(0, 255, 204, 0.1)"
        strokeWidth={1}
      />
    );
  }
  
  // Vertical lines
  for (let i = 0; i < canvasWidth; i += 50) {
    verticalLines.push(
      <line 
        key={`v-${i}`}
        x1={i}
        y1={0}
        x2={i}
        y2={canvasHeight}
        stroke="rgba(0, 255, 204, 0.1)"
        strokeWidth={1}
      />
    );
  }
  
  return (
    <g>
      {horizontalLines}
      {verticalLines}
    </g>
  );
};

export default GameGrid;
