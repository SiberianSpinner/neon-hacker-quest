
import { PlayerSkin, PlayerSkinInfo } from './types';
import { getScores } from './storageUtils';

// Get all available player skins with unlock status
export const getPlayerSkins = (): PlayerSkinInfo[] => {
  const highestScore = getHighestScore();
  
  return [
    {
      id: PlayerSkin.DEFAULT,
      name: "Default",
      description: "Standard netrunner connection",
      color: "#00ffcc", // Cyber teal
      unlocked: true // Always unlocked
    },
    {
      id: PlayerSkin.PURPLE,
      name: "Violet Trace",
      description: "Unlocks at 25% hack completion",
      color: "#b967ff", // Purple
      unlocked: highestScore >= 25000 // 25% hack completion
    },
    {
      id: PlayerSkin.RED,
      name: "Red Alert",
      description: "Unlocks at 50% hack completion",
      color: "#ff3e3e", // Red
      unlocked: highestScore >= 50000 // 50% hack completion
    },
    {
      id: PlayerSkin.RAINBOW,
      name: "Quantum Shift",
      description: "Unlocks at 75% hack completion",
      color: "rainbow", // Special rainbow effect
      unlocked: highestScore >= 75000 // 75% hack completion
    }
  ];
};

// Get the highest score achieved
export const getHighestScore = (): number => {
  const scores = getScores();
  return scores.length > 0 ? Math.max(...scores) : 0;
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
  } catch (e) {
    console.error('Failed to save skin preference', e);
  }
};
