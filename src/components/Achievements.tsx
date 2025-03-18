
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, X, Award, Medal, Trophy } from 'lucide-react';
import { Achievement } from '@/utils/types';
import { loadAchievements } from '@/utils/achievementsUtils';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomButton } from './ui/CustomButton';

interface AchievementsProps {
  isVisible: boolean;
  onClose: () => void;
  isTelegramWebApp?: boolean;
}

const Achievements: React.FC<AchievementsProps> = ({
  isVisible,
  onClose,
  isTelegramWebApp = false
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Reload achievements when component becomes visible
  useEffect(() => {
    if (isVisible) {
      // Reload fresh achievements data
      const loadedAchievements = loadAchievements();
      console.log('Loaded achievements:', loadedAchievements);
      setAchievements(loadedAchievements);
    }
  }, [isVisible]);
  
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  
  const filteredAchievements = activeTab === 'all' 
    ? achievements 
    : activeTab === 'unlocked' 
      ? achievements.filter(a => a.unlocked) 
      : achievements.filter(a => !a.unlocked);
  
  return (
    <motion.div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-cyber-background/90 backdrop-blur-sm transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="bg-black/80 border border-cyber-primary/30 rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: isVisible ? 1 : 0.9, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-primary/20 p-4">
          <h2 className="text-xl font-bold text-cyber-primary flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            ЧИПЫ
            <span className="text-sm text-cyber-foreground/60">
              ({unlockedCount}/{totalCount})
            </span>
          </h2>
          <button
            onClick={onClose}
            className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-cyber-primary/10 transition-colors"
          >
            <X className="h-5 w-5 text-cyber-foreground/60" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="px-4 pt-4">
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 bg-cyber-background border border-cyber-primary/20">
              <TabsTrigger value="all">
                ВСЕ
              </TabsTrigger>
              <TabsTrigger value="unlocked">
                ОТКРЫТЫ
              </TabsTrigger>
              <TabsTrigger value="locked">
                ЗАКРЫТЫ
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <AchievementsList achievements={filteredAchievements} />
            </TabsContent>
            
            <TabsContent value="unlocked" className="mt-0">
              <AchievementsList achievements={filteredAchievements} />
            </TabsContent>
            
            <TabsContent value="locked" className="mt-0">
              <AchievementsList achievements={filteredAchievements} />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Footer */}
        <div className="mt-auto p-4 border-t border-cyber-primary/20">
          <CustomButton
            variant="ghost"
            onClick={onClose}
            className="w-full"
            glowEffect
          >
            ЗАКРЫТЬ
          </CustomButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface AchievementsListProps {
  achievements: Achievement[];
}

const AchievementsList: React.FC<AchievementsListProps> = ({ achievements }) => {
  return (
    <div className="grid grid-cols-1 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      {achievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "relative rounded-lg p-4 border transition-all",
            achievement.unlocked 
              ? "border-cyber-primary bg-cyber-primary/10" 
              : "border-gray-700 bg-black/50"
          )}
        >
          <div className="flex items-center space-x-4">
            <div 
              className={cn(
                "h-16 w-16 rounded-full overflow-hidden flex items-center justify-center relative",
                achievement.unlocked 
                  ? "bg-gradient-to-br from-cyber-primary/20 to-cyber-secondary/20 text-glow" 
                  : "bg-gray-800"
              )}
            >
              {achievement.imageSrc ? (
                <>
                  <img 
                    src={achievement.imageSrc} 
                    alt={achievement.name} 
                    className={cn(
                      "h-full w-full object-cover",
                      !achievement.unlocked && "grayscale opacity-50"
                    )}
                  />
                  {/* Overlay for locked chips */}
                  {!achievement.unlocked && (
                    <div className="absolute inset-0 bg-gray-800/50 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-gray-500 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-gray-500 rounded-full" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Award size={24} className={!achievement.unlocked ? "text-gray-500" : ""} />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className={cn(
                "font-bold",
                achievement.unlocked 
                  ? "text-cyber-primary" 
                  : "text-gray-400"
              )}>
                {achievement.name}
              </h3>
              <p className={cn(
                "text-sm",
                achievement.unlocked 
                  ? "text-cyber-foreground/80" 
                  : "text-gray-500"
              )}>
                {achievement.description}
              </p>
            </div>
            
            {achievement.unlocked && (
              <div className="absolute top-2 right-2">
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="bg-cyber-primary/20 text-cyber-primary text-xs px-2 py-1 rounded-full"
                >
                  ✓
                </motion.span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Achievements;
