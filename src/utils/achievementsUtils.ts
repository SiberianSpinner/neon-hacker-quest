import { Achievement, GameState, ScoreRecord } from './types';
import { getScores } from './storageUtils';
import { getDailyGameStats } from './gameLogic';
import { trackAchievement } from './analyticsUtils';
import { t } from './localizationUtils';

// Define achievement data
const achievementData: Achievement[] = [
  {
    id: 'first_run',
    name: 'firstRunName',
    description: 'firstRunDescription',
    unlocked: false,
    imageSrc: '/achievements/first_run.png'
  },
  {
    id: 'reach_10k_score',
    name: 'tenPercentName',
    description: 'tenPercentDescription',
    unlocked: false,
    imageSrc: '/achievements/10k_score.png'
  },
  {
    id: 'reach_25k_score',
    name: 'twentyFivePercentName',
    description: 'twentyFivePercentDescription',
    unlocked: false,
    imageSrc: '/achievements/25k_score.png'
  },
  {
    id: 'reach_50k_score',
    name: 'fiftyPercentName',
    description: 'fiftyPercentDescription',
    unlocked: false,
    imageSrc: '/achievements/50k_score.png'
  },
  {
    id: 'reach_75k_score',
    name: 'seventyFivePercentName',
    description: 'seventyFivePercentDescription',
    unlocked: false,
    imageSrc: '/achievements/75k_score.png'
  },
  {
    id: 'reach_100k_score',
    name: 'hundredPercentName',
    description: 'hundredPercentDescription',
    unlocked: false,
    imageSrc: '/achievements/100k_score.png'
  },
  {
    id: 'collect_10_safety_keys',
    name: 'collect10KeysName',
    description: 'collect10KeysDescription',
    unlocked: false,
    imageSrc: '/achievements/10_safety_keys.png'
  },
  {
    id: 'collect_25_safety_keys',
    name: 'collect25KeysName',
    description: 'collect25KeysDescription',
    unlocked: false,
    imageSrc: '/achievements/25_safety_keys.png'
  },
  {
    id: 'collect_50_safety_keys',
    name: 'collect50KeysName',
    description: 'collect50KeysDescription',
    unlocked: false,
    imageSrc: '/achievements/50_safety_keys.png'
  },
  {
    id: 'collect_10_backdoors',
    name: 'collect10BackdoorsName',
    description: 'collect10BackdoorsDescription',
    unlocked: false,
    imageSrc: '/achievements/10_backdoors.png'
  },
  {
    id: 'collect_25_backdoors',
    name: 'collect25BackdoorsName',
    description: 'collect25BackdoorsDescription',
    unlocked: false,
    imageSrc: '/achievements/25_backdoors.png'
  },
  {
    id: 'collect_50_backdoors',
    name: 'collect50BackdoorsName',
    description: 'collect50BackdoorsDescription',
    unlocked: false,
    imageSrc: '/achievements/50_backdoors.png'
  },
  {
    id: 'play_10_games',
    name: 'play10GamesName',
    description: 'play10GamesDescription',
    unlocked: false,
    imageSrc: '/achievements/10_games.png'
  },
  {
    id: 'play_25_games',
    name: 'play25GamesName',
    description: 'play25GamesDescription',
    unlocked: false,
    imageSrc: '/achievements/25_games.png'
  },
  {
    id: 'play_50_games',
    name: 'play50GamesName',
    description: 'play50GamesDescription',
    unlocked: false,
    imageSrc: '/achievements/50_games.png'
  },
  {
    id: 'defeat_1_boss',
    name: 'defeat1BossName',
    description: 'defeat1BossDescription',
    unlocked: false,
    imageSrc: '/achievements/defeat_1_boss.png'
  },
  {
    id: 'defeat_3_bosses',
    name: 'defeat3BossesName',
    description: 'defeat3BossesDescription',
    unlocked: false,
    imageSrc: '/achievements/defeat_3_bosses.png'
  },
  {
    id: 'defeat_5_bosses',
    name: 'defeat5BossesName',
    description: 'defeat5BossesDescription',
    unlocked: false,
    imageSrc: '/achievements/defeat_5_bosses.png'
  },
  {
    id: 'defeat_all_boss_levels',
    name: 'defeatAllBossLevelsName',
    description: 'defeatAllBossLevelsDescription',
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
    console.log(`Achievement unlocked: ${achievement.name}`);
    
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
