
// Use a more efficient approach to localStorage to reduce possible lag

// Cache for storage values to reduce reads
const storageCache: Record<string, any> = {};

// Generic storage utility functions with caching
export const getItem = (key: string): string | null => {
  // Check cache first
  if (key in storageCache) {
    return storageCache[key];
  }
  
  try {
    const value = localStorage.getItem(key);
    // Cache the result
    storageCache[key] = value;
    return value;
  } catch (error) {
    console.error('Error getting item from storage:', error);
    return null;
  }
};

export const setItem = (key: string, value: string): void => {
  try {
    // Update cache
    storageCache[key] = value;
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error saving item to storage:', error);
  }
};

// Batch operation to save scores for better performance
export const saveScore = (score: number): void => {
  try {
    // Use cache if available
    const scoresJson = storageCache['netrunner_scores'] || localStorage.getItem('netrunner_scores') || '[]';
    const scores = JSON.parse(scoresJson);
    scores.push(score);
    scores.sort((a: number, b: number) => b - a);
    
    const newScores = JSON.stringify(scores.slice(0, 10));
    
    // Update cache and storage in one operation
    storageCache['netrunner_scores'] = newScores;
    localStorage.setItem('netrunner_scores', newScores);
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

// Get scores from local storage
export const getScores = (): number[] => {
  try {
    // Use cache if available
    const scoresJson = storageCache['netrunner_scores'] || localStorage.getItem('netrunner_scores');
    
    if (scoresJson) {
      // Update cache with parsed result
      const scores = JSON.parse(scoresJson);
      storageCache['netrunner_scores'] = scoresJson;
      return scores;
    }
    
    return [];
  } catch (error) {
    console.error('Error loading scores:', error);
    return [];
  }
};
