
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameCanvas from '@/components/GameCanvas';
import StartScreen from '@/components/StartScreen';
import Leaderboard from '@/components/Leaderboard';
import { toast } from "sonner";
import { saveScore, getScores } from '@/utils/gameLogic';

const Index = () => {
  const [gameActive, setGameActive] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [lastScore, setLastScore] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Loading sequence
  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle game over
  const handleGameOver = (score: number) => {
    setGameActive(false);
    setLastScore(score);
    
    // Show toast with score
    toast("Game Over", {
      description: `Your score: ${score}`,
      position: 'top-center',
    });
  };
  
  // Start game
  const handleStartGame = () => {
    if (attemptsLeft <= 0) {
      toast.error("No attempts left!", {
        description: "Watch an ad or buy unlimited attempts to continue playing.",
      });
      return;
    }
    
    setGameActive(true);
    setAttemptsLeft(prev => prev - 1);
  };
  
  // Watch ad for attempts
  const handleWatchAd = () => {
    // Simulate ad viewing
    toast.info("Loading Ad...", {
      description: "Simulating ad view for demonstration purposes.",
    });
    
    setTimeout(() => {
      setAttemptsLeft(prev => prev + 1);
      toast.success("Ad Completed", {
        description: "You've earned an extra attempt!"
      });
    }, 2000);
  };
  
  // Buy unlimited attempts
  const handleBuyUnlimited = () => {
    // Simulate purchase
    toast.info("Processing Purchase...", {
      description: "Simulating payment for demonstration purposes.",
    });
    
    setTimeout(() => {
      setAttemptsLeft(Infinity);
      toast.success("Purchase Successful", {
        description: "You now have unlimited attempts!"
      });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-background flex items-center justify-center flex-col gap-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-glow"
        >
          NETRUNNER
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="h-1 bg-cyber-primary rounded-full"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-sm text-cyber-foreground/70 mt-2"
        >
          INITIALIZING SYSTEMS...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cyber-background overflow-hidden">
      {/* Background grid effect */}
      <div 
        className="absolute inset-0 z-0 opacity-10" 
        style={{
          backgroundImage: `linear-gradient(rgba(0, 255, 204, 0.2) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(0, 255, 204, 0.2) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          backgroundPosition: '-1px -1px'
        }}
      />
      
      {/* Game Canvas */}
      <GameCanvas 
        isActive={gameActive} 
        onGameOver={handleGameOver}
        attemptsLeft={attemptsLeft}
      />
      
      {/* Start Screen */}
      <StartScreen 
        isVisible={!gameActive}
        onStartGame={handleStartGame}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        onWatchAd={handleWatchAd}
        onBuyUnlimited={handleBuyUnlimited}
        attemptsLeft={attemptsLeft}
        lastScore={lastScore}
      />
      
      {/* Leaderboard */}
      <Leaderboard 
        isVisible={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
      
      {/* Version tag */}
      <div className="absolute bottom-2 right-2 text-xs text-cyber-foreground/30">
        v1.0.0
      </div>
    </div>
  );
};

export default Index;
