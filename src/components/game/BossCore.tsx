
import React, { useMemo } from 'react';
import { BossCore as BossCoreType, BossCoreLine } from '@/utils/types';

interface BossCoreProps {
  bossCore: BossCoreType;
  time: number;
}

const BossCore: React.FC<BossCoreProps> = ({ bossCore, time }) => {
  const matrixSymbols = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンабвгдеёжзийклмнопрстуфхцчшщъыьэюя';
  
  const getRandomMatrixSymbol = () => {
    return matrixSymbols[Math.floor(Math.random() * matrixSymbols.length)];
  };
  
  // Core colors
  const standardColor = '#ff0000'; // Red for regular state
  const vulnerableColor = '#00ff00'; // Green for vulnerable state
  
  // Update symbols every second for animation effect
  const symbolKey = Math.floor(time / 1000);
  
  // Render the boss lines
  const renderLines = (lines: BossCoreLine[]) => {
    const symbolSize = 16;
    
    return lines.map((line, lineIndex) => {
      if (line.destroyed) return null;
      
      const color = line.isVulnerable ? vulnerableColor : standardColor;
      
      return (
        <g key={`line-${lineIndex}`}>
          {line.points.map((point, pointIndex) => {
            if (pointIndex < line.points.length - 1) {
              const [x1, y1] = point;
              const [x2, y2] = line.points[pointIndex + 1];
              
              const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
              const symbolsCount = Math.max(1, Math.floor(distance / 15));
              
              return Array.from({ length: symbolsCount }).map((_, symbolIndex) => {
                const t = symbolIndex / (symbolsCount - 1 || 1);
                const symbolX = x1 + (x2 - x1) * t;
                const symbolY = y1 + (y2 - y1) * t;
                
                const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
                
                return (
                  <text
                    key={`symbol-${pointIndex}-${symbolIndex}-${symbolKey}`}
                    x={symbolX}
                    y={symbolY}
                    fill={color}
                    fontSize={symbolSize}
                    fontWeight="bold"
                    fontFamily='"JetBrains Mono", monospace'
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${angle}, ${symbolX}, ${symbolY})`}
                    filter="url(#glow)"
                  >
                    {getRandomMatrixSymbol()}
                  </text>
                );
              });
            }
            return null;
          })}
        </g>
      );
    });
  };
  
  // Render memory core center (white matrix symbols)
  const renderMemoryCore = () => {
    const coreSize = 30;
    const symbolSize = 16;
    const symbolsPerRow = 3;
    const symbolsPerCol = 3;
    
    return (
      <g>
        {Array.from({ length: symbolsPerRow * symbolsPerCol }).map((_, index) => {
          const row = Math.floor(index / symbolsPerRow);
          const col = index % symbolsPerRow;
          
          const x = bossCore.x + (col - 1) * symbolSize;
          const y = bossCore.y + (row - 1) * symbolSize;
          
          return (
            <text
              key={`core-symbol-${index}-${symbolKey}`}
              x={x}
              y={y}
              fill="#ffffff"
              fontSize={symbolSize}
              fontWeight="bold"
              fontFamily='"JetBrains Mono", monospace'
              textAnchor="middle"
              dominantBaseline="middle"
              filter="url(#glow)"
            >
              {getRandomMatrixSymbol()}
            </text>
          );
        })}
      </g>
    );
  };
  
  if (!bossCore.active) return null;
  
  return (
    <g>
      {/* Outer square lines */}
      <g transform={`rotate(${bossCore.outerRotationAngle}, ${bossCore.x}, ${bossCore.y})`}>
        {renderLines(bossCore.outerLines)}
      </g>
      
      {/* Inner square lines */}
      <g transform={`rotate(${bossCore.innerRotationAngle}, ${bossCore.x}, ${bossCore.y})`}>
        {renderLines(bossCore.innerLines)}
      </g>
      
      {/* Memory core center */}
      {renderMemoryCore()}
    </g>
  );
};

export default BossCore;
