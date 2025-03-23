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
  | 'hackCompleteSuccess'
  // Start screen translations
  | 'lastHack'
  | 'vulnerabilitiesFound'
  | 'newVulnerabilitiesIn'
  | 'chips'
  | 'hack'
  | 'scripts'
  | 'searchVulnerabilities'
  | 'daemonProtocol'
  | 'daemonProtocolActive'
  | 'purchaseCompleted'
  | 'processingPayment'
  | 'leaderboard'
  | 'hackSecuritySystem'
  // Loading screen
  | 'initializingHack'
  // Button tooltips
  | 'daemonAlreadyActive'
  | 'alreadyPurchased'
  | 'paymentInProgress'
  // Ad related
  | 'adLoading'
  | 'adSimulation'
  | 'adCompleted'
  | 'adError'
  // Attempts related
  | 'noAttemptsLeft'
  | 'watchAdOrBuy'
  | 'dailyLimitReached'
  | 'newAttemptsAvailable'
  // Achievements (Chips) related
  | 'chipsTitle'
  | 'allChips'
  | 'unlockedChips'
  | 'lockedChips'
  | 'close'
  // Scripts related
  | 'scriptsTitle'
  | 'highestScore'
  | 'scriptActivated'
  | 'newScriptApplied';

export const translations: Record<Language, Record<TranslationKey, string>> = {
  ru: {
    // Existing translations
    hackProgress: 'ВЗЛОМ:',
    invulnerability: 'НЕУЯЗВИМОСТЬ:',
    swipeToMove: 'Проведите пальцем по экрану, чтобы задать направление движения',
    useArrowsToMove: 'Используйте стрелки или WASD для управления',
    infoFoundCore: 'ОБНАРУЖЕНО ИНФОРМАЦИОННОЕ ЯДРО!',
    gameOver: 'Взлом прерван',
    gameOverScore: 'Ваш счёт:',
    hackComplete: 'Взлом успешно завершен!',
    hackCompleteSuccess: 'Поздравляем! Вы достигли 100% взлома!',
    
    // Start screen translations
    lastHack: 'ПОСЛЕДНИЙ ВЗЛОМ:',
    vulnerabilitiesFound: 'НАЙДЕНО УЯЗВИМОСТЕЙ:',
    newVulnerabilitiesIn: 'НОВЫЕ УЯЗВИМОСТИ ЧЕРЕЗ:',
    chips: 'ЧИПЫ',
    hack: 'ВЗЛОМ',
    scripts: 'СКРИПТЫ',
    searchVulnerabilities: 'ПОИСК УЯЗВИМОСТЕЙ',
    daemonProtocol: 'ПРОТОКОЛ "ДЕМОН"',
    daemonProtocolActive: 'ПРОТОКОЛ "ДЕМОН" АКТИВЕН',
    purchaseCompleted: 'ПОКУПКА ВЫПОЛНЕНА',
    processingPayment: 'ОБРАБОТКА ПЛАТЕЖА...',
    leaderboard: 'ЛИДЕРБОРД',
    hackSecuritySystem: 'ВЗЛОМАЙ СИСТЕМУ БЕЗОПАСНОСТИ ОДНОЙ ИЗ КОРПОРАЦИЙ',
    
    // Loading screen
    initializingHack: 'ИНИЦИАЛИЗАЦИЯ ВЗЛОМА...',
    
    // Button tooltips
    daemonAlreadyActive: 'Протокол "Демон" уже активен',
    alreadyPurchased: 'Вы уже совершили покупку',
    paymentInProgress: 'Обработка платежа',
    
    // Ad related
    adLoading: 'Загрузка рекламы...',
    adSimulation: 'Симуляция просмотра рекламы.',
    adCompleted: 'Реклама завершена',
    adError: 'Ошибка показа рекламы',
    
    // Attempts related
    noAttemptsLeft: 'Нет попыток!',
    watchAdOrBuy: 'Посмотрите рекламу или купите безлимитные попытки.',
    dailyLimitReached: 'Ежедневный лимит исчерпан!',
    newAttemptsAvailable: 'Новые попытки будут доступны в 00:01.',
    
    // Achievements (Chips) related
    chipsTitle: 'ЧИПЫ',
    allChips: 'ВСЕ',
    unlockedChips: 'ОТКРЫТЫ',
    lockedChips: 'ЗАКРЫТЫ',
    close: 'ЗАКРЫТЬ',
    
    // Scripts related
    scriptsTitle: 'СКРИПТЫ',
    highestScore: 'Ваш рекорд: {score} ({percent}%)',
    scriptActivated: 'Скрипт активирован',
    newScriptApplied: 'Новый скрипт успешно применен'
  },
  en: {
    // Existing translations
    hackProgress: 'HACK:',
    invulnerability: 'INVULNERABILITY:',
    swipeToMove: 'Swipe on screen to set movement direction',
    useArrowsToMove: 'Use arrows or WASD to control',
    infoFoundCore: 'INFORMATION CORE DETECTED!',
    gameOver: 'Hack interrupted',
    gameOverScore: 'Your score:',
    hackComplete: 'Hack completed successfully!',
    hackCompleteSuccess: 'Congratulations! You reached 100% hack!',
    
    // Start screen translations
    lastHack: 'LAST HACK:',
    vulnerabilitiesFound: 'VULNERABILITIES FOUND:',
    newVulnerabilitiesIn: 'NEW VULNERABILITIES IN:',
    chips: 'CHIPS',
    hack: 'HACK',
    scripts: 'SCRIPTS',
    searchVulnerabilities: 'SEARCH VULNERABILITIES',
    daemonProtocol: 'DAEMON PROTOCOL',
    daemonProtocolActive: 'DAEMON PROTOCOL ACTIVE',
    purchaseCompleted: 'PURCHASE COMPLETED',
    processingPayment: 'PROCESSING PAYMENT...',
    leaderboard: 'LEADERBOARD',
    hackSecuritySystem: 'HACK THE SECURITY SYSTEM OF ONE OF THE CORPORATIONS',
    
    // Loading screen
    initializingHack: 'INITIALIZING HACK...',
    
    // Button tooltips
    daemonAlreadyActive: 'Daemon Protocol already active',
    alreadyPurchased: 'You have already purchased this',
    paymentInProgress: 'Processing payment',
    
    // Ad related
    adLoading: 'Loading advertisement...',
    adSimulation: 'Simulating ad view.',
    adCompleted: 'Advertisement completed',
    adError: 'Error displaying advertisement',
    
    // Attempts related
    noAttemptsLeft: 'No attempts left!',
    watchAdOrBuy: 'Watch an ad or buy unlimited attempts.',
    dailyLimitReached: 'Daily limit reached!',
    newAttemptsAvailable: 'New attempts will be available at 00:01.',
    
    // Achievements (Chips) related
    chipsTitle: 'CHIPS',
    allChips: 'ALL',
    unlockedChips: 'UNLOCKED',
    lockedChips: 'LOCKED',
    close: 'CLOSE',
    
    // Scripts related
    scriptsTitle: 'SCRIPTS',
    highestScore: 'Highest score: {score} ({percent}%)',
    scriptActivated: 'Script activated',
    newScriptApplied: 'New script successfully applied'
  }
};

// Translation function
export const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
  const lang = getSystemLanguage();
  let translatedText = translations[lang][key];
  
  // Replace any parameters in the translation
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      translatedText = translatedText.replace(`{${paramKey}}`, String(paramValue));
    });
  }
  
  return translatedText;
};
