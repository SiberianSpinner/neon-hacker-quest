// Generic storage utility functions
export const getItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error getting item from storage:', error);
    return null;
  }
};

export const setItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error saving item to storage:', error);
  }
};

// Interface for score records
interface ScoreRecord {
  score: number;
  username?: string;
  userId?: string;
}

// Save score to local storage - Modified to store player info
export const saveScore = (score: number, username?: string, userId?: string): void => {
  try {
    // Skip saving if score is too small (prevents saving test/debug runs)
    if (score < 10) {
      console.log("Score too small, not saving:", score);
      return;
    }

    // Get existing scores
    const scoresJson = localStorage.getItem('netrunner_scores') || '[]';
    let scores: ScoreRecord[] = JSON.parse(scoresJson);
    
    // Ensure scores is an array
    if (!Array.isArray(scores)) {
      scores = [];
    }
    
    // Add the new score with username
    scores.push({ 
      score, 
      username: username || 'Anonymous Runner', 
      userId 
    });
    
    // Sort scores in descending order by score
    scores.sort((a: ScoreRecord, b: ScoreRecord) => b.score - a.score);
    
    // Keep only top 100 scores
    const topScores = scores.slice(0, 100);
    
    // Save scores back to localStorage
    localStorage.setItem('netrunner_scores', JSON.stringify(topScores));
    
    console.log(`Score ${score} saved for ${username || 'Anonymous'}, current top scores count: ${topScores.length}`);
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

// Get scores from local storage
export const getScores = (): ScoreRecord[] => {
  try {
    const scoresJson = localStorage.getItem('netrunner_scores');
    
    // Handle case when no scores exist yet
    if (!scoresJson) {
      console.log('No scores found in storage');
      return [];
    }
    
    const scores = JSON.parse(scoresJson);
    
    // Validate that scores is an array
    if (!Array.isArray(scores)) {
      console.warn('Invalid scores format in storage, returning empty array');
      return [];
    }
    
    // Convert legacy scores (numbers only) to ScoreRecord format
    const formattedScores = scores.map((item: number | ScoreRecord) => {
      if (typeof item === 'number') {
        return { score: item, username: 'Anonymous Runner' };
      }
      // Ensure username exists
      if (!item.username) {
        item.username = 'Anonymous Runner';
      }
      return item;
    });
    
    return formattedScores.slice(0, 100); // Ensure we return at most 100 scores
  } catch (error) {
    console.error('Error loading scores:', error);
    return [];
  }
};

// Get current user's highest score (for highlighting in leaderboard)
export const getCurrentUserScore = (userId?: string): ScoreRecord | null => {
  if (!userId) return null;
  
  try {
    const scores = getScores();
    const userScores = scores.filter(record => record.userId === userId);
    
    if (userScores.length === 0) return null;
    
    // Return the highest score for this user
    return userScores.sort((a, b) => b.score - a.score)[0];
  } catch (error) {
    console.error('Error getting current user score:', error);
    return null;
  }
};

// Format score as percentage with 3 decimal places
export const formatScoreAsPercentage = (score: number): string => {
  const percentage = score / 1000;
  return percentage.toFixed(3) + '%';
};

// For debugging: clear all scores
export const clearAllScores = (): void => {
  try {
    localStorage.removeItem('netrunner_scores');
    console.log('All scores cleared from storage');
  } catch (error) {
    console.error('Error clearing scores:', error);
  }
};

// For debugging: set a specific high score
export const setTestHighScore = (score: number): void => {
  try {
    const scores = [score];
    localStorage.setItem('netrunner_scores', JSON.stringify(scores));
    console.log(`Test high score set to: ${score}`);
  } catch (error) {
    console.error('Error setting test score:', error);
  }
};

// Payment verification storage - changed to be recognized across browser refreshes
export const PAYMENT_VERIFIED_KEY = 'netrunner_payment_verified';

// Check if payment has been verified - now uses multiple sources for reliability
export const isPaymentVerified = (): boolean => {
  try {
    // Check in localStorage first
    const localStorageValue = localStorage.getItem(PAYMENT_VERIFIED_KEY);
    if (localStorageValue === 'true') {
      console.log('Payment verified: found in localStorage');
      return true;
    }
    
    // Check in sessionStorage as fallback
    try {
      const sessionStorageValue = sessionStorage.getItem(PAYMENT_VERIFIED_KEY);
      if (sessionStorageValue === 'true') {
        console.log('Payment verified: found in sessionStorage');
        // Sync to localStorage for future checks
        try {
          localStorage.setItem(PAYMENT_VERIFIED_KEY, 'true');
        } catch (e) {
          console.error('Error syncing payment verification to localStorage:', e);
        }
        return true;
      }
    } catch (e) {
      console.error('Error checking payment verification in sessionStorage:', e);
    }
    
    // Also check if unlimited attempts are already enabled (indirect verification)
    try {
      const unlimitedKey = 'netrunner_unlimited_attempts';
      if (localStorage.getItem(unlimitedKey) === 'true' || 
          sessionStorage.getItem(unlimitedKey) === 'true') {
        console.log('Payment verified: unlimited attempts already enabled');
        // Sync verification status to storage
        try {
          localStorage.setItem(PAYMENT_VERIFIED_KEY, 'true');
          sessionStorage.setItem(PAYMENT_VERIFIED_KEY, 'true');
        } catch (e) {
          console.error('Error syncing payment verification from unlimited status:', e);
        }
        return true;
      }
    } catch (e) {
      console.error('Error checking unlimited attempts status:', e);
    }
    
    console.log('Payment verification not found in any storage');
    return false;
  } catch (error) {
    console.error('Error checking payment verification:', error);
    return false;
  }
};

// Set payment as verified with multiple redundant approaches
export const setPaymentVerified = (): void => {
  console.log('Setting payment as verified - start');
  
  // Array to track success of each storage method
  const storageResults: Record<string, boolean | string> = {
    localStorage: false,
    sessionStorage: false,
    localStorageRetry1: false,
    localStorageRetry2: false,
    cookieStorage: false
  };
  
  // Function to log verification status
  const logVerificationStatus = () => {
    console.log('Payment verification status:', storageResults);
  };
  
  // Try localStorage
  try {
    localStorage.setItem(PAYMENT_VERIFIED_KEY, 'true');
    storageResults.localStorage = true;
    console.log('Payment marked as verified in localStorage');
  } catch (error) {
    console.error('Error setting payment verification in localStorage:', error);
  }
  
  // Try sessionStorage as fallback
  try {
    sessionStorage.setItem(PAYMENT_VERIFIED_KEY, 'true');
    storageResults.sessionStorage = true;
    console.log('Payment marked as verified in sessionStorage');
  } catch (error) {
    console.error('Error setting payment verification in sessionStorage:', error);
  }
  
  // Try to set a cookie as another fallback
  try {
    document.cookie = `${PAYMENT_VERIFIED_KEY}=true; max-age=31536000; path=/`;
    storageResults.cookieStorage = true;
    console.log('Payment marked as verified in cookie');
  } catch (error) {
    console.error('Error setting payment verification in cookie:', error);
  }
  
  // First retry for localStorage after short delay
  setTimeout(() => {
    try {
      if (localStorage.getItem(PAYMENT_VERIFIED_KEY) !== 'true') {
        localStorage.setItem(PAYMENT_VERIFIED_KEY, 'true');
        storageResults.localStorageRetry1 = true;
        console.log('Payment verification localStorage retry 1 completed');
      } else {
        storageResults.localStorageRetry1 = 'already-set';
      }
      logVerificationStatus();
    } catch (error) {
      console.error('Error in payment verification localStorage retry 1:', error);
    }
  }, 300);
  
  // Second retry for localStorage after longer delay
  setTimeout(() => {
    try {
      if (localStorage.getItem(PAYMENT_VERIFIED_KEY) !== 'true') {
        localStorage.setItem(PAYMENT_VERIFIED_KEY, 'true');
        storageResults.localStorageRetry2 = true;
        console.log('Payment verification localStorage retry 2 completed');
      } else {
        storageResults.localStorageRetry2 = 'already-set';
      }
      logVerificationStatus();
      
      // Final verification check
      const verified = isPaymentVerified();
      console.log('Final payment verification check:', verified);
    } catch (error) {
      console.error('Error in payment verification localStorage retry 2:', error);
    }
  }, 1000);
  
  // Check for success
  const initialVerification = storageResults.localStorage || storageResults.sessionStorage || storageResults.cookieStorage;
  console.log('Initial payment verification success:', initialVerification);
};

// Read payment verification status from multiple sources
export const readPaymentVerification = (): boolean => {
  return isPaymentVerified();
};

// Clear payment verification (for testing)
export const clearPaymentVerification = (): void => {
  try {
    localStorage.removeItem(PAYMENT_VERIFIED_KEY);
    console.log('Payment verification cleared from localStorage');
    
    try {
      sessionStorage.removeItem(PAYMENT_VERIFIED_KEY);
      console.log('Payment verification cleared from sessionStorage');
    } catch (e) {
      console.error('Error clearing payment verification from sessionStorage:', e);
    }
    
    try {
      document.cookie = `${PAYMENT_VERIFIED_KEY}=; max-age=0; path=/`;
      console.log('Payment verification cleared from cookie');
    } catch (e) {
      console.error('Error clearing payment verification from cookie:', e);
    }
  } catch (error) {
    console.error('Error clearing payment verification:', error);
  }
};
