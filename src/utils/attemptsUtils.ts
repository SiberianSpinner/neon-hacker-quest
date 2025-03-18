
// Time constants for vulnerability generation (in milliseconds)
const ATTEMPT_GENERATION_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
const MAX_ATTEMPTS = 3; // Maximum number of attempts user can have

// Storage keys
const ATTEMPTS_STORAGE_KEY = 'netrunner_attempts';
const LAST_GENERATION_TIME_KEY = 'netrunner_last_attempt_generation';

// Get stored attempts count
export const getStoredAttempts = (): number => {
  const attemptsStr = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
  return attemptsStr ? parseInt(attemptsStr, 10) : MAX_ATTEMPTS;
};

// Save attempts count
export const saveAttempts = (attempts: number): void => {
  localStorage.setItem(ATTEMPTS_STORAGE_KEY, attempts.toString());
};

// Get timestamp of last attempt generation
export const getLastGenerationTime = (): number => {
  const timeStr = localStorage.getItem(LAST_GENERATION_TIME_KEY);
  return timeStr ? parseInt(timeStr, 10) : Date.now();
};

// Save timestamp of last attempt generation
export const saveLastGenerationTime = (timestamp: number): void => {
  localStorage.setItem(LAST_GENERATION_TIME_KEY, timestamp.toString());
};

// Calculate next attempt generation time
export const getNextAttemptTime = (): number => {
  const lastGeneration = getLastGenerationTime();
  return lastGeneration + ATTEMPT_GENERATION_INTERVAL;
};

// Check and restore attempts based on elapsed time
export const checkAndRestoreAttempts = (): { attempts: number, nextTime: number | undefined } => {
  const storedAttempts = getStoredAttempts();
  
  // If user already has max attempts, no need to check time
  if (storedAttempts >= MAX_ATTEMPTS) {
    return { attempts: storedAttempts, nextTime: undefined };
  }
  
  const now = Date.now();
  const lastGeneration = getLastGenerationTime();
  const timeSinceLastGeneration = now - lastGeneration;
  
  // Calculate how many attempts should be generated based on elapsed time
  const intervalsElapsed = Math.floor(timeSinceLastGeneration / ATTEMPT_GENERATION_INTERVAL);
  
  if (intervalsElapsed > 0) {
    // Calculate new attempts and make sure not to exceed max
    const newAttempts = Math.min(storedAttempts + intervalsElapsed, MAX_ATTEMPTS);
    
    // If attempts were added, update last generation time
    if (newAttempts > storedAttempts) {
      const newLastGeneration = lastGeneration + (intervalsElapsed * ATTEMPT_GENERATION_INTERVAL);
      saveLastGenerationTime(newLastGeneration);
      saveAttempts(newAttempts);
      
      // Calculate next generation time if not at max
      const nextTime = newAttempts < MAX_ATTEMPTS ? getNextAttemptTime() : undefined;
      
      console.log(`Restored ${newAttempts - storedAttempts} attempts. New total: ${newAttempts}`);
      return { attempts: newAttempts, nextTime };
    }
  }
  
  // No new attempts were generated, return current count and next time
  const nextTime = getNextAttemptTime();
  return { attempts: storedAttempts, nextTime };
};

// Reduce attempts by one and update next generation time
export const reduceAttempts = (): { attempts: number, nextTime: number | undefined } => {
  const storedAttempts = getStoredAttempts();
  
  // Cannot reduce if already at 0
  if (storedAttempts <= 0) {
    return { attempts: 0, nextTime: getNextAttemptTime() };
  }
  
  const newAttempts = storedAttempts - 1;
  saveAttempts(newAttempts);
  
  // If this was the first attempt used from max, set last generation time to now
  if (storedAttempts === MAX_ATTEMPTS) {
    saveLastGenerationTime(Date.now());
  }
  
  // Return new count and next generation time
  return { attempts: newAttempts, nextTime: getNextAttemptTime() };
};

// Add attempts (from ad or purchase)
export const addAttempts = (count: number): { attempts: number, nextTime: number | undefined } => {
  const storedAttempts = getStoredAttempts();
  const newAttempts = Math.min(storedAttempts + count, MAX_ATTEMPTS);
  
  saveAttempts(newAttempts);
  
  // If we reached max attempts, no next time needed
  const nextTime = newAttempts < MAX_ATTEMPTS ? getNextAttemptTime() : undefined;
  
  return { attempts: newAttempts, nextTime };
};

// Set unlimited attempts
export const setUnlimitedAttempts = (): void => {
  // We don't actually store infinity in localStorage, but this is handled in the app logic
  console.log("Unlimited attempts activated");
};
