import { Achievement, GameState, ScoreRecord } from './types';
import { getScores } from './storageUtils';
import { getDailyGameStats } from './gameLogic';
import { trackAchievement } from './analyticsUtils';

// Define achievement data
const achievementData: Achievement[] = [
  {
    id: 'first_run',
    name: 'Первый запуск',
    description: 'Запустите игру в первый раз',
    unlocked: false,
    imageSrc: '/achievements/first_run.png'
  },
  {
    id: 'reach_10k_score',
    name: '10K Взлом',
    description: 'Наберите 10,000 очков',
    unlocked: false,
    imageSrc: '/achievements/10k_score.png'
  },
  {
    id: 'reach_25k_score',
    name: '25K Взлом',
    description: 'Наберите 25,000 очков',
    unlocked: false,
    imageSrc: '/achievements/25k_score.png'
  },
  {
    id: 'reach_50k_score',
    name: '50K Взлом',
    description: 'Наберите 50,000 очков',
    unlocked: false,
    imageSrc: '/achievements/50k_score.png'
  },
  {
    id: 'reach_75k_score',
    name: '75K Взлом',
    description: 'Наберите 75,000 очков',
    unlocked: false,
    imageSrc: '/achievements/75k_score.png'
  },
  {
    id: 'reach_100k_score',
    name: '100K Взлом',
    description: 'Наберите 100,000 очков',
    unlocked: false,
    imageSrc: '/achievements/100k_score.png'
  },
  {
    id: 'collect_10_safety_keys',
    name: '10 Ключей Безопасности',
    description: 'Соберите 10 ключей безопасности',
    unlocked: false,
    imageSrc: '/achievements/10_safety_keys.png'
  },
  {
    id: 'collect_25_safety_keys',
    name: '25 Ключей Безопасности',
    description: 'Соберите 25 ключей безопасности',
    unlocked: false,
    imageSrc: '/achievements/25_safety_keys.png'
  },
  {
    id: 'collect_50_safety_keys',
    name: '50 Ключей Безопасности',
    description: 'Соберите 50 ключей безопасности',
    unlocked: false,
    imageSrc: '/achievements/50_safety_keys.png'
  },
  {
    id: 'collect_10_backdoors',
    name: '10 Бэкдоров',
    description: 'Соберите 10 бэкдоров',
    unlocked: false,
    imageSrc: '/achievements/10_backdoors.png'
  },
  {
    id: 'collect_25_backdoors',
    name: '25 Бэкдоров',
    description: 'Соберите 25 бэкдоров',
    unlocked: false,
    imageSrc: '/achievements/25_backdoors.png'
  },
  {
    id: 'collect_50_backdoors',
    name: '50 Бэкдоров',
    description: 'Соберите 50 бэкдоров',
    unlocked: false,
    imageSrc: '/achievements/50_backdoors.png'
  },
  {
    id: 'play_10_games',
    name: '10 Запусков',
    description: 'Запустите игру 10 раз',
    unlocked: false,
    imageSrc: '/achievements/10_games.png'
  },
  {
    id: 'play_25_games',
    name: '25 Запусков',
    description: 'Запустите игру 25 раз',
    unlocked: false,
    imageSrc: '/achievements/25_games.png'
  },
  {
    id: 'play_50_games',
    name: '50 Запусков',
    description: 'Запустите игру 50 раз',
    unlocked: false,
    imageSrc: '/achievements/50_games.png'
  },
  {
    id: 'defeat_1_boss',
    name: 'Первая победа над боссом',
    description: 'Победите босса 1 раз',
    unlocked: false,
    imageSrc: '/achievements/defeat_1_boss.png'
  },
  {
    id: 'defeat_3_bosses',
    name: '3 Победы над боссами',
    description: 'Победите боссов 3 раза',
    unlocked: false,
    imageSrc: '/achievements/defeat_3_bosses.png'
  },
  {
    id: 'defeat_5_bosses',
    name: '5 Побед над боссами',
    description: 'Победите боссов 5 раз',
    unlocked: false,
    imageSrc: '/achievements/defeat_5_bosses.png'
  },
  {
    id: 'defeat_all_boss_levels',
    name: 'Победа над всеми уровнями боссов',
    description: 'Победите боссов всех уровней (33k, 66k, 99k)',
    unlocked: false,
    imageSrc: '/achievements/defeat_all_boss_levels.png'
  }
];

// Function to retrieve stored achievements from localStorage
const getStoredAchievements = (): Achievement[] => {
  try {
    const storedAchievements = localStorage.getItem('netrunner_achievements');
    if (storedAchievements) {
      return JSON.parse(storedAchievements) as Achievement[];
    }
    return achievementData; // Return initial data if nothing is stored
  } catch (error) {
    console.error("Error retrieving achievements from localStorage:", error);
    return achievementData; // Return initial data in case of an error
  }
};

// Function to save achievements to localStorage
const saveAchievements = (achievements: Achievement[]): void => {
  try {
    localStorage.setItem('netrunner_achievements', JSON.stringify(achievements));
  } catch (error) {
    console.error("Error saving achievements to localStorage:", error);
  }
};

// Function to unlock an achievement
const unlockAchievement = (achievement: Achievement): Achievement => {
  if (!achievement.unlocked) {
    console.log(`Достижение разблокировано: ${achievement.name}`);
    
    // Track achievement unlock in analytics
    trackAchievement(achievement.id);
    
    return { ...achievement, unlocked: true };
  }
  return achievement;
};

// Function to update achievements based on game state
export const updateAchievements = (state: GameState): void => {
  const { score, collectedSafetyKeys, collectedBackdoors, bossDefeatsCount, highestBossLevelDefeated } = state;
  
  // Retrieve stored achievements or use initial data
  let achievements = getStoredAchievements();
  
  // Achievement unlocking logic
  achievements = achievements.map(achievement => {
    switch (achievement.id) {
      case 'first_run':
        // Check if the game has been played before by checking daily stats
        const dailyStats = getDailyGameStats();
        if (dailyStats && dailyStats.gamesPlayed > 0) {
          return unlockAchievement(achievement);
        }
        break;
      case 'reach_10k_score':
        if (score >= 10000 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'reach_25k_score':
        if (score >= 25000 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'reach_50k_score':
        if (score >= 50000 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'reach_75k_score':
        if (score >= 75000 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'reach_100k_score':
        if (score >= 100000 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'collect_10_safety_keys':
        if (collectedSafetyKeys >= 10 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'collect_25_safety_keys':
        if (collectedSafetyKeys >= 25 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'collect_50_safety_keys':
        if (collectedSafetyKeys >= 50 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'collect_10_backdoors':
        if (collectedBackdoors >= 10 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'collect_25_backdoors':
        if (collectedBackdoors >= 25 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'collect_50_backdoors':
        if (collectedBackdoors >= 50 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'play_10_games':
        const dailyStats10 = getDailyGameStats();
        if (dailyStats10 && dailyStats10.gamesPlayed >= 10) {
          return unlockAchievement(achievement);
        }
        break;
      case 'play_25_games':
        const dailyStats25 = getDailyGameStats();
        if (dailyStats25 && dailyStats25.gamesPlayed >= 25) {
          return unlockAchievement(achievement);
        }
        break;
      case 'play_50_games':
        const dailyStats50 = getDailyGameStats();
        if (dailyStats50 && dailyStats50.gamesPlayed >= 50) {
          return unlockAchievement(achievement);
        }
        break;
      case 'defeat_1_boss':
        if (bossDefeatsCount >= 1 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'defeat_3_bosses':
        if (bossDefeatsCount >= 3 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'defeat_5_bosses':
        if (bossDefeatsCount >= 5 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      case 'defeat_all_boss_levels':
        if (highestBossLevelDefeated === 3 && !achievement.unlocked) {
          return unlockAchievement(achievement);
        }
        break;
      default:
        return achievement;
    }
    return achievement;
  });
  
  // Save the updated achievements to localStorage
  saveAchievements(achievements);
};

// Function to reset achievements (for testing purposes)
export const resetAchievements = (): void => {
  try {
    localStorage.removeItem('netrunner_achievements');
    console.log('Achievements reset successfully.');
  } catch (error) {
    console.error('Error resetting achievements:', error);
  }
};

// Export function to get all achievements
export const getAllAchievements = (): Achievement[] => {
  return getStoredAchievements();
};
