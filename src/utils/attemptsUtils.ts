
// Daily attempts management

// Key for storing daily attempts and unlimited status
const DAILY_ATTEMPTS_KEY = 'netrunner_daily_attempts';
const UNLIMITED_ATTEMPTS_KEY = 'netrunner_unlimited_attempts';

// Daily attempts interface
interface DailyAttemptsData {
  date: string;     // Current date in YYYY-MM-DD format
  attemptsUsed: number;  // Number of attempts used today
  lastReset: string; // Timestamp of last reset
}

// Get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Get tomorrow's date with time set to 00:01
const getTomorrowResetTime = (): Date => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 1, 0, 0); // 00:01:00
  return tomorrow;
};

// Get milliseconds until next reset
export const getMillisecondsUntilReset = (): number => {
  const now = new Date();
  const resetTime = getTomorrowResetTime();
  return Math.max(0, resetTime.getTime() - now.getTime());
};

// Format milliseconds as mm:ss
export const formatTimeRemaining = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Get daily attempts data from storage
const getDailyAttemptsData = (): DailyAttemptsData => {
  try {
    const data = localStorage.getItem(DAILY_ATTEMPTS_KEY);
    if (!data) {
      return {
        date: getTodayDate(),
        attemptsUsed: 0,
        lastReset: new Date().toISOString()
      };
    }
    
    return JSON.parse(data) as DailyAttemptsData;
  } catch (error) {
    console.error('Error getting daily attempts data:', error);
    return {
      date: getTodayDate(),
      attemptsUsed: 0,
      lastReset: new Date().toISOString()
    };
  }
};

// Save daily attempts data to storage
const saveDailyAttemptsData = (data: DailyAttemptsData): void => {
  try {
    localStorage.setItem(DAILY_ATTEMPTS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving daily attempts data:', error);
  }
};

// Check if we need to reset daily attempts
const checkAndResetDailyAttempts = (): void => {
  // First check if unlimited attempts are enabled - if so, no need to reset
  if (hasUnlimitedAttempts()) {
    return;
  }
  
  const data = getDailyAttemptsData();
  const today = getTodayDate();
  
  // If it's a new day, reset attempts
  if (data.date !== today) {
    const now = new Date();
    // Check if it's past 00:01
    if (now.getHours() >= 0 && now.getMinutes() >= 1) {
      saveDailyAttemptsData({
        date: today,
        attemptsUsed: 0,
        lastReset: now.toISOString()
      });
      console.log('Daily attempts reset at', now.toISOString());
    }
  }
};

// Get remaining daily attempts
export const getRemainingDailyAttempts = (): number => {
  // If unlimited mode is enabled, return Infinity
  if (hasUnlimitedAttempts()) {
    return Infinity;
  }
  
  // First check if we need to reset
  checkAndResetDailyAttempts();
  
  const data = getDailyAttemptsData();
  const MAX_DAILY_ATTEMPTS = 3;
  return Math.max(0, MAX_DAILY_ATTEMPTS - data.attemptsUsed);
};

// Use an attempt
export const useAttempt = (): { success: boolean, remainingAttempts: number } => {
  // If unlimited mode is enabled, always return success and Infinity
  if (hasUnlimitedAttempts()) {
    return { success: true, remainingAttempts: Infinity };
  }
  
  // First check if we need to reset
  checkAndResetDailyAttempts();
  
  const data = getDailyAttemptsData();
  const MAX_DAILY_ATTEMPTS = 3;
  
  if (data.attemptsUsed >= MAX_DAILY_ATTEMPTS) {
    return { success: false, remainingAttempts: 0 };
  }
  
  // Increment attempts used
  data.attemptsUsed += 1;
  saveDailyAttemptsData(data);
  
  return { 
    success: true, 
    remainingAttempts: MAX_DAILY_ATTEMPTS - data.attemptsUsed 
  };
};

// For admin/debug purposes: reset daily attempts
export const resetDailyAttempts = (): void => {
  saveDailyAttemptsData({
    date: getTodayDate(),
    attemptsUsed: 0,
    lastReset: new Date().toISOString()
  });
  console.log('Daily attempts manually reset');
};

// Get next reset time
export const getNextResetTime = (): Date => {
  return getTomorrowResetTime();
};

// Check for unlimited attempts cookie
const checkUnlimitedCookie = (): boolean => {
  try {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${UNLIMITED_ATTEMPTS_KEY}=`)) {
        return cookie.substring(UNLIMITED_ATTEMPTS_KEY.length + 1) === 'true';
      }
    }
    return false;
  } catch (e) {
    console.error('Error checking unlimited attempts cookie:', e);
    return false;
  }
};

// Check if unlimited attempts are enabled - now with improved reliability
export const hasUnlimitedAttempts = (): boolean => {
  console.log('Checking for unlimited attempts...');
  
  try {
    // Check in localStorage
    if (localStorage.getItem(UNLIMITED_ATTEMPTS_KEY) === 'true') {
      console.log('Unlimited attempts enabled: found in localStorage');
      return true;
    }
    
    // Check in sessionStorage as fallback
    try {
      if (sessionStorage.getItem(UNLIMITED_ATTEMPTS_KEY) === 'true') {
        console.log('Unlimited attempts enabled: found in sessionStorage');
        // Sync to localStorage for future checks
        try {
          localStorage.setItem(UNLIMITED_ATTEMPTS_KEY, 'true');
        } catch (e) {
          console.error('Error syncing unlimited status to localStorage:', e);
        }
        return true;
      }
    } catch (e) {
      console.error('Error checking unlimited status in sessionStorage:', e);
    }
    
    // Check in cookies as another fallback
    if (checkUnlimitedCookie()) {
      console.log('Unlimited attempts enabled: found in cookie');
      // Sync to other storage methods
      try {
        localStorage.setItem(UNLIMITED_ATTEMPTS_KEY, 'true');
        sessionStorage.setItem(UNLIMITED_ATTEMPTS_KEY, 'true');
      } catch (e) {
        console.error('Error syncing unlimited status from cookie:', e);
      }
      return true;
    }
    
    // Check payment verification as an indirect indicator
    try {
      const PAYMENT_VERIFIED_KEY = 'netrunner_payment_verified';
      if (localStorage.getItem(PAYMENT_VERIFIED_KEY) === 'true' || 
          sessionStorage.getItem(PAYMENT_VERIFIED_KEY) === 'true') {
        console.log('Unlimited attempts should be enabled: payment was verified');
        // Enable unlimited attempts since payment was verified
        enableUnlimitedAttempts();
        return true;
      }
      
      // Check for payment verification in cookies
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(`${PAYMENT_VERIFIED_KEY}=true`)) {
          console.log('Unlimited attempts should be enabled: payment verified in cookie');
          enableUnlimitedAttempts();
          return true;
        }
      }
    } catch (e) {
      console.error('Error checking payment verification status:', e);
    }
    
    console.log('Unlimited attempts not enabled in any storage');
    return false;
    
  } catch (error) {
    console.error('Error checking unlimited attempts status:', error);
    
    // Try fallback methods if primary check fails
    try {
      // Check sessionStorage
      if (sessionStorage.getItem(UNLIMITED_ATTEMPTS_KEY) === 'true') {
        return true;
      }
      
      // Check cookies
      return checkUnlimitedCookie();
    } catch (e) {
      console.error('Error in fallback unlimited attempts check:', e);
      return false;
    }
  }
};

// Enable unlimited attempts with improved reliability
export const enableUnlimitedAttempts = (): void => {
  console.log('Enabling unlimited attempts - start');
  
  // Array to track success of each storage method
  const storageResults = {
    localStorage: false,
    sessionStorage: false,
    cookieStorage: false,
    localStorageRetry1: false,
    localStorageRetry2: false
  };
  
  // Function to log status
  const logStatus = () => {
    console.log('Unlimited attempts status:', storageResults);
  };
  
  // Try localStorage
  try {
    localStorage.setItem(UNLIMITED_ATTEMPTS_KEY, 'true');
    storageResults.localStorage = true;
    console.log('Unlimited attempts enabled in localStorage');
  } catch (error) {
    console.error('Error enabling unlimited attempts in localStorage:', error);
  }
  
  // Try sessionStorage
  try {
    sessionStorage.setItem(UNLIMITED_ATTEMPTS_KEY, 'true');
    storageResults.sessionStorage = true;
    console.log('Unlimited attempts enabled in sessionStorage');
  } catch (error) {
    console.error('Error enabling unlimited attempts in sessionStorage:', error);
  }
  
  // Try cookie storage
  try {
    document.cookie = `${UNLIMITED_ATTEMPTS_KEY}=true; max-age=31536000; path=/`;
    storageResults.cookieStorage = true;
    console.log('Unlimited attempts enabled in cookie');
  } catch (error) {
    console.error('Error enabling unlimited attempts in cookie:', error);
  }
  
  // First retry for localStorage
  setTimeout(() => {
    try {
      if (localStorage.getItem(UNLIMITED_ATTEMPTS_KEY) !== 'true') {
        localStorage.setItem(UNLIMITED_ATTEMPTS_KEY, 'true');
        storageResults.localStorageRetry1 = true;
        console.log('Unlimited attempts localStorage retry 1 completed');
      } else {
        storageResults.localStorageRetry1 = 'already-set';
      }
      logStatus();
    } catch (e) {
      console.error('Error in unlimited attempts localStorage retry 1:', e);
    }
  }, 300);
  
  // Second retry for localStorage
  setTimeout(() => {
    try {
      if (localStorage.getItem(UNLIMITED_ATTEMPTS_KEY) !== 'true') {
        localStorage.setItem(UNLIMITED_ATTEMPTS_KEY, 'true');
        storageResults.localStorageRetry2 = true;
        console.log('Unlimited attempts localStorage retry 2 completed');
      } else {
        storageResults.localStorageRetry2 = 'already-set';
      }
      logStatus();
      
      // Final check
      const enabled = hasUnlimitedAttempts();
      console.log('Final unlimited attempts check:', enabled);
    } catch (e) {
      console.error('Error in unlimited attempts localStorage retry 2:', e);
    }
  }, 1000);
  
  // Check for initial success
  const initialSuccess = storageResults.localStorage || storageResults.sessionStorage || storageResults.cookieStorage;
  console.log('Initial unlimited attempts enabling success:', initialSuccess);
};

// Disable unlimited attempts - remove from all storage locations
export const disableUnlimitedAttempts = (): void => {
  try {
    localStorage.removeItem(UNLIMITED_ATTEMPTS_KEY);
    console.log('Unlimited attempts disabled in localStorage');
    
    try {
      sessionStorage.removeItem(UNLIMITED_ATTEMPTS_KEY);
      console.log('Unlimited attempts disabled in sessionStorage');
    } catch (e) {
      console.error('Error disabling unlimited attempts in sessionStorage:', e);
    }
    
    try {
      document.cookie = `${UNLIMITED_ATTEMPTS_KEY}=; max-age=0; path=/`;
      console.log('Unlimited attempts disabled in cookie');
    } catch (e) {
      console.error('Error disabling unlimited attempts in cookie:', e);
    }
  } catch (error) {
    console.error('Error disabling unlimited attempts:', error);
  }
};

// Generate a random number between min and max for unlimited attempts display
export const getRandomAttemptsNumber = (min: number = 3, max: number = 13): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
