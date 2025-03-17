
import { PlayerSkin, PlayerSkinInfo } from './types';
import { getScores } from './storageUtils';

// Get all available player skins with unlock status
export const getPlayerSkins = (): PlayerSkinInfo[] => {
  const highestScore = getHighestScore();
  console.log("Current highest score:", highestScore); // Debug log
  
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
      name: "Фиолетовый",
      description: "Доступен при взломе 25%",
      color: "#b967ff", // Purple
      unlocked: highestScore >= 25000 // 25% hack completion
    },
    {
      id: PlayerSkin.RED,
      name: "Красный",
      description: "Доступен при взломе 50%",
      color: "#ff3e3e", // Red
      unlocked: highestScore >= 50000 // 50% hack completion
    },
    {
      id: PlayerSkin.RAINBOW,
      name: "Перелив",
      description: "Доступен при взломе 75%",
      color: "rainbow", // Special rainbow effect
      unlocked: highestScore >= 75000 // 75% hack completion
    }
  ];
};

// Get the highest score achieved
export const getHighestScore = (): number => {
  const scores = getScores();
  console.log("All scores:", scores); // Debug log
  
  if (!scores || scores.length === 0) {
    console.log("No scores found");
    return 0;
  }
  
  // Find maximum score
  const maxScore = Math.max(...scores);
  console.log("Maximum score found:", maxScore);
  return maxScore;
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
      // Rainbow effect - color changes every second based on time
      const colorPhase = Math.floor(time / 1000) % 7;
      switch (colorPhase) {
        case 0: return '#ff0000'; // Red
        case 1: return '#ff9900'; // Orange
        case 2: return '#ffff00'; // Yellow
        case 3: return '#00ff00'; // Green
        case 4: return '#00ccff'; // Blue
        case 5: return '#cc00ff'; // Purple
        case 6: return '#ff00cc'; // Pink
        default: return '#00ffcc'; // Default
      }
    default:
      return "#00ffcc"; // Default to cyber teal
  }
};
