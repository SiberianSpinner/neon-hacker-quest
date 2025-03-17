
import React from 'react';

// Component to define all the SVG filters used in the game
const SVGFilters: React.FC = () => {
  return (
    <defs>
      {/* Glow filter for player */}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="15" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      {/* Glow filter for blocks */}
      <filter id="blockGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      {/* Glow filter for boosters */}
      <filter id="boosterGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="15" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      {/* Invulnerability gradient */}
      <radialGradient id="invulnerabilityGradient">
        <stop offset="0%" stopColor="rgba(0, 204, 255, 0.8)" />
        <stop offset="100%" stopColor="rgba(0, 204, 255, 0)" />
      </radialGradient>
    </defs>
  );
};

export default SVGFilters;
