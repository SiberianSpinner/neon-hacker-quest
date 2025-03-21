
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

// Save score to local storage
export const saveScore = (score: number): void => {
  try {
    // Skip saving if score is too small (prevents saving test/debug runs)
    if (score < 10) {
      console.log("Score too small, not saving:", score);
      return;
    }

    // Get existing scores
    const scoresJson = localStorage.getItem('netrunner_scores') || '[]';
    let scores = JSON.parse(scoresJson);
    
    // Ensure scores is an array
    if (!Array.isArray(scores)) {
      scores = [];
    }
    
    // Add the new score
    scores.push(score);
    
    // Sort scores in descending order
    scores.sort((a: number, b: number) => b - a);
    
    // Keep only top 10 scores
    const topScores = scores.slice(0, 10);
    
    // Save scores back to localStorage
    localStorage.setItem('netrunner_scores', JSON.stringify(topScores));
    
    console.log(`Score ${score} saved, current scores:`, topScores);
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

// Get scores from local storage
export const getScores = (): number[] => {
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
    
    return scores;
  } catch (error) {
    console.error('Error loading scores:', error);
    return [];
  }
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

// Payment verification storage
export const PAYMENT_VERIFIED_KEY = 'netrunner_payment_verified';

// Check if payment has been verified
export const isPaymentVerified = (): boolean => {
  try {
    return localStorage.getItem(PAYMENT_VERIFIED_KEY) === 'true';
  } catch (error) {
    console.error('Error checking payment verification:', error);
    return false;
  }
};

// Set payment as verified
export const setPaymentVerified = (): void => {
  try {
    localStorage.setItem(PAYMENT_VERIFIED_KEY, 'true');
    console.log('Payment marked as verified');
    
    // Для большей надежности сделаем несколько дополнительных попыток сохранения
    // Иногда в TMA могут быть проблемы с localStorage
    setTimeout(() => {
      try {
        if (localStorage.getItem(PAYMENT_VERIFIED_KEY) !== 'true') {
          localStorage.setItem(PAYMENT_VERIFIED_KEY, 'true');
          console.log('Payment verification retry 1 completed');
        }
      } catch (e) {
        console.error('Error in retry 1:', e);
      }
    }, 300);
    
    setTimeout(() => {
      try {
        if (localStorage.getItem(PAYMENT_VERIFIED_KEY) !== 'true') {
          localStorage.setItem(PAYMENT_VERIFIED_KEY, 'true');
          console.log('Payment verification retry 2 completed');
        }
      } catch (e) {
        console.error('Error in retry 2:', e);
      }
    }, 1000);
  } catch (error) {
    console.error('Error setting payment verification:', error);
    // Попытка использовать альтернативный метод хранения (sessionStorage)
    try {
      sessionStorage.setItem(PAYMENT_VERIFIED_KEY, 'true');
      console.log('Payment marked as verified in sessionStorage (fallback)');
    } catch (e) {
      console.error('Error setting payment verification in sessionStorage:', e);
    }
  }
};

// Read payment verification status from multiple sources for reliability
export const readPaymentVerification = (): boolean => {
  try {
    // Проверяем localStorage
    const localStorageValue = localStorage.getItem(PAYMENT_VERIFIED_KEY);
    if (localStorageValue === 'true') {
      return true;
    }
    
    // Пробуем sessionStorage как резервный вариант
    try {
      const sessionStorageValue = sessionStorage.getItem(PAYMENT_VERIFIED_KEY);
      if (sessionStorageValue === 'true') {
        // Если нашли в sessionStorage, восстановим значение в localStorage
        localStorage.setItem(PAYMENT_VERIFIED_KEY, 'true');
        return true;
      }
    } catch (e) {
      console.error('Error reading from sessionStorage:', e);
    }
    
    return false;
  } catch (error) {
    console.error('Error reading payment verification:', error);
    return false;
  }
};

// Clear payment verification (for testing)
export const clearPaymentVerification = (): void => {
  try {
    localStorage.removeItem(PAYMENT_VERIFIED_KEY);
    // Также очищаем в sessionStorage
    try {
      sessionStorage.removeItem(PAYMENT_VERIFIED_KEY);
    } catch (e) {
      console.error('Error clearing payment verification from sessionStorage:', e);
    }
    console.log('Payment verification cleared');
  } catch (error) {
    console.error('Error clearing payment verification:', error);
  }
};
