// Game Analytics utility functions

/**
 * Проверяет загружен ли SDK GameAnalytics
 * @returns boolean True если SDK загружен, false в противном случае
 */
export const isGameAnalyticsLoaded = (): boolean => {
  return typeof window.gameanalytics !== 'undefined' && 
         typeof window.gameanalytics.GameAnalytics === 'function' &&
         window.gameanalytics.GameAnalytics.toString().indexOf('not loaded') === -1;
};

/**
 * Инициализирует GameAnalytics с предоставленными ключами
 * @param gameKey Ключ игры GameAnalytics
 * @param secretKey Секретный ключ GameAnalytics
 */
export const initializeGameAnalytics = (gameKey: string, secretKey: string): void => {
  try {
    // Создаем таймаут для проверки загрузки SDK
    let attempts = 0;
    const maxAttempts = 5;
    const checkInterval = 1000; // 1 секунда

    const initializeGA = () => {
      if (isGameAnalyticsLoaded()) {
        // Включить логи для отладки в режиме разработки
        if (import.meta.env.DEV) {
          window.gameanalytics.GameAnalytics("setEnabledInfoLog", true);
          window.gameanalytics.GameAnalytics("setEnabledVerboseLog", true);
        }
        
        // Инициализация SDK
        window.gameanalytics.GameAnalytics("initialize", gameKey, secretKey);
        console.log('GameAnalytics initialized successfully');
      } else {
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`GameAnalytics SDK not ready, retrying in ${checkInterval/1000}s (attempt ${attempts}/${maxAttempts})...`);
          setTimeout(initializeGA, checkInterval);
        } else {
          console.error('Failed to initialize GameAnalytics: SDK not loaded after multiple attempts');
        }
      }
    };

    // Начать попытки инициализации
    initializeGA();
  } catch (error) {
    console.error('Failed to initialize GameAnalytics:', error);
  }
};

/**
 * Track game start event
 */
export const trackGameStart = (): void => {
  try {
    if (!isGameAnalyticsLoaded()) return;
    window.gameanalytics.GameAnalytics("addDesignEvent", "Game:Start");
  } catch (error) {
    console.error('Failed to track game start:', error);
  }
};

/**
 * Track game end event with score
 * @param score The player's final score
 * @param bossDefeats Number of bosses defeated 
 */
export const trackGameEnd = (score: number, bossDefeats: number = 0): void => {
  try {
    if (!isGameAnalyticsLoaded()) return;
    window.gameanalytics.GameAnalytics("addDesignEvent", "Game:End", { score });
  } catch (error) {
    console.error('Failed to track game end:', error);
  }
};

/**
 * Track purchase events
 * @param itemId Identifier for the purchased item
 * @param price Price of the item
 * @param currency Currency code
 */
export const trackPurchase = (itemId: string, price: number, currency: string = "USD"): void => {
  try {
    if (!isGameAnalyticsLoaded()) return;
    
    // Special case for unlimited mode purchase to match exact format from the image
    if (itemId === "UnlimitedMode") {
      window.gameanalytics.GameAnalytics("addBusinessEvent", "Purchase:Unlimited", 100, "XTR");
    } else {
      window.gameanalytics.GameAnalytics("addBusinessEvent", `Purchase:${itemId}`, price, currency);
    }
  } catch (error) {
    console.error('Failed to track purchase:', error);
  }
};

/**
 * Track achievement unlocked
 * @param achievementId The achievement identifier
 */
export const trackAchievement = (achievementId: string): void => {
  try {
    if (!isGameAnalyticsLoaded()) return;
    window.gameanalytics.GameAnalytics("addDesignEvent", `Achievement:${achievementId}`);
  } catch (error) {
    console.error('Failed to track achievement:', error);
  }
};

/**
 * Track boss fight events
 * @param bossLevel Level of the boss
 * @param action Action taken (started, defeated, failed)
 */
export const trackBossFight = (bossLevel: number, action: 'started' | 'defeated' | 'failed'): void => {
  try {
    if (!isGameAnalyticsLoaded()) return;
    window.gameanalytics.GameAnalytics("addDesignEvent", `Boss:${action}`, { 
      level: bossLevel 
    });
  } catch (error) {
    console.error('Failed to track boss fight:', error);
  }
};

/**
 * Track ad view events
 * @param action Result of the ad view (started, completed, failed)
 */
export const trackAdView = (action: 'started' | 'completed' | 'failed'): void => {
  try {
    if (!isGameAnalyticsLoaded()) return;
    window.gameanalytics.GameAnalytics("addDesignEvent", `Ad:${action}`);
  } catch (error) {
    console.error('Failed to track ad view:', error);
  }
};

/**
 * Track player death events with reason
 * @param reason Reason for player death
 * @param score Score at time of death
 */
export const trackPlayerDeath = (reason: string, score: number): void => {
  try {
    if (!isGameAnalyticsLoaded()) return;
    window.gameanalytics.GameAnalytics("addDesignEvent", "Player:Death", {
      reason,
      score
    });
  } catch (error) {
    console.error('Failed to track player death:', error);
  }
};

/**
 * Track booster pickup events
 * @param boosterType Type of booster collected
 * @param gameTime Time in seconds since game start
 */
export const trackBoosterCollected = (boosterType: string, gameTime: number): void => {
  try {
    if (!isGameAnalyticsLoaded()) return;
    window.gameanalytics.GameAnalytics("addDesignEvent", "Booster:Collected", {
      type: boosterType,
      time: gameTime
    });
  } catch (error) {
    console.error('Failed to track booster collection:', error);
  }
};

/**
 * Track game session events
 * @param actionType Type of session action (start, resume, pause, end)
 * @param sessionDuration Duration of session in seconds (for end events)
 */
export const trackSession = (actionType: 'start' | 'resume' | 'pause' | 'end', sessionDuration?: number): void => {
  try {
    if (!isGameAnalyticsLoaded()) return;
    const params: {[key: string]: any} = {};
    
    if (sessionDuration && actionType === 'end') {
      params.duration = sessionDuration;
    }
    
    window.gameanalytics.GameAnalytics("addDesignEvent", `Session:${actionType}`, params);
  } catch (error) {
    console.error(`Failed to track session ${actionType}:`, error);
  }
};

/**
 * Track player progression through score milestones
 * @param milestone Score milestone reached (e.g., 1000, 5000, etc.)
 * @param timeToReach Time in seconds to reach this milestone
 */
export const trackProgressionMilestone = (milestone: number, timeToReach: number): void => {
  try {
    if (!isGameAnalyticsLoaded()) return;
    window.gameanalytics.GameAnalytics("addDesignEvent", "Progression:Milestone", {
      score: milestone,
      time: timeToReach
    });
  } catch (error) {
    console.error('Failed to track progression milestone:', error);
  }
};

/**
 * Track error events during gameplay
 * @param errorType Type of error
 * @param errorDetails Additional error details
 */
export const trackError = (errorType: string, errorDetails: string): void => {
  try {
    if (!isGameAnalyticsLoaded()) return;
    window.gameanalytics.GameAnalytics("addErrorEvent", "Error:Gameplay", {
      type: errorType,
      details: errorDetails
    });
  } catch (error) {
    console.error('Failed to track error event:', error);
  }
};

/**
 * Track player skin selection
 * @param skinId ID of the selected skin
 */
export const trackSkinSelection = (skinId: string): void => {
  try {
    if (!isGameAnalyticsLoaded()) return;
    window.gameanalytics.GameAnalytics("addDesignEvent", "Skin:Selected", {
      id: skinId
    });
  } catch (error) {
    console.error('Failed to track skin selection:', error);
  }
};
