
// Game Analytics utility functions

/**
 * Initializes GameAnalytics with the provided key and secret
 * @param gameKey The GameAnalytics game key
 * @param secretKey The GameAnalytics secret key
 */
export const initializeGameAnalytics = (gameKey: string, secretKey: string): void => {
  try {
    if (!window.gameanalytics) {
      console.error('GameAnalytics SDK not loaded');
      return;
    }
    
    // Enable info logs for debugging in development
    if (import.meta.env.DEV) {
      window.gameanalytics.GameAnalytics("setEnabledInfoLog", true);
    }
    
    // Initialize the SDK
    window.gameanalytics.GameAnalytics("initialize", gameKey, secretKey);
    console.log('GameAnalytics initialized successfully');
  } catch (error) {
    console.error('Failed to initialize GameAnalytics:', error);
  }
};

/**
 * Track game start event
 */
export const trackGameStart = (): void => {
  try {
    if (!window.gameanalytics) return;
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
    if (!window.gameanalytics) return;
    window.gameanalytics.GameAnalytics("addDesignEvent", "Game:End", { 
      score, 
      bossDefeats 
    });
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
    if (!window.gameanalytics) return;
    window.gameanalytics.GameAnalytics("addBusinessEvent", `Purchase:${itemId}`, price, currency);
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
    if (!window.gameanalytics) return;
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
    if (!window.gameanalytics) return;
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
    if (!window.gameanalytics) return;
    window.gameanalytics.GameAnalytics("addDesignEvent", `Ad:${action}`);
  } catch (error) {
    console.error('Failed to track ad view:', error);
  }
};
