
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

// Check if unlimited attempts are enabled - теперь используем несколько источников хранения для надежности
export const hasUnlimitedAttempts = (): boolean => {
  try {
    // Проверка в localStorage
    if (localStorage.getItem(UNLIMITED_ATTEMPTS_KEY) === 'true') {
      return true;
    }
    
    // Резервная проверка в sessionStorage
    try {
      if (sessionStorage.getItem(UNLIMITED_ATTEMPTS_KEY) === 'true') {
        // Если нашли в sessionStorage, восстановим в localStorage
        localStorage.setItem(UNLIMITED_ATTEMPTS_KEY, 'true');
        return true;
      }
    } catch (e) {
      console.error('Error checking unlimited status in sessionStorage:', e);
    }
    
    return false;
  } catch (error) {
    console.error('Error checking unlimited attempts:', error);
    // Пробуем использовать sessionStorage как запасной вариант
    try {
      return sessionStorage.getItem(UNLIMITED_ATTEMPTS_KEY) === 'true';
    } catch (e) {
      console.error('Error checking unlimited attempts in sessionStorage:', e);
      return false;
    }
  }
};

// Enable unlimited attempts - сохраняем в нескольких местах для надежности
export const enableUnlimitedAttempts = (): void => {
  try {
    localStorage.setItem(UNLIMITED_ATTEMPTS_KEY, 'true');
    console.log('Unlimited attempts enabled in localStorage');
    
    // Для большей надежности сделаем несколько дополнительных попыток сохранения
    setTimeout(() => {
      try {
        if (localStorage.getItem(UNLIMITED_ATTEMPTS_KEY) !== 'true') {
          localStorage.setItem(UNLIMITED_ATTEMPTS_KEY, 'true');
          console.log('Unlimited mode retry 1 completed');
        }
      } catch (e) {
        console.error('Error in unlimited mode retry 1:', e);
      }
    }, 300);
    
    setTimeout(() => {
      try {
        if (localStorage.getItem(UNLIMITED_ATTEMPTS_KEY) !== 'true') {
          localStorage.setItem(UNLIMITED_ATTEMPTS_KEY, 'true');
          console.log('Unlimited mode retry 2 completed');
        }
      } catch (e) {
        console.error('Error in unlimited mode retry 2:', e);
      }
    }, 1000);
    
    // Также сохраняем в sessionStorage для резервного варианта
    try {
      sessionStorage.setItem(UNLIMITED_ATTEMPTS_KEY, 'true');
      console.log('Unlimited attempts enabled in sessionStorage (backup)');
    } catch (e) {
      console.error('Error enabling unlimited attempts in sessionStorage:', e);
    }
  } catch (error) {
    console.error('Error enabling unlimited attempts in localStorage:', error);
    
    // Пробуем использовать sessionStorage как запасной вариант
    try {
      sessionStorage.setItem(UNLIMITED_ATTEMPTS_KEY, 'true');
      console.log('Unlimited attempts enabled in sessionStorage (fallback)');
    } catch (e) {
      console.error('Error enabling unlimited attempts in sessionStorage:', e);
    }
  }
};

// Disable unlimited attempts - удаляем из всех хранилищ
export const disableUnlimitedAttempts = (): void => {
  try {
    localStorage.removeItem(UNLIMITED_ATTEMPTS_KEY);
    console.log('Unlimited attempts disabled in localStorage');
    
    // Также удаляем из sessionStorage
    try {
      sessionStorage.removeItem(UNLIMITED_ATTEMPTS_KEY);
      console.log('Unlimited attempts disabled in sessionStorage');
    } catch (e) {
      console.error('Error disabling unlimited attempts in sessionStorage:', e);
    }
  } catch (error) {
    console.error('Error disabling unlimited attempts in localStorage:', error);
  }
};

// Generate a random number between min and max for unlimited attempts display
export const getRandomAttemptsNumber = (min: number = 3, max: number = 13): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
