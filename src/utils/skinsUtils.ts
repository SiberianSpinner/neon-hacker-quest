
import { PlayerSkin, PlayerSkinInfo, ScoreRecord } from './types';
import { getScores } from './storageUtils';
import { t } from './localizationUtils';

// Get all available player skins with unlock status
export const getPlayerSkins = (): PlayerSkinInfo[] => {
  const highestScore = getHighestScore();
  console.log("Current highest score:", highestScore); // Debug log
  
  return [
    {
      id: PlayerSkin.DEFAULT,
      name: t('defaultSkinName'),
      description: t('defaultSkinDescription'),
      color: "#00ffcc", // Cyber teal
      unlocked: true // Always unlocked
    },
    {
      id: PlayerSkin.PURPLE,
      name: t('purpleSkinName'),
      description: t('purpleSkinDescription'),
      color: "#b967ff", // Purple
      unlocked: highestScore >= 25000 // 25% hack completion
    },
    {
      id: PlayerSkin.RED,
      name: t('redSkinName'),
      description: t('redSkinDescription'),
      color: "#ff3e3e", // Red
      unlocked: highestScore >= 50000 // 50% hack completion
    },
    {
      id: PlayerSkin.RAINBOW,
      name: t('rainbowSkinName'),
      description: t('rainbowSkinDescription'),
      color: "rainbow", // Special rainbow effect
      unlocked: highestScore >= 75000 // 75% hack completion
    }
  ];
};

// Get the highest score achieved
export const getHighestScore = (): number => {
  try {
    const scores = getScores();
    console.log("All scores:", scores); // Debug log
    
    if (!scores || scores.length === 0) {
      console.log("No scores found");
      return 0;
    }
    
    // Extract the score values from ScoreRecord objects and find maximum
    const maxScore = Math.max(...scores.map(record => record.score));
    console.log("Maximum score found:", maxScore);
    return maxScore;
  } catch (error) {
    console.error("Error getting highest score:", error);
    return 0;
  }
};

// Get the selected skin from localStorage
export const getSelectedSkin = (): PlayerSkin => {
  try {
    const savedSkin = localStorage.getItem('netrunner_skin');
    return savedSkin ? (savedSkin as PlayerSkin) : PlayerSkin.DEFAULT;
  } catch (e) {
    return PlayerSkin.DEFAULT;
  }
};

// Save selected skin to localStorage
export const saveSelectedSkin = (skin: PlayerSkin): void => {
  try {
    localStorage.setItem('netrunner_skin', skin);
    console.log("Saved selected skin:", skin);
  } catch (e) {
    console.error('Failed to save skin preference', e);
  }
};

// Rainbow colors array for smooth transitions
const rainbowColors = [
  '#ff0000', // Red
  '#ff9900', // Orange
  '#ffff00', // Yellow
  '#00ff00', // Green
  '#00ccff', // Blue
  '#cc00ff', // Purple
  '#ff00cc', // Pink
];

// Get player color based on selected skin and game state
export const getPlayerColor = (
  skin: PlayerSkin,
  score: number = 0,
  time: number = 0
): string => {
  switch (skin) {
    case PlayerSkin.DEFAULT:
      return "#00ffcc"; // Cyber teal
    case PlayerSkin.PURPLE:
      return "#b967ff"; // Purple
    case PlayerSkin.RED:
      return "#ff3e3e"; // Red
    case PlayerSkin.RAINBOW:
      // Smooth rainbow effect - interpolate between colors based on time
      const totalDuration = 7000; // 7 seconds for full cycle
      const normalizedTime = (time % totalDuration) / totalDuration;
      const numColors = rainbowColors.length;
      const index = normalizedTime * numColors;
      const lowerIndex = Math.floor(index) % numColors;
      const upperIndex = (lowerIndex + 1) % numColors;
      const blend = index - lowerIndex;
      
      return interpolateColors(rainbowColors[lowerIndex], rainbowColors[upperIndex], blend);
    default:
      return "#00ffcc"; // Default to cyber teal
  }
};

// Helper function to interpolate between two colors
const interpolateColors = (color1: string, color2: string, ratio: number): string => {
  // Parse hex colors to RGB
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  
  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);
  
  // Interpolate RGB values
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
