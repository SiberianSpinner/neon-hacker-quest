
import { Achievement, GameState } from './types';
import { getScores } from './storageUtils';
import { getDailyGameStats } from './gameLogic';

// Define all achievements with Russian translations
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_run',
    name: 'Первая Загрузка',
    description: 'Начните свою первую попытку взлома',
    unlocked: false,
    imageSrc: '/achievements/first-boot.svg',
  },
  {
    id: 'reach_10percent',
    name: '10% Доступа',
    description: 'Достигните 10% завершения взлома',
    unlocked: false,
    imageSrc: '/achievements/ten-percent.svg',
  },
  {
    id: 'reach_25percent',
    name: '25% Доступа',
    description: 'Достигните 25% завершения взлома',
    unlocked: false,
    imageSrc: '/achievements/twenty-five-percent.svg',
  },
  {
    id: 'reach_50percent',
    name: '50% Доступа',
    description: 'Достигните 50% завершения взлома',
    unlocked: false,
    imageSrc: '/achievements/fifty-percent.svg',
  },
  {
    id: 'reach_75percent',
    name: '75% Доступа',
    description: 'Достигните 75% завершения взлома',
    unlocked: false,
    imageSrc: '/achievements/seventy-five-percent.svg',
  },
  {
    id: 'reach_100percent',
    name: '100% Доступа',
    description: 'Завершите взлом на 100%',
    unlocked: false,
    imageSrc: '/achievements/hundred-percent.svg',
  },
  {
    id: 'collect_key',
    name: 'Обход Защиты',
    description: 'Соберите свой первый Ключ Безопасности',
    unlocked: false,
    imageSrc: '/achievements/security-bypass.svg',
  },
  {
    id: 'collect_backdoor',
    name: 'Бэкдор Найден',
    description: 'Соберите свой первый Бэкдор',
    unlocked: false,
    imageSrc: '/achievements/backdoor.svg',
  },
  {
    id: 'play_3_times',
    name: 'Настойчивость',
    description: 'Сыграйте в игру 3 раза за один день',
    unlocked: false,
    imageSrc: '/achievements/persistence.svg',
  },
  {
    id: 'play_10_times',
    name: 'Целеустремленность',
    description: 'Сыграйте в игру 10 раз за один день',
    unlocked: false,
    imageSrc: '/achievements/determination.svg',
  },
  // Memory core related achievements
  {
    id: 'defeat_first_core',
    name: 'Взломщик Памяти',
    description: 'Уничтожьте своё первое Ядро Памяти',
    unlocked: false,
    imageSrc: '/achievements/memory-crasher.svg',
  },
  {
    id: 'defeat_level2_core',
    name: 'Разрушитель Данных',
    description: 'Уничтожьте Ядро Памяти 2-го уровня',
    unlocked: false,
    imageSrc: '/achievements/data-corruptor.svg',
  },
  {
    id: 'defeat_level3_core',
    name: 'Системный Аннигилятор',
    description: 'Уничтожьте Ядро Памяти 3-го уровня',
    unlocked: false,
    imageSrc: '/achievements/system-annihilator.svg',
  }
];

// Load achievements from localStorage, merging with defaults
export const loadAchievements = (): Achievement[] => {
  try {
    const savedAchievements = localStorage.getItem('netrunner_achievements');
    const parsed: Achievement[] = savedAchievements ? JSON.parse(savedAchievements) : [];
    
    // Create a map of saved achievements for quick lookup
    const savedMap = new Map(parsed.map((a: Achievement) => [a.id, a]));
    
    // Merge with default achievements
    return ACHIEVEMENTS.map(defaultAchievement => {
      const savedAchievement = savedMap.get(defaultAchievement.id);
      return savedAchievement ? {
        ...defaultAchievement,
        unlocked: Boolean(savedAchievement.unlocked)
      } : defaultAchievement;
    });
  } catch (e) {
    console.error('Ошибка загрузки достижений', e);
    return [...ACHIEVEMENTS];
  }
};

// Save achievements to localStorage
const saveAchievements = (achievements: Achievement[]): void => {
  try {
    localStorage.setItem('netrunner_achievements', JSON.stringify(achievements));
    console.log('Достижения сохранены:', achievements);
  } catch (e) {
    console.error('Ошибка сохранения достижений', e);
  }
};

// Check if specific achievement is unlocked
export const isAchievementUnlocked = (id: string): boolean => {
  const achievements = loadAchievements();
  const achievement = achievements.find(a => a.id === id);
  return achievement ? achievement.unlocked : false;
};

// Update achievements based on game state and current score
export const updateAchievements = (state: GameState): void => {
  console.log('Обновление достижений с состоянием:', state);
  const achievements = loadAchievements();
  let updated = false;
  
  // First run achievement - unlocks as soon as the game is played
  if (!isAchievementUnlocked('first_run')) {
    const achievementIndex = achievements.findIndex(a => a.id === 'first_run');
    if (achievementIndex !== -1) {
      achievements[achievementIndex].unlocked = true;
      updated = true;
      console.log('Достижение разблокировано: Первая Загрузка');
    }
  }
  
  // Check current score for percentage-based achievements
  const currentScore = state.score;
  
  // 10% completion (10,000 points)
  if (!isAchievementUnlocked('reach_10percent') && currentScore >= 10000) {
    const achievementIndex = achievements.findIndex(a => a.id === 'reach_10percent');
    if (achievementIndex !== -1) {
      achievements[achievementIndex].unlocked = true;
      updated = true;
      console.log('Достижение разблокировано: 10% Доступа');
    }
  }
  
  // 25% completion (25,000 points)
  if (!isAchievementUnlocked('reach_25percent') && currentScore >= 25000) {
    const achievementIndex = achievements.findIndex(a => a.id === 'reach_25percent');
    if (achievementIndex !== -1) {
      achievements[achievementIndex].unlocked = true;
      updated = true;
      console.log('Достижение разблокировано: 25% Доступа');
    }
  }
  
  // 50% completion (50,000 points)
  if (!isAchievementUnlocked('reach_50percent') && currentScore >= 50000) {
    const achievementIndex = achievements.findIndex(a => a.id === 'reach_50percent');
    if (achievementIndex !== -1) {
      achievements[achievementIndex].unlocked = true;
      updated = true;
      console.log('Достижение разблокировано: 50% Доступа');
    }
  }
  
  // 75% completion (75,000 points)
  if (!isAchievementUnlocked('reach_75percent') && currentScore >= 75000) {
    const achievementIndex = achievements.findIndex(a => a.id === 'reach_75percent');
    if (achievementIndex !== -1) {
      achievements[achievementIndex].unlocked = true;
      updated = true;
      console.log('Достижение разблокировано: 75% Доступа');
    }
  }
  
  // 100% completion (100,000 points)
  if (!isAchievementUnlocked('reach_100percent') && currentScore >= 100000) {
    const achievementIndex = achievements.findIndex(a => a.id === 'reach_100percent');
    if (achievementIndex !== -1) {
      achievements[achievementIndex].unlocked = true;
      updated = true;
      console.log('Достижение разблокировано: 100% Доступа');
    }
  }
  
  // Collected Safety Key - check the state directly
  if (!isAchievementUnlocked('collect_key') && state.collectedSafetyKeys > 0) {
    const achievementIndex = achievements.findIndex(a => a.id === 'collect_key');
    if (achievementIndex !== -1) {
      achievements[achievementIndex].unlocked = true;
      updated = true;
      console.log('Достижение разблокировано: Обход Защиты');
    }
  }
  
  // Collected Backdoor - check the state directly
  if (!isAchievementUnlocked('collect_backdoor') && state.collectedBackdoors > 0) {
    const achievementIndex = achievements.findIndex(a => a.id === 'collect_backdoor');
    if (achievementIndex !== -1) {
      achievements[achievementIndex].unlocked = true;
      updated = true;
      console.log('Достижение разблокировано: Бэкдор Найден');
    }
  }
  
  // Daily games played - check for play count achievements
  const dailyStats = getDailyGameStats();
  console.log('Статистика дня для достижений:', dailyStats);
  
  // 3 games in a day
  if (!isAchievementUnlocked('play_3_times') && dailyStats.gamesPlayed >= 3) {
    const achievementIndex = achievements.findIndex(a => a.id === 'play_3_times');
    if (achievementIndex !== -1) {
      achievements[achievementIndex].unlocked = true;
      updated = true;
      console.log('Достижение разблокировано: Настойчивость');
    }
  }
  
  // 10 games in a day
  if (!isAchievementUnlocked('play_10_times') && dailyStats.gamesPlayed >= 10) {
    const achievementIndex = achievements.findIndex(a => a.id === 'play_10_times');
    if (achievementIndex !== -1) {
      achievements[achievementIndex].unlocked = true;
      updated = true;
      console.log('Достижение разблокировано: Целеустремленность');
    }
  }

  // Memory Core achievements - track boss defeats by level
  // First Memory Core defeat
  if (!isAchievementUnlocked('defeat_first_core') && state.bossDefeatsCount > 0) {
    const achievementIndex = achievements.findIndex(a => a.id === 'defeat_first_core');
    if (achievementIndex !== -1) {
      achievements[achievementIndex].unlocked = true;
      updated = true;
      console.log('Достижение разблокировано: Взломщик Памяти');
    }
  }
  
  // Level 2 Memory Core defeat (needs to have defeated a level 2 boss)
  if (!isAchievementUnlocked('defeat_level2_core') && state.highestBossLevelDefeated >= 2) {
    const achievementIndex = achievements.findIndex(a => a.id === 'defeat_level2_core');
    if (achievementIndex !== -1) {
      achievements[achievementIndex].unlocked = true;
      updated = true;
      console.log('Достижение разблокировано: Разрушитель Данных');
    }
  }
  
  // Level 3 Memory Core defeat (needs to have defeated a level 3 boss)
  if (!isAchievementUnlocked('defeat_level3_core') && state.highestBossLevelDefeated >= 3) {
    const achievementIndex = achievements.findIndex(a => a.id === 'defeat_level3_core');
    if (achievementIndex !== -1) {
      achievements[achievementIndex].unlocked = true;
      updated = true;
      console.log('Достижение разблокировано: Системный Аннигилятор');
    }
  }
  
  // Save if any achievements were updated
  if (updated) {
    saveAchievements(achievements);
  }
};

// Get the highest score achieved
export const getHighestScore = (): number => {
  const scores = getScores();
  return scores.length > 0 ? Math.max(...scores) : 0;
};
