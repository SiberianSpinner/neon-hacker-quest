
import { Achievement, GameState } from './types';
import { getItem, setItem } from './storageUtils';
import { getDailyGameStats } from './gameLogic';

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
  {
    id: 'secret_path',
    name: 'Секретный ход',
    description: 'Собрать 10 Бекдоров за одну игру',
    imageSrc: '/achievements/secret_path.svg',
    unlocked: false,
    unlockCondition: () => false, // Will be dynamically checked
  },
  {
    id: 'tireless',
    name: 'Неутомимый',
    description: 'Использовать 10 Уязвимостей за день',
    imageSrc: '/achievements/tireless.svg',
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

  // Netrunner icon - stylized hacker with "100%" symbol
  const netrunnerSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="netrunnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00ffcc" />
        <stop offset="100%" stop-color="#00ccff" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="#0a0a0a" stroke="#00ffcc" stroke-width="2"/>
    <path d="M50,25 L25,40 L25,70 L50,85 L75,70 L75,40 Z" fill="none" stroke="url(#netrunnerGrad)" stroke-width="2"/>
    <text x="50" y="55" font-family="monospace" font-size="14" fill="#00ffcc" text-anchor="middle">100%</text>
    <g opacity="0.7">
      <path d="M40,30 L60,30" stroke="#00ffcc" stroke-width="1"/>
      <path d="M30,40 L45,40" stroke="#00ffcc" stroke-width="1"/>
      <path d="M55,40 L70,40" stroke="#00ffcc" stroke-width="1"/>
      <path d="M30,60 L70,60" stroke="#00ffcc" stroke-width="1"/>
      <path d="M35,70 L65,70" stroke="#00ffcc" stroke-width="1"/>
    </g>
  </svg>`;

  // Invulnerable icon - shield with key
  const invulnerableSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="invulnerableGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ff00ff" />
        <stop offset="100%" stop-color="#cc00ff" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="#0a0a0a" stroke="#ff00ff" stroke-width="2"/>
    <path d="M50,20 L28,30 V55 C28,70 40,80 50,85 C60,80 72,70 72,55 V30 L50,20z" fill="none" stroke="url(#invulnerableGrad)" stroke-width="2"/>
    <path d="M45,50 L45,60 L40,60 L40,65 L50,65 L50,50 Z" fill="#ff00ff"/>
    <circle cx="53" cy="48" r="6" fill="none" stroke="#ff00ff" stroke-width="2"/>
    <path d="M53,54 L53,65" stroke="#ff00ff" stroke-width="2"/>
    <g opacity="0.5">
      <path d="M40,40 L60,40" stroke="#ff00ff" stroke-width="1"/>
      <path d="M60,45 L60,70" stroke="#ff00ff" stroke-width="1"/>
      <path d="M40,70 L60,70" stroke="#ff00ff" stroke-width="1"/>
    </g>
  </svg>`;
  
  // Secret Path icon - door with secret path
  const secretPathSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="secretPathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#cc00ff" />
        <stop offset="100%" stop-color="#9900ff" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="#0a0a0a" stroke="#cc00ff" stroke-width="2"/>
    <rect x="35" y="25" width="30" height="50" rx="2" fill="none" stroke="url(#secretPathGrad)" stroke-width="2"/>
    <circle cx="60" cy="50" r="3" fill="#cc00ff"/>
    <path d="M20,30 C30,40 40,20 50,30 C60,40 70,20 80,30" fill="none" stroke="#cc00ff" stroke-width="2" opacity="0.5"/>
    <path d="M20,70 C30,80 40,60 50,70 C60,80 70,60 80,70" fill="none" stroke="#cc00ff" stroke-width="2" opacity="0.5"/>
    <text x="50" y="55" font-family="monospace" font-size="6" fill="#cc00ff" text-anchor="middle">BACKDOOR</text>
  </svg>`;
  
  // Tireless icon - clock with energy symbol
  const tirelessSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="tirelessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00ccff" />
        <stop offset="100%" stop-color="#0099ff" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="#0a0a0a" stroke="#00ccff" stroke-width="2"/>
    <circle cx="50" cy="50" r="35" fill="none" stroke="url(#tirelessGrad)" stroke-width="2"/>
    <path d="M50,30 L50,50 L65,60" stroke="#00ccff" stroke-width="3" fill="none"/>
    <path d="M50,15 L50,25" stroke="#00ccff" stroke-width="2"/>
    <path d="M50,75 L50,85" stroke="#00ccff" stroke-width="2"/>
    <path d="M15,50 L25,50" stroke="#00ccff" stroke-width="2"/>
    <path d="M75,50 L85,50" stroke="#00ccff" stroke-width="2"/>
    <path d="M43,50 L57,50" stroke="#00ccff" stroke-width="2" opacity="0.7"/>
    <path d="M50,43 L50,57" stroke="#00ccff" stroke-width="2" opacity="0.7"/>
  </svg>`;

  return {
    netrunner: createSVG('netrunner.svg', netrunnerSVG),
    invulnerable: createSVG('invulnerable.svg', invulnerableSVG),
    secret_path: createSVG('secret_path.svg', secretPathSVG),
    tireless: createSVG('tireless.svg', tirelessSVG),
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
  const dailyStats = getDailyGameStats();
  
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
      case 'secret_path':
        if (gameState.collectedBackdoors >= 10) {
          achievement.unlocked = true;
          anyUnlocked = true;
        }
        break;
      case 'tireless':
        if (dailyStats.gamesPlayed >= 10) {
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
