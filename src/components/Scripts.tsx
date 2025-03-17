
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { CustomButton } from './ui/CustomButton';
import MatrixRain from './MatrixRain';
import { PlayerSkin, PlayerSkinInfo } from '@/utils/types';
import { getPlayerSkins, saveSelectedSkin } from '@/utils/skinsUtils';

interface ScriptsProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectSkin: (skin: PlayerSkin) => void;
  selectedSkin: PlayerSkin;
  isTelegramWebApp?: boolean;
}

const Scripts: React.FC<ScriptsProps> = ({
  isVisible,
  onClose,
  onSelectSkin,
  selectedSkin,
  isTelegramWebApp = false
}) => {
  const [skins, setSkins] = useState<PlayerSkinInfo[]>([]);
  const [loadingComplete, setLoadingComplete] = useState(false);
  
  useEffect(() => {
    if (isVisible) {
      // Get player skins with unlock status
      setSkins(getPlayerSkins());
      
      // Simulate loading
      const timer = setTimeout(() => {
        setLoadingComplete(true);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setLoadingComplete(false);
    }
  }, [isVisible]);
  
  const handleSelectSkin = (skin: PlayerSkinInfo) => {
    if (!skin.unlocked) return;
    
    onSelectSkin(skin.id);
    saveSelectedSkin(skin.id);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-30 bg-cyber-overlay">
      <MatrixRain className="z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="relative bg-cyber-background border border-cyber-primary/30 rounded-md shadow-xl p-6 max-w-md w-full z-20"
      >
        <h2 className="text-2xl text-center font-bold text-cyber-primary mb-6 uppercase">
          {isTelegramWebApp ? 'СКРИПТЫ' : 'SCRIPTS'}
        </h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {skins.map((skin) => (
            <div 
              key={skin.id}
              onClick={() => handleSelectSkin(skin)}
              className={`
                relative border rounded-md p-4 cursor-pointer transition-all
                ${skin.unlocked 
                  ? 'border-cyber-primary/30 hover:border-cyber-primary' 
                  : 'border-gray-700 opacity-70'}
                ${selectedSkin === skin.id ? 'bg-cyber-primary/10' : ''}
              `}
            >
              {/* Color preview */}
              <div className="flex justify-center mb-3">
                <div 
                  className="w-10 h-10 rounded-full shadow-glow"
                  style={{ 
                    backgroundColor: typeof skin.color === 'string' ? skin.color : getComputedStyle(document.documentElement).getPropertyValue('--color-cyber-primary'),
                    boxShadow: `0 0 15px ${typeof skin.color === 'string' ? skin.color : '#00ffcc'}`
                  }}
                />
              </div>
              
              <h3 className="text-sm font-bold text-center text-cyber-foreground mb-1">
                {skin.name}
              </h3>
              
              <p className="text-xs text-cyber-foreground/70 text-center">
                {skin.description}
              </p>
              
              {/* Lock icon for locked skins */}
              {!skin.unlocked && (
                <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                  <Lock className="text-cyber-foreground/50 w-8 h-8" />
                </div>
              )}
              
              {/* Selected indicator */}
              {selectedSkin === skin.id && (
                <div className="absolute top-2 right-2">
                  <Check className="text-cyber-primary w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <CustomButton onClick={onClose}>
            {isTelegramWebApp ? 'ЗАКРЫТЬ' : 'CLOSE'}
          </CustomButton>
        </div>
      </motion.div>
    </div>
  );
};

export default Scripts;
