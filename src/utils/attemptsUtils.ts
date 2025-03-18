
// Daily attempts management

// Key for storing daily attempts data
const DAILY_ATTEMPTS_KEY = 'netrunner_daily_attempts';

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
  // First check if we need to reset
  checkAndResetDailyAttempts();
  
  const data = getDailyAttemptsData();
  const MAX_DAILY_ATTEMPTS = 3;
  return Math.max(0, MAX_DAILY_ATTEMPTS - data.attemptsUsed);
};

// Use an attempt
export const useAttempt = (): { success: boolean, remainingAttempts: number } => {
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

// Check if unlimited attempts are enabled
export const hasUnlimitedAttempts = (): boolean => {
  try {
    return localStorage.getItem('netrunner_unlimited_attempts') === 'true';
  } catch (error) {
    return false;
  }
};

// Enable unlimited attempts
export const enableUnlimitedAttempts = (): void => {
  try {
    localStorage.setItem('netrunner_unlimited_attempts', 'true');
  } catch (error) {
    console.error('Error enabling unlimited attempts:', error);
  }
};

// Disable unlimited attempts
export const disableUnlimitedAttempts = (): void => {
  try {
    localStorage.removeItem('netrunner_unlimited_attempts');
  } catch (error) {
    console.error('Error disabling unlimited attempts:', error);
  }
};
