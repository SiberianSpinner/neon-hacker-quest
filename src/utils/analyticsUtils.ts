
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

/**
 * Track player death events with reason
 * @param reason Reason for player death
 * @param score Score at time of death
 */
export const trackPlayerDeath = (reason: string, score: number): void => {
  try {
    if (!window.gameanalytics) return;
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
    if (!window.gameanalytics) return;
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
    if (!window.gameanalytics) return;
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
    if (!window.gameanalytics) return;
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
    if (!window.gameanalytics) return;
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
    if (!window.gameanalytics) return;
    window.gameanalytics.GameAnalytics("addDesignEvent", "Skin:Selected", {
      id: skinId
    });
  } catch (error) {
    console.error('Failed to track skin selection:', error);
  }
};
