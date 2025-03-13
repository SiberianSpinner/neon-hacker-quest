
// Save score to local storage
export const saveScore = (score: number): void => {
  try {
    const scoresJson = localStorage.getItem('netrunner_scores') || '[]';
    const scores = JSON.parse(scoresJson);
    scores.push(score);
    scores.sort((a: number, b: number) => b - a);
    localStorage.setItem('netrunner_scores', JSON.stringify(scores.slice(0, 10)));
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

// Get scores from local storage
export const getScores = (): number[] => {
  try {
    const scoresJson = localStorage.getItem('netrunner_scores') || '[]';
    return JSON.parse(scoresJson);
  } catch (error) {
    console.error('Error loading scores:', error);
    return [];
  }
};
