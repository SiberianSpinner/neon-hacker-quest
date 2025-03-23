
import React, { useState, useEffect } from 'react';
import { getScores, formatScoreAsPercentage } from '@/utils/storageUtils';
import { CustomButton } from './ui/CustomButton';
import { cn } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { t } from '@/utils/localizationUtils';

interface LeaderboardProps {
  isVisible: boolean;
  onClose: () => void;
  currentUserId?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ isVisible, onClose, currentUserId }) => {
  const [scores, setScores] = useState<Array<{score: number, username?: string, userId?: string}>>([]);
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>('exited');

  useEffect(() => {
    if (isVisible) {
      setScores(getScores());
      setAnimationState('entering');
      const timer = setTimeout(() => setAnimationState('entered'), 300);
      return () => clearTimeout(timer);
    } else if (animationState === 'entered') {
      setAnimationState('exiting');
      const timer = setTimeout(() => setAnimationState('exited'), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (animationState === 'exited') return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50",
        animationState === 'entering' && "animate-fade-in",
        animationState === 'exiting' && "animate-fade-out"
      )}
    >
      <div 
        className={cn(
          "glass-panel p-8 max-w-md w-full max-h-[80vh] flex flex-col gap-6 overflow-hidden",
          animationState === 'entering' && "animate-scale-up",
          animationState === 'exiting' && "animate-scale-down"
        )}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-glow">{t('leaderboardTitle')}</h2>
          <button 
            onClick={onClose}
            className="text-cyber-primary hover:text-glow transition-all"
          >
            ✕
          </button>
        </div>
        
        <div className="cyber-border overflow-auto flex-1 p-4">
          {scores.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-cyber-primary/30">
                  <TableHead className="p-2 text-cyber-primary">#</TableHead>
                  <TableHead className="p-2 text-cyber-primary">{t('leaderboardRunner')}</TableHead>
                  <TableHead className="p-2 text-cyber-primary">{t('leaderboardHackResult')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((scoreRecord, index) => {
                  const isCurrentUser = currentUserId && scoreRecord.userId === currentUserId;
                  
                  return (
                    <TableRow 
                      key={index} 
                      className={cn(
                        "border-b border-cyber-primary/10 transition-colors",
                        index === 0 && "bg-cyber-primary/10",
                        isCurrentUser && "bg-cyber-primary/20 text-glow"
                      )}
                      style={{ 
                        animationDelay: `${index * 0.05}s`,
                        animation: "fade-up 0.3s forwards"
                      }}
                    >
                      <TableCell className="p-2">{index + 1}</TableCell>
                      <TableCell className={cn("p-2 font-medium", isCurrentUser && "text-glow")}>
                        {isCurrentUser ? "◉ " : ""}{scoreRecord.username || 'Anonymous Runner'}
                      </TableCell>
                      <TableCell className="p-2 font-mono">
                        {formatScoreAsPercentage(scoreRecord.score)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-cyber-primary/50">
              {t('leaderboardNoScores')}
            </div>
          )}
        </div>
        
        <CustomButton onClick={onClose} className="w-full" variant="ghost">
          {t('close')}
        </CustomButton>
      </div>
    </div>
  );
};

export default Leaderboard;
