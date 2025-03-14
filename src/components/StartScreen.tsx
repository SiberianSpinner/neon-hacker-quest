
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CustomButton } from './ui/CustomButton';
import MatrixRain from './MatrixRain';

interface StartScreenProps {
  isVisible: boolean;
  onStartGame: () => void;
  onShowLeaderboard: () => void;
  onWatchAd: () => void;
  onBuyUnlimited: () => void;
  attemptsLeft: number;
  lastScore?: number;
  isTelegramWebApp?: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({
  isVisible,
  onStartGame,
  onShowLeaderboard,
  onWatchAd,
  onBuyUnlimited,
  attemptsLeft,
  lastScore,
  isTelegramWebApp = false
}) => {
  const [menuLoaded, setMenuLoaded] = useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMenuLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
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
              {isTelegramWebApp ? 'ПОСЛЕДНИЙ ВЗЛОМ: ' : 'LAST HACK: '}{lastScore}
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
        </div>
        
        <div className="w-full space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: menuLoaded ? 1 : 0, y: menuLoaded ? 0 : 10 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <CustomButton 
              className="w-full text-lg uppercase"
              glowEffect
              onClick={onStartGame}
              disabled={attemptsLeft <= 0}
            >
              {isTelegramWebApp ? 'ИГРАТЬ' : 'PLAY'}
            </CustomButton>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: menuLoaded ? 1 : 0, y: menuLoaded ? 0 : 10 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <CustomButton 
              className="w-full uppercase"
              variant="ghost" 
              onClick={onShowLeaderboard}
            >
              {isTelegramWebApp ? 'ЛИДЕРБОРД' : 'LEADERBOARD'}
            </CustomButton>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: menuLoaded ? 1 : 0, y: menuLoaded ? 0 : 10 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <CustomButton 
              className="w-full uppercase"
              variant="secondary"
              onClick={onWatchAd}
            >
              {isTelegramWebApp ? 'ДОП ПОПЫТКИ' : 'WATCH AD FOR ATTEMPTS'}
            </CustomButton>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: menuLoaded ? 1 : 0, y: menuLoaded ? 0 : 10 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            <CustomButton 
              className="w-full uppercase"
              variant="tertiary"
              onClick={onBuyUnlimited}
            >
              {isTelegramWebApp ? 'БЕЗЛИМИТ' : 'UNLIMITED ATTEMPTS'}
            </CustomButton>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: menuLoaded ? 0.7 : 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-xs text-cyber-foreground/50 text-center mt-4"
        >
          {isTelegramWebApp ? 'ИЗБЕГАЙ СТЕН И ВЫЖИВАЙ' : 'NAVIGATE THE CYBER MAZE AND SURVIVE'}
        </motion.div>
      </div>
    </div>
  );
};

export default StartScreen;
