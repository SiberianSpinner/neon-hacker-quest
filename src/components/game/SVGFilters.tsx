
import React from 'react';

// Component to define all the SVG filters used in the game
const SVGFilters: React.FC = () => {
  return (
    <defs>
      {/* Glow filter for player */}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      {/* Glow filter for blocks */}
      <filter id="blockGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      {/* Glow filter for boosters */}
      <filter id="boosterGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      {/* Invulnerability gradient */}
      <radialGradient id="invulnerabilityGradient">
        <stop offset="10%" stopColor="rgba(0, 204, 255, 0.6)" />
        <stop offset="90%" stopColor="rgba(0, 204, 255, 0)" />
      </radialGradient>
    </defs>
  );
};

export default SVGFilters;
