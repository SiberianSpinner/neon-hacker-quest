
import { Achievement, GameState } from './types';
import { getItem, setItem } from './storageUtils';

// Constants
const ACHIEVEMENTS_STORAGE_KEY = 'netrunner_achievements';

// Initial achievement definitions
export const initialAchievements: Achievement[] = [
  {
    id: 'netrunner',
    name: 'Нетраннер',
    description: 'Успешный взлом (100%)',
    imageSrc: '/achievements/netrunner.svg',
    unlocked: false,
    unlockCondition: () => false, // Will be dynamically checked
  },
  {
    id: 'invulnerable',
    name: 'Неуязвимый',
    description: 'Собрать 10 Ключей Безопасности за одну игру',
    imageSrc: '/achievements/invulnerable.svg',
    unlocked: false,
    unlockCondition: () => false, // Will be dynamically checked
  },
];

// Create SVG icons for achievements
export const createAchievementIcons = () => {
  // Create directory if it doesn't exist
  const createSVG = (filename: string, content: string) => {
    try {
      // In a real app, we would create files on the server
      // For now, we'll use base64 data URLs for images
      return `data:image/svg+xml;base64,${btoa(content)}`;
    } catch (error) {
      console.error('Error creating SVG:', error);
      return '';
    }
  };

  // Netrunner icon - stylized "100%" with cyber elements
  const netrunnerSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill="#0a0a0a" stroke="#00ffcc" stroke-width="2"/>
    <text x="50" y="55" font-family="monospace" font-size="18" fill="#00ffcc" text-anchor="middle">100%</text>
    <path d="M25,25 L75,75" stroke="#00ffcc" stroke-width="1" opacity="0.5"/>
    <path d="M75,25 L25,75" stroke="#00ffcc" stroke-width="1" opacity="0.5"/>
    <circle cx="50" cy="50" r="30" fill="none" stroke="#00ffcc" stroke-width="1" opacity="0.3"/>
  </svg>`;

  // Invulnerable icon - shield with key
  const invulnerableSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill="#0a0a0a" stroke="#ff00ff" stroke-width="2"/>
    <path d="M50,20 L30,30 V50 C30,65 40,75 50,80 C60,75 70,65 70,50 V30 L50,20z" fill="none" stroke="#ff00ff" stroke-width="2"/>
    <text x="50" y="55" font-family="monospace" font-size="18" fill="#ff00ff" text-anchor="middle">10×</text>
    <path d="M40,45 L60,45" stroke="#ff00ff" stroke-width="1" opacity="0.5"/>
    <path d="M40,50 L60,50" stroke="#ff00ff" stroke-width="1" opacity="0.5"/>
    <path d="M40,55 L60,55" stroke="#ff00ff" stroke-width="1" opacity="0.5"/>
  </svg>`;

  return {
    netrunner: createSVG('netrunner.svg', netrunnerSVG),
    invulnerable: createSVG('invulnerable.svg', invulnerableSVG),
  };
};

// Load achievements from storage
export const loadAchievements = (): Achievement[] => {
  const storedAchievements = getItem(ACHIEVEMENTS_STORAGE_KEY);
  if (storedAchievements) {
    try {
      return JSON.parse(storedAchievements);
    } catch (e) {
      console.error('Failed to parse stored achievements:', e);
    }
  }
  return initialAchievements;
};

// Save achievements to storage
export const saveAchievements = (achievements: Achievement[]): void => {
  setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(achievements));
};

// Update achievements based on game state
export const updateAchievements = (gameState: GameState): Achievement[] => {
  const achievements = loadAchievements();
  const svgIcons = createAchievementIcons();
  
  // Track if any achievements were unlocked in this update
  let anyUnlocked = false;
  
  // Update each achievement
  const updatedAchievements = achievements.map(achievement => {
    // Set the correct image source
    achievement.imageSrc = svgIcons[achievement.id as keyof typeof svgIcons] || achievement.imageSrc;
    
    // Skip if already unlocked
    if (achievement.unlocked) {
      return achievement;
    }
    
    // Check conditions for each achievement
    switch (achievement.id) {
      case 'netrunner':
        if (gameState.gameWon) {
          achievement.unlocked = true;
          anyUnlocked = true;
        }
        break;
      case 'invulnerable':
        if (gameState.collectedSafetyKeys >= 10) {
          achievement.unlocked = true;
          anyUnlocked = true;
        }
        break;
    }
    
    return achievement;
  });
  
  // Save if any changes were made
  if (anyUnlocked) {
    saveAchievements(updatedAchievements);
  }
  
  return updatedAchievements;
};
