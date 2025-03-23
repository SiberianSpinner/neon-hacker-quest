
// Define language types
export type Language = 'ru' | 'en';

// Get the user's system language from Telegram or browser
export const getSystemLanguage = (): Language => {
  // Check if we're in Telegram Web App
  if (window.Telegram?.WebApp) {
    // Get the language code from Telegram
    const tgLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
    return tgLang === 'ru' ? 'ru' : 'en';
  }
  
  // Fallback to browser language
  const browserLang = navigator.language || (navigator as any).userLanguage;
  return browserLang?.startsWith('ru') ? 'ru' : 'en';
};

// Create translations object
type TranslationKey = 
  | 'hackProgress' 
  | 'invulnerability' 
  | 'swipeToMove' 
  | 'useArrowsToMove'
  | 'infoFoundCore'
  | 'gameOver'
  | 'gameOverScore'
  | 'hackComplete'
  | 'hackCompleteSuccess';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  ru: {
    hackProgress: 'ВЗЛОМ:',
    invulnerability: 'НЕУЯЗВИМОСТЬ:',
    swipeToMove: 'Проведите пальцем по экрану, чтобы задать направление движения',
    useArrowsToMove: 'Используйте стрелки или WASD для управления',
    infoFoundCore: 'ОБНАРУЖЕНО ИНФОРМАЦИОННОЕ ЯДРО!',
    gameOver: 'Взлом прерван',
    gameOverScore: 'Ваш счёт:',
    hackComplete: 'Взлом успешно завершен!',
    hackCompleteSuccess: 'Поздравляем! Вы достигли 100% взлома!'
  },
  en: {
    hackProgress: 'HACK:',
    invulnerability: 'INVULNERABILITY:',
    swipeToMove: 'Swipe on screen to set movement direction',
    useArrowsToMove: 'Use arrows or WASD to control',
    infoFoundCore: 'INFORMATION CORE DETECTED!',
    gameOver: 'Hack interrupted',
    gameOverScore: 'Your score:',
    hackComplete: 'Hack completed successfully!',
    hackCompleteSuccess: 'Congratulations! You reached 100% hack!'
  }
};

// Translation function
export const t = (key: TranslationKey): string => {
  const lang = getSystemLanguage();
  return translations[lang][key];
};
