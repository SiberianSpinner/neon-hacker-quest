
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CustomButton } from './ui/CustomButton';
import MatrixRain from './MatrixRain';
import { Trophy, Microchip, Cable, Code, Timer } from 'lucide-react';

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
  nextAttemptTime?: number; // New prop for next attempt time (timestamp)
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
  nextAttemptTime
}) => {
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMenuLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Effect for countdown timer
  React.useEffect(() => {
    // Only run the timer if nextAttemptTime is provided and attemptsLeft < 3
    if (nextAttemptTime && attemptsLeft < 3) {
      const updateTimer = () => {
        const now = Date.now();
        const diff = nextAttemptTime - now;
        
        if (diff <= 0) {
          setTimeLeft("00:00");
          return;
        }
        
        // Format remaining time as mm:ss
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      };
      
      // Update timer immediately
      updateTimer();
      
      // Set interval to update timer every second
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [nextAttemptTime, attemptsLeft]);
  
  // Format score as percentage with three decimal places
  const formattedScore = lastScore !== undefined ? 
    `${(lastScore / 1000).toFixed(3)}%` : undefined;
  
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
            className="text-lg text-cyber-primary font-bold"
          >
            {isTelegramWebApp ? 'НАЙДЕНО УЯЗВИМОСТЕЙ: ' : 'VULNERABILITIES FOUND: '}{attemptsLeft === Infinity ? '∞' : attemptsLeft}
          </motion.p>
          
          {/* New timer section */}
          {attemptsLeft < 3 && nextAttemptTime && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex items-center justify-center space-x-2 text-cyber-foreground/80"
            >
              <Timer className="w-4 h-4" />
              <span className="text-sm">
                {isTelegramWebApp ? 'НОВАЯ УЯЗВИМОСТЬ ЧЕРЕЗ: ' : 'NEW VULNERABILITY IN: '}{timeLeft}
              </span>
            </motion.div>
          )}
        </div>
        
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center gap-4 mb-4">
            {/* Chips button styled as a desktop shortcut with microchip icon 
                This was moved to the first position (swapped with Hack) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: menuLoaded ? 1 : 0, y: menuLoaded ? 0 : 10 }}
              transition={{ delay: 0.5, duration: 0.3 }}
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
            
            {/* Play button styled as a desktop shortcut with LAN cable icon 
                This was moved to the second position (swapped with Chips) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: menuLoaded ? 1 : 0, y: menuLoaded ? 0 : 10 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <div className="flex flex-col items-center">
                <CustomButton 
                  className="w-24 h-24 flex flex-col justify-center items-center rounded-md p-2 text-center"
                  glowEffect
                  onClick={onStartGame}
                  disabled={attemptsLeft <= 0}
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
              transition={{ delay: 0.7, duration: 0.3 }}
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
            transition={{ delay: 0.8, duration: 0.3 }}
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
            transition={{ delay: 0.9, duration: 0.3 }}
          >
            <CustomButton 
              className="w-full uppercase"
              variant="tertiary"
              onClick={onBuyUnlimited}
            >
              {isTelegramWebApp ? 'ПРОТОКОЛ "ДЕМОН"' : 'DAEMON PROTOCOL'}
            </CustomButton>
          </motion.div>
          
          {/* Leaderboard button moved under Daemon Protocol */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: menuLoaded ? 1 : 0, y: menuLoaded ? 0 : 10 }}
            transition={{ delay: 1.0, duration: 0.3 }}
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
          transition={{ delay: 1.1, duration: 0.5 }}
          className="text-xs text-cyber-foreground/50 text-center mt-4"
        >
          {isTelegramWebApp ? 'ВЗЛОМАЙ СИСТЕМУ БЕЗОПАСНОСТИ ОДНОЙ ИЗ КОРПОРАЦИЙ' : 'HACK THE SECURITY SYSTEM OF ONE OF THE CORPORATIONS'}
        </motion.div>
      </div>
    </div>
  );
};

export default StartScreen;
