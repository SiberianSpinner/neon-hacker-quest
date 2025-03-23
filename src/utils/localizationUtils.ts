// Define language types
export type Language = 'ru' | 'en';

// Get the user's system language from Telegram or browser
export const getSystemLanguage = (): Language => {
  console.log('⚠️ Language detection started');
  
  // IMPORTANT: For testing during development, force to English
  // Remove this in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('🛠️ DEV MODE: Forcing language to English for testing');
    return 'en';
  }
  
  // Check if we're in Telegram Web App
  if (window.Telegram?.WebApp) {
    console.log('🔍 Telegram WebApp detected');
    
    // Get the language code from Telegram
    try {
      // Try to access language from WebApp directly
      const webApp = window.Telegram.WebApp;
      
      // Check initDataUnsafe first (the most direct path)
      if (webApp.initDataUnsafe?.user?.language_code) {
        const tgLang = webApp.initDataUnsafe.user.language_code.toLowerCase();
        console.log('🌐 Using Telegram language from initDataUnsafe:', tgLang);
        
        // IMPORTANT: Force to English unless explicitly Russian ('ru' or 'ru-RU')
        const isRussian = tgLang === 'ru' || tgLang === 'ru-ru';
        console.log('Is Russian language?', isRussian);
        
        return isRussian ? 'ru' : 'en';
      } else {
        console.log('❌ No language_code in initDataUnsafe');
      }
      
      // Try to parse initData if available
      if (webApp.initData && webApp.initData.length > 0) {
        try {
          const parsedData = JSON.parse(webApp.initData);
          console.log('📄 Successfully parsed initData');
          
          if (parsedData?.user?.language_code) {
            const tgLang = parsedData.user.language_code.toLowerCase();
            console.log('🌐 Using Telegram language from parsed initData:', tgLang);
            
            // IMPORTANT: Force to English unless explicitly Russian ('ru' or 'ru-RU')
            const isRussian = tgLang === 'ru' || tgLang === 'ru-ru';
            console.log('Is Russian language?', isRussian);
            
            return isRussian ? 'ru' : 'en';
          } else {
            console.log('❌ No language_code in parsed initData');
          }
        } catch (e) {
          console.error('❌ Error parsing Telegram initData:', e);
        }
      } else {
        console.log('❌ No initData available or empty string');
      }
      
      // Additional debug logging
      console.log('⚠️ Telegram WebApp is present but language detection failed');
      console.log('WebApp initDataUnsafe:', JSON.stringify(webApp.initDataUnsafe, null, 2));
      console.log('WebApp initData available:', !!webApp.initData);
      
      // IMPORTANT: Default to English if we can't determine the language from Telegram
      console.log('⚠️ EXPLICITLY DEFAULTING TO ENGLISH since Telegram language detection failed');
      return 'en';
    } catch (e) {
      console.error('❌ Error getting language from Telegram:', e);
      // IMPORTANT: Default to English on errors
      console.log('⚠️ EXPLICITLY DEFAULTING TO ENGLISH due to error');
      return 'en';
    }
  } else {
    console.log('❌ Telegram WebApp not detected');
  }
  
  // Fallback to browser language if Telegram language is not available
  try {
    const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
    console.log('🌐 Fallback to browser language:', browserLang);
    
    // Force to English unless explicitly Russian ('ru' or 'ru-RU')
    const isRussian = browserLang === 'ru' || 
                      browserLang === 'ru-ru' ||
                      browserLang.startsWith('ru-');
    
    console.log('Is Russian browser language?', isRussian);
    console.log('FINAL LANGUAGE CHOICE:', isRussian ? 'ru' : 'en');
    return isRussian ? 'ru' : 'en';
  } catch (e) {
    console.error('❌ Error detecting browser language:', e);
    // Default to English if all else fails
    console.log('⚠️ EXPLICITLY DEFAULTING TO ENGLISH as final fallback');
    return 'en';
  }
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
  | 'newScriptApplied'
  // Leaderboard related
  | 'leaderboardTitle'
  | 'leaderboardRunner'
  | 'leaderboardHackResult'
  | 'leaderboardNoScores'
  // Payment related
  | 'paymentSuccess'
  | 'paymentActivated'
  | 'paymentCancelled'
  | 'paymentErrorMessage'
  | 'paymentFailed'
  | 'paymentWaiting'
  | 'paymentUnknownStatus'
  | 'paymentUnknownMessage'
  | 'adAttemptReceived'
  | 'paymentInProgressMessage'
  | 'alreadyActiveMessage'
  | 'paymentCreating'
  | 'additionalAttemptsReceived'
  | 'unlimitedModeActivated'
  | 'unlimitedModeMessage'
  | 'version'
  // Achievement names and descriptions
  | 'firstRunName'
  | 'firstRunDescription'
  | 'tenPercentName'
  | 'tenPercentDescription'
  | 'twentyFivePercentName'
  | 'twentyFivePercentDescription'
  | 'fiftyPercentName'
  | 'fiftyPercentDescription'
  | 'seventyFivePercentName'
  | 'seventyFivePercentDescription'
  | 'hundredPercentName'
  | 'hundredPercentDescription'
  // New achievement keys
  | 'collect10KeysName'
  | 'collect10KeysDescription'
  | 'collect25KeysName'
  | 'collect25KeysDescription'
  | 'collect50KeysName'
  | 'collect50KeysDescription'
  | 'collect10BackdoorsName'
  | 'collect10BackdoorsDescription'
  | 'collect25BackdoorsName'
  | 'collect25BackdoorsDescription'
  | 'collect50BackdoorsName'
  | 'collect50BackdoorsDescription'
  | 'play10GamesName'
  | 'play10GamesDescription'
  | 'play25GamesName'
  | 'play25GamesDescription'
  | 'play50GamesName'
  | 'play50GamesDescription'
  | 'defeat1BossName'
  | 'defeat1BossDescription'
  | 'defeat3BossesName'
  | 'defeat3BossesDescription'
  | 'defeat5BossesName'
  | 'defeat5BossesDescription'
  | 'defeatAllBossLevelsName'
  | 'defeatAllBossLevelsDescription'
  // Skin related translations
  | 'defaultSkinName'
  | 'defaultSkinDescription'
  | 'purpleSkinName'
  | 'purpleSkinDescription'
  | 'redSkinName'
  | 'redSkinDescription'
  | 'rainbowSkinName'
  | 'rainbowSkinDescription';

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
    newScriptApplied: 'Новый скрипт успешно применен',
    
    // Add missing translations for Leaderboard
    leaderboardTitle: 'ТАБЛИЦА ЛИДЕРОВ',
    leaderboardRunner: 'ХАКЕР',
    leaderboardHackResult: 'РЕЗУЛЬТАТ',
    leaderboardNoScores: 'Пока нет результатов',
    
    // Payment related
    paymentSuccess: 'Оплата успешна',
    paymentActivated: 'Протокол "Демон" активирован! У вас безлимитные попытки!',
    paymentCancelled: 'Платеж отменен',
    paymentErrorMessage: 'Проверьте ваши данные и попробуйте еще раз',
    paymentFailed: 'Ошибка платежа',
    paymentWaiting: 'Пожалуйста, подождите...',
    paymentUnknownStatus: 'Неизвестный статус платежа',
    paymentUnknownMessage: 'Проверьте статус вашего платежа и попробуйте позже',
    adAttemptReceived: 'Вы получили дополнительную попытку!',
    paymentInProgressMessage: 'Дождитесь завершения текущего платежа',
    alreadyActiveMessage: 'У вас уже активирован протокол "Демон"',
    paymentCreating: 'Создание счета',
    additionalAttemptsReceived: 'Вы получили {count} дополнительных попыток!',
    unlimitedModeActivated: 'Безлимитный режим активирован',
    unlimitedModeMessage: 'Теперь у вас неограниченное количество попыток!',
    version: 'Версия',
    
    // Achievement names and descriptions
    firstRunName: 'Первая Загрузка',
    firstRunDescription: 'Начните свою первую попытку взлома',
    tenPercentName: '10% Доступа',
    tenPercentDescription: 'Достигните 10% завершения взлома',
    twentyFivePercentName: '25% Доступа',
    twentyFivePercentDescription: 'Достигните 25% завершения взлома',
    fiftyPercentName: '50% Доступа',
    fiftyPercentDescription: 'Достигните 50% завершения взлома',
    seventyFivePercentName: '75% Доступа',
    seventyFivePercentDescription: 'Достигните 75% завершения взлома',
    hundredPercentName: '100% Доступа',
    hundredPercentDescription: 'Достигните 100% завершения взлома',
    
    // New achievement translations
    collect10KeysName: '10 Ключей Безопасности',
    collect10KeysDescription: 'Соберите 10 ключей безопасности',
    collect25KeysName: '25 Ключей Безопасности',
    collect25KeysDescription: 'Соберите 25 ключей безопасности',
    collect50KeysName: '50 Ключей Безопасности',
    collect50KeysDescription: 'Соберите 50 ключей безопасности',
    collect10BackdoorsName: '10 Бэкдоров',
    collect10BackdoorsDescription: 'Соберите 10 бэкдоров',
    collect25BackdoorsName: '25 Бэкдоров',
    collect25BackdoorsDescription: 'Соберите 25 бэкдоров',
    collect50BackdoorsName: '50 Бэкдоров',
    collect50BackdoorsDescription: 'Соберите 50 бэкдоров',
    play10GamesName: '10 Запусков',
    play10GamesDescription: 'Запустите игру 10 раз',
    play25GamesName: '25 Запусков',
    play25GamesDescription: 'Запустите игру 25 раз',
    play50GamesName: '50 Запусков',
    play50GamesDescription: 'Запустите игру 50 раз',
    defeat1BossName: 'Первая победа над боссом',
    defeat1BossDescription: 'Победите босса 1 раз',
    defeat3BossesName: '3 Победы над боссами',
    defeat3BossesDescription: 'Победите боссов 3 раза',
    defeat5BossesName: '5 Побед над боссами',
    defeat5BossesDescription: 'Победите боссов 5 раз',
    defeatAllBossLevelsName: 'Победа над всеми уровнями боссов',
    defeatAllBossLevelsDescription: 'Победите боссов всех уровней (33k, 66k, 99k)',
    
    // Skin related translations
    defaultSkinName: 'Стандартный',
    defaultSkinDescription: 'Стандартное подключение нетраннера',
    purpleSkinName: 'Фиолетовый',
    purpleSkinDescription: 'Доступен при взломе 25%',
    redSkinName: 'Красный',
    redSkinDescription: 'Доступен при взломе 50%',
    rainbowSkinName: 'Перелив',
    rainbowSkinDescription: 'Доступен при взломе 75%'
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
    newScriptApplied: 'New script successfully applied',
    
    // Add missing translations for Leaderboard
    leaderboardTitle: 'LEADERBOARD',
    leaderboardRunner: 'RUNNER',
    leaderboardHackResult: 'HACK RESULT',
    leaderboardNoScores: 'No scores yet',
    
    // Payment related
    paymentSuccess: 'Payment successful',
    paymentActivated: 'Daemon Protocol activated! You have unlimited attempts!',
    paymentCancelled: 'Payment cancelled',
    paymentErrorMessage: 'Check your payment details and try again',
    paymentFailed: 'Payment failed',
    paymentWaiting: 'Please wait...',
    paymentUnknownStatus: 'Unknown payment status',
    paymentUnknownMessage: 'Check your payment status and try again later',
    adAttemptReceived: 'You received an additional attempt!',
    paymentInProgressMessage: 'Wait for the current payment to complete',
    alreadyActiveMessage: 'You already have the Daemon Protocol active',
    paymentCreating: 'Creating invoice',
    additionalAttemptsReceived: 'You received {count} additional attempts!',
    unlimitedModeActivated: 'Unlimited mode activated',
    unlimitedModeMessage: 'You now have unlimited attempts!',
    version: 'Version',
    
    // Achievement names and descriptions
    firstRunName: 'First Boot',
    firstRunDescription: 'Start your first hack attempt',
    tenPercentName: '10% Access',
    tenPercentDescription: 'Reach 10% hack completion',
    twentyFivePercentName: '25% Access',
    twentyFivePercentDescription: 'Reach 25% hack completion',
    fiftyPercentName: '50% Access',
    fiftyPercentDescription: 'Reach 50% hack completion',
    seventyFivePercentName: '75% Access',
    seventyFivePercentDescription: 'Reach 75% hack completion',
    hundredPercentName: '100% Access',
    hundredPercentDescription: 'Reach 100% hack completion',
    
    // New achievement translations
    collect10KeysName: '10 Security Keys',
    collect10KeysDescription: 'Collect 10 security keys',
    collect25KeysName: '25 Security Keys',
    collect25KeysDescription: 'Collect 25 security keys',
    collect50KeysName: '50 Security Keys',
    collect50KeysDescription: 'Collect 50 security keys',
    collect10BackdoorsName: '10 Backdoors',
    collect10BackdoorsDescription: 'Collect 10 backdoors',
    collect25BackdoorsName: '25 Backdoors',
    collect25BackdoorsDescription: 'Collect 25 backdoors',
    collect50BackdoorsName: '50 Backdoors',
    collect50BackdoorsDescription: 'Collect 50 backdoors',
    play10GamesName: '10 Runs',
    play10GamesDescription: 'Launch the game 10 times',
    play25GamesName: '25 Runs',
    play25GamesDescription: 'Launch the game 25 times',
    play50GamesName: '50 Runs',
    play50GamesDescription: 'Launch the game 50 times',
    defeat1BossName: 'First Boss Victory',
    defeat1BossDescription: 'Defeat a boss 1 time',
    defeat3BossesName: '3 Boss Victories',
    defeat3BossesDescription: 'Defeat bosses 3 times',
    defeat5BossesName: '5 Boss Victories',
    defeat5BossesDescription: 'Defeat bosses 5 times',
    defeatAllBossLevelsName: 'All Boss Levels Defeated',
    defeatAllBossLevelsDescription: 'Defeat bosses of all levels (33k, 66k, 99k)',
    
    // Skin related translations
    defaultSkinName: 'Default',
    defaultSkinDescription: 'Standard netrunner connection',
    purpleSkinName: 'Purple',
    purpleSkinDescription: 'Available at 25% hack completion',
    redSkinName: 'Red',
    redSkinDescription: 'Available at 50% hack completion',
    rainbowSkinName: 'Rainbow',
    rainbowSkinDescription: 'Available at 75% hack completion'
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
