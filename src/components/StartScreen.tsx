
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CustomButton } from './ui/CustomButton';
import MatrixRain from './MatrixRain';
import { Trophy, Microchip, Cable, Code, Clock } from 'lucide-react';
import { formatTimeRemaining, getMillisecondsUntilReset, getRandomAttemptsNumber } from '@/utils/attemptsUtils';
import { isPaymentVerified } from '@/utils/storageUtils';

interface StartScreenProps {
  isVisible: boolean;
  onStartGame: () => void;
  onShowLeaderboard: () => void;
  onWatchAd: () => void;
  onBuyUnlimited: () => void;
  onShowAchievements: () => void;
  onShowScripts: () => void; // New prop for scripts
  attemptsLeft: number;
  lastScore?: number;
  isTelegramWebApp?: boolean;
  dailyAttemptsLeft: number;
  hasUnlimitedMode: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({
  isVisible,
  onStartGame,
  onShowLeaderboard,
  onWatchAd,
  onBuyUnlimited,
  onShowAchievements,
  onShowScripts, // New prop
  attemptsLeft,
  lastScore,
  isTelegramWebApp = false,
  dailyAttemptsLeft,
  hasUnlimitedMode
}) => {
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');
  const [unlimitedAttemptsDisplay, setUnlimitedAttemptsDisplay] = useState(3);
  const [paymentVerified, setPaymentVerified] = useState(false);
  
  // Initialize menu load effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMenuLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Check payment verification on load
  React.useEffect(() => {
    setPaymentVerified(isPaymentVerified());
  }, []);
  
  // Timer for reset countdown
  useEffect(() => {
    if (!isVisible || hasUnlimitedMode) return;
    
    const updateTimer = () => {
      const msUntilReset = getMillisecondsUntilReset();
      setTimeUntilReset(formatTimeRemaining(msUntilReset));
    };
    
    // Update immediately
    updateTimer();
    
    // Then update every second
    const intervalId = setInterval(updateTimer, 1000);
    
    return () => clearInterval(intervalId);
  }, [isVisible, hasUnlimitedMode]);
  
  // Timer for flashing unlimited attempts counter
  useEffect(() => {
    if (!isVisible || !hasUnlimitedMode) return;
    
    // Update the display number every second
    const intervalId = setInterval(() => {
      setUnlimitedAttemptsDisplay(getRandomAttemptsNumber());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isVisible, hasUnlimitedMode]);
  
  // Format score as percentage with three decimal places
  const formattedScore = lastScore !== undefined ? 
    `${(lastScore / 1000).toFixed(3)}%` : undefined;
  
  // Determine if we should show infinity symbol or a number for attempts
  const attemptsDisplay = hasUnlimitedMode 
    ? unlimitedAttemptsDisplay 
    : (attemptsLeft === Infinity ? '∞' : attemptsLeft);
  
  // Set text color for attempts display
  const attemptsTextColor = hasUnlimitedMode 
    ? "text-red-500 font-bold animate-pulse" 
    : "text-cyber-primary font-bold";
    
  // Check if payment button should be disabled
  const isPaymentButtonDisabled = hasUnlimitedMode || paymentVerified;
  // Determine payment button tooltip text
  const paymentButtonTooltip = hasUnlimitedMode 
    ? (isTelegramWebApp ? 'Протокол "Демон" уже активен' : 'Daemon Protocol already active')
    : paymentVerified 
      ? (isTelegramWebApp ? 'Вы уже совершили покупку' : 'You have already purchased this')
      : '';
  
  return (
    <div
      className={cn(
        'fixed inset-0 flex flex-col items-center justify-center z-10 transition-opacity duration-500 bg-cyber-overlay',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      {/* Matrix rain effect in the background */}
      {isVisible && <MatrixRain className="z-5" />}
      
      <div className="max-w-md w-full p-8 flex flex-col gap-8 items-center z-20">
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-6xl font-bold tracking-tighter text-glow"
          >
            NETRUNNER
          </motion.h1>
          
          {lastScore !== undefined && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl text-cyber-primary"
            >
              {isTelegramWebApp ? 'ПОСЛЕДНИЙ ВЗЛОМ: ' : 'LAST HACK: '}{formattedScore}
            </motion.p>
          )}
          
          {/* Make attempts counter more prominent */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`text-lg ${attemptsTextColor}`}
          >
            {isTelegramWebApp ? 'НАЙДЕНО УЯЗВИМОСТЕЙ: ' : 'VULNERABILITIES FOUND: '}{attemptsDisplay}
          </motion.p>
          
          {/* Timer until next reset - only show if less than 3 daily attempts and not in unlimited mode */}
          {dailyAttemptsLeft < 3 && !hasUnlimitedMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center justify-center gap-2 text-sm text-cyber-secondary"
            >
              <Clock className="w-4 h-4" />
              <span>
                {isTelegramWebApp ? 'НОВЫЕ УЯЗВИМОСТИ ЧЕРЕЗ: ' : 'NEW VULNERABILITIES IN: '}{timeUntilReset}
              </span>
            </motion.div>
          )}
        </div>
        
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center gap-4 mb-4">
            {/* Chips button styled as a desktop shortcut with microchip icon */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: menuLoaded ? 1 : 0, y: menuLoaded ? 0 : 10 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <div className="flex flex-col items-center">
                <CustomButton 
                  className="w-24 h-24 flex flex-col justify-center items-center rounded-md p-2 text-center"
                  variant="ghost"
                  onClick={onShowAchievements}
                >
                  <Microchip className="w-12 h-12 mb-1" />
                  <span className="text-xs uppercase mt-1">{isTelegramWebApp ? 'ЧИПЫ' : 'CHIPS'}</span>
                </CustomButton>
              </div>
            </motion.div>
            
            {/* Play button styled as a desktop shortcut with LAN cable icon */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: menuLoaded ? 1 : 0, y: menuLoaded ? 0 : 10 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div className="flex flex-col items-center">
                <CustomButton 
                  className="w-24 h-24 flex flex-col justify-center items-center rounded-md p-2 text-center"
                  glowEffect
                  onClick={onStartGame}
                  disabled={!hasUnlimitedMode && (attemptsLeft <= 0 || dailyAttemptsLeft <= 0)}
                  leftIcon={<Cable className="w-12 h-12 mb-1" />}
                >
                  <span className="text-xs uppercase mt-1">{isTelegramWebApp ? 'ВЗЛОМ' : 'HACK'}</span>
                </CustomButton>
              </div>
            </motion.div>
            
            {/* Scripts button (new) with code icon */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: menuLoaded ? 1 : 0, y: menuLoaded ? 0 : 10 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <div className="flex flex-col items-center">
                <CustomButton 
                  className="w-24 h-24 flex flex-col justify-center items-center rounded-md p-2 text-center"
                  variant="ghost"
                  onClick={onShowScripts}
                >
                  <Code className="w-12 h-12 mb-1" />
                  <span className="text-xs uppercase mt-1">{isTelegramWebApp ? 'СКРИПТЫ' : 'SCRIPTS'}</span>
                </CustomButton>
              </div>
            </motion.div>
          </div>
          
          {/* Vulnerability search button (previously "Watch Ad") */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: menuLoaded ? 1 : 0, y: menuLoaded ? 0 : 10 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            <CustomButton 
              className="w-full uppercase"
              variant="secondary"
              onClick={onWatchAd}
            >
              {isTelegramWebApp ? 'ПОИСК УЯЗВИМОСТЕЙ' : 'SEARCH VULNERABILITIES'}
            </CustomButton>
          </motion.div>
          
          {/* Daemon Protocol button (previously "Unlimited") */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: menuLoaded ? 1 : 0, y: menuLoaded ? 0 : 10 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            <CustomButton
              className={`w-full uppercase ${isPaymentButtonDisabled ? 'bg-red-900/60 hover:bg-red-900/80' : ''}`}
              variant={isPaymentButtonDisabled ? "destructive" : "tertiary"}
              onClick={onBuyUnlimited}
              disabled={isPaymentButtonDisabled} // Disable if unlimited mode is active OR payment is verified
              title={paymentButtonTooltip}
            >
              {isTelegramWebApp ? 
                (hasUnlimitedMode ? 
                  'ПРОТОКОЛ "ДЕМОН" АКТИВЕН' : 
                  (paymentVerified ? 'ПОКУПКА ВЫПОЛНЕНА' : 'ПРОТОКОЛ "ДЕМОН"')
                ) : 
                (hasUnlimitedMode ? 
                  'DAEMON PROTOCOL ACTIVE' : 
                  (paymentVerified ? 'PURCHASE COMPLETED' : 'DAEMON PROTOCOL')
                )
              }
            </CustomButton>
          </motion.div>
          
          {/* Leaderboard button moved under Daemon Protocol */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: menuLoaded ? 1 : 0, y: menuLoaded ? 0 : 10 }}
            transition={{ delay: 0.9, duration: 0.3 }}
          >
            <CustomButton 
              className="w-full uppercase"
              variant="ghost" 
              onClick={onShowLeaderboard}
            >
              {isTelegramWebApp ? 'ЛИДЕРБОРД' : 'LEADERBOARD'}
            </CustomButton>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: menuLoaded ? 0.7 : 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="text-xs text-cyber-foreground/50 text-center mt-4"
        >
          {isTelegramWebApp ? 'ВЗЛОМАЙ СИСТЕМУ БЕЗОПАСНОСТИ ОДНОЙ ИЗ КОРПОРАЦИЙ' : 'HACK THE SECURITY SYSTEM OF ONE OF THE CORPORATIONS'}
        </motion.div>
      </div>
    </div>
  );
};

export default StartScreen;
