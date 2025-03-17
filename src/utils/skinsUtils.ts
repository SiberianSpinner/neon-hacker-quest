
import { PlayerSkin, PlayerSkinInfo } from './types';
import { getBlockColor } from './mazeUtils';

// Get highest score from localStorage
const getHighestScore = (): number => {
  const scores = localStorage.getItem('netrunner_scores');
  if (!scores) return 0;
  
  const parsedScores = JSON.parse(scores);
  if (!parsedScores || !parsedScores.length) return 0;
  
  return Math.max(...parsedScores);
};

// Check if skin is unlocked
export const isSkinUnlocked = (skinId: PlayerSkin): boolean => {
  const highestScore = getHighestScore();
  
  switch (skinId) {
    case PlayerSkin.PURPLE:
      return highestScore >= 25000;
    case PlayerSkin.RED:
      return highestScore >= 50000;
    case PlayerSkin.RAINBOW:
      return highestScore >= 75000;
    case PlayerSkin.DEFAULT:
    default:
      return true;
  }
};

// Get player skins with unlock status
export const getPlayerSkins = (): PlayerSkinInfo[] => {
  const highestScore = getHighestScore();
  
  return [
    {
      id: PlayerSkin.DEFAULT,
      name: "Стандартный",
      description: "Стандартный цвет точки",
      color: "#00ffcc",
      unlockCondition: () => true,
      unlocked: true
    },
    {
      id: PlayerSkin.PURPLE,
      name: "Фиолетовый",
      description: "Открывается при достижении 25% взлома",
      color: "#cc00ff",
      unlockCondition: () => highestScore >= 25000,
      unlocked: highestScore >= 25000
    },
    {
      id: PlayerSkin.RED,
      name: "Красный",
      description: "Открывается при достижении 50% взлома",
      color: "#ff0000",
      unlockCondition: () => highestScore >= 50000,
      unlocked: highestScore >= 50000
    },
    {
      id: PlayerSkin.RAINBOW,
      name: "Перелив",
      description: "Открывается при достижении 75% взлома",
      color: (score: number, time: number) => {
        // Change color every second (60 frames)
        const colorPhase = Math.floor(time / 60) % 5;
        return getBlockColor(colorPhase * 5000);
      },
      unlockCondition: () => highestScore >= 75000,
      unlocked: highestScore >= 75000
    }
  ];
};

// Get selected skin from localStorage or default
export const getSelectedSkin = (): PlayerSkin => {
  const savedSkin = localStorage.getItem('netrunner_selected_skin');
  if (savedSkin && Object.values(PlayerSkin).includes(savedSkin as PlayerSkin)) {
    return savedSkin as PlayerSkin;
  }
  return PlayerSkin.DEFAULT;
};

// Save selected skin to localStorage
export const saveSelectedSkin = (skinId: PlayerSkin): void => {
  localStorage.setItem('netrunner_selected_skin', skinId);
};

// Get color for player based on selected skin
export const getPlayerColor = (selectedSkin: PlayerSkin, score: number, time: number): string => {
  const skins = getPlayerSkins();
  const skin = skins.find(s => s.id === selectedSkin);
  
  if (!skin) return "#00ffcc"; // Default color
  
  if (typeof skin.color === 'function') {
    return skin.color(score, time);
  }
  
  return skin.color;
};
