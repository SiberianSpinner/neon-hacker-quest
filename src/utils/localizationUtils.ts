
// Define language types
export type Language = 'ru' | 'en';

// Get the user's system language from Telegram or browser
export const getSystemLanguage = (): Language => {
  // Check if we're in Telegram Web App
  if (window.Telegram?.WebApp) {
    // Get the language code from Telegram
    // Access user language through WebApp object, handling the case where initDataUnsafe might not exist
    const webApp = window.Telegram.WebApp;
    
    // Handle the case where initDataUnsafe might be accessed differently or not be available
    let tgLang: string | undefined;
    
    // Try various ways to access language information from Telegram WebApp
    try {
      // Try to access it directly (this was causing the TypeScript error)
      if ((webApp as any).initDataUnsafe?.user?.language_code) {
        tgLang = (webApp as any).initDataUnsafe.user.language_code;
      } 
      // If available, use the initData property
      else if (webApp.initData) {
        // Try to parse initData if it's a string
        const parsedData = JSON.parse(webApp.initData);
        tgLang = parsedData?.user?.language_code;
      }
    } catch (e) {
      console.log('Error getting language from Telegram:', e);
    }
    
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
