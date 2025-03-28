import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameCanvas from '@/components/GameCanvas';
import StartScreen from '@/components/StartScreen';
import Leaderboard from '@/components/Leaderboard';
import Achievements from '@/components/Achievements';
import Scripts from '@/components/Scripts';
import { toast } from "sonner";
import { saveScore, getScores, isPaymentVerified, setPaymentVerified, readPaymentVerification } from '@/utils/storageUtils';
import { PlayerSkin } from '@/utils/types';
import { getSelectedSkin, saveSelectedSkin } from '@/utils/skinsUtils';
import { 
  getRemainingDailyAttempts, 
  useAttempt, 
  enableUnlimitedAttempts,
  hasUnlimitedAttempts
} from '@/utils/attemptsUtils';
import { 
  trackPurchase, 
  trackAdView, 
  trackSkinSelection, 
  trackSession, 
  trackError 
} from '@/utils/analyticsUtils';

import {GameAnalytics} from "gameanalytics";
import { t, getSystemLanguage, Language } from '@/utils/localizationUtils';

// Remove the redundant interface declaration and use the one from vite-env.d.ts
declare global {
  interface Window {
    // Ad extra function for displaying ads
    p_adextra?: (successCallback: () => void, errorCallback: () => void) => void;
  }
}

interface InvoiceClosedEvent {
  url: string;
  status: 'paid' | 'cancelled' | 'failed' | 'pending';
}

const Index = () => {
  const [gameActive, setGameActive] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showScripts, setShowScripts] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [dailyAttemptsLeft, setDailyAttemptsLeft] = useState(3);
  const [lastScore, setLastScore] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState<PlayerSkin>(PlayerSkin.DEFAULT);
  const [hasUnlimitedMode, setHasUnlimitedMode] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Debug language and Telegram info on mount
  useEffect(() => {
    // Get the detected language immediately
    const detectedLang = getSystemLanguage();
    setCurrentLanguage(detectedLang);
    
    console.log('🔍 LANGUAGE DEBUG - Current detected language:', detectedLang);
    
    // Debug Telegram language information
    if (window.Telegram?.WebApp) {
      console.log('✅ LANGUAGE DEBUG - Telegram WebApp detected');
      
      if (window.Telegram.WebApp.initDataUnsafe?.user) {
        console.log('👤 LANGUAGE DEBUG - User info from initDataUnsafe:', 
          JSON.stringify(window.Telegram.WebApp.initDataUnsafe.user, null, 2));
      } else {
        console.log('❌ LANGUAGE DEBUG - No user info in initDataUnsafe');
      }
      
      // Try to access raw initData as well
      if (window.Telegram.WebApp.initData) {
        console.log('📄 LANGUAGE DEBUG - initData present, length:', window.Telegram.WebApp.initData.length);
        try {
          const parsed = JSON.parse(window.Telegram.WebApp.initData);
          console.log('📄 LANGUAGE DEBUG - Parsed initData:', JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log('❌ LANGUAGE DEBUG - Could not parse initData:', e);
        }
      } else {
        console.log('❌ LANGUAGE DEBUG - No initData available');
      }
    } else {
      console.log('❌ LANGUAGE DEBUG - Not running in Telegram WebApp');
    }
  }, []);

  useEffect(() => {
    if (!window.Telegram?.WebApp) return;

    // The function to be called when Telegram fires "invoice_closed"
    const handleInvoiceClosed = (eventData: InvoiceClosedEvent) => {
      console.log(`[DEBUG] invoiceClosed event received:`, JSON.stringify(eventData, null, 2));
      console.log(`[DEBUG] Invoice Status: ${eventData.status}`);
      console.log(`[DEBUG] Invoice URL: ${eventData.url}`);

      // Process based on payment status
      switch(eventData.status) {
        case 'paid':
          console.log('[PAYMENT] Invoice was paid successfully');
          
          GameAnalytics.addDesignEvent('invoice:success')
          toast.success(t('paymentSuccess'), {
            description: t('processingPayment'),
            id: "payment-processing"
          });
          
          // Track purchase in analytics
          trackPurchase("UnlimitedMode", 1, "USD");
          
          // Mark payment as verified
          setPaymentVerified();
          
          // Wait a bit to ensure storage is updated
          setTimeout(() => {
            // Double-check payment verification
            const verified = readPaymentVerification();
            console.log('[PAYMENT] Payment verification after setting:', verified);
            
            // Enable unlimited attempts
            enableUnlimitedAttempts();
            
            // Wait a bit more to ensure unlimited attempts are enabled
            setTimeout(() => {
              // Double-check unlimited attempts
              const unlimited = hasUnlimitedAttempts();
              console.log('[PAYMENT] Unlimited attempts after enabling:', unlimited);
              
              // Update state
              setHasUnlimitedMode(true);
              setAttemptsLeft(Infinity);
              setDailyAttemptsLeft(Infinity);
              
              toast.success(t('paymentSuccess'), {
                id: "payment-processing",
                description: t('paymentActivated')
              });
              
              // Clear payment processing flag
              setPaymentProcessing(false);
            }, 500);
          }, 500);
          break;
          
        case 'cancelled':
          console.log('[PAYMENT] Invoice was cancelled by user');
          toast.info(t('paymentCancelled'), {
            description: t('paymentErrorMessage')
          });
          setPaymentProcessing(false);
          break;
          
        case 'failed':
          console.log('[PAYMENT] Payment failed');
          toast.error(t('paymentFailed'), {
            description: t('paymentErrorMessage')
          });
          setPaymentProcessing(false);
          break;
          
        case 'pending':
          console.log('[PAYMENT] Payment is pending');
          toast.loading(t('processingPayment'), {
            description: t('paymentWaiting')
          });
          // Keep payment processing flag active while pending
          break;
          
        default:
          console.log('[PAYMENT] Unknown invoice status:', eventData.status);
          toast.error(t('paymentUnknownStatus'), {
            description: t('paymentUnknownMessage')
          });
          setPaymentProcessing(false);
      }
    };

    // Add the event listener
    window.Telegram.WebApp.onEvent("invoiceClosed", handleInvoiceClosed);

    // Clean up: remove listener on unmount
    return () => {
      if (window.Telegram?.WebApp?.offEvent) {
        window.Telegram.WebApp.offEvent("invoiceClosed", handleInvoiceClosed);
      }
    };
  }, []);

  // Check if running in Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      setIsTelegramWebApp(true);
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  // Load selected skin and daily attempts
  useEffect(() => {
    setSelectedSkin(getSelectedSkin());
    
    // Check for unlimited mode
    const unlimited = hasUnlimitedAttempts();
    setHasUnlimitedMode(unlimited);
    
    if (unlimited) {
      setAttemptsLeft(Infinity);
      setDailyAttemptsLeft(Infinity);
    } else {
      // Get daily attempts left
      const dailyAttempts = getRemainingDailyAttempts();
      setDailyAttemptsLeft(dailyAttempts);
      setAttemptsLeft(Math.min(attemptsLeft, dailyAttempts));
    }
    
    // Setup interval to check daily attempts
    const intervalId = setInterval(() => {
      const unlimited = hasUnlimitedAttempts();

      // If unlimited status has changed, update state
      if (unlimited !== hasUnlimitedMode) {
        setHasUnlimitedMode(unlimited);
        if (unlimited) {
          setAttemptsLeft(Infinity);
          setDailyAttemptsLeft(Infinity);
        }
      }

      if (!unlimited) {
        const newDailyAttempts = getRemainingDailyAttempts();
        setDailyAttemptsLeft(newDailyAttempts);
        // If daily attempts increased, also increase total attempts
        if (newDailyAttempts > dailyAttemptsLeft) {
          setAttemptsLeft(prev => prev + (newDailyAttempts - dailyAttemptsLeft));
        }
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [hasUnlimitedMode, dailyAttemptsLeft]);

  // Loading sequence
  useEffect(() => {
    // Simulate loading assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle skin selection with analytics tracking
  const handleSelectSkin = (skin: PlayerSkin) => {
    setSelectedSkin(skin);
    saveSelectedSkin(skin);
    
    // Track skin selection in analytics
    trackSkinSelection(PlayerSkin[skin]);
    
    toast.success(t('scriptActivated'), {
      description: t('newScriptApplied')
    });
  };
  
  // Handle game over
  const handleGameOver = (score: number) => {
    setGameActive(false);
    setLastScore(score);
    
    // Save score to storage
    saveScore(score);
    console.log("Game over, saved score:", score);
    
    // Show toast with score
    toast(t('gameOver'), {
      description: `${t('gameOverScore')} ${score}`,
      position: 'top-center',
    });
    
    // Send score to Telegram if in WebApp
    if (isTelegramWebApp && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.sendData(JSON.stringify({ action: 'gameOver', score }));
      } catch (err) {
        console.error('Error sending data to Telegram:', err);
      }
    }
  };
  
  // Handle game win
  const handleGameWin = (score: number) => {
    setGameActive(false);
    setLastScore(score);
    
    // Save score to storage
    saveScore(score);
    console.log("Game won, saved score:", score);
    
    // Show toast with winning message
    toast.success(t('hackComplete'), {
      description: t('hackCompleteSuccess'),
      position: 'top-center',
    });
    
    // Send win event to Telegram if in WebApp
    if (isTelegramWebApp && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.sendData(JSON.stringify({ action: 'gameWin', score }));
      } catch (err) {
        console.error('Error sending data to Telegram:', err);
      }
    }
  };
  
  // Start game
  const handleStartGame = () => {
    // Check for unlimited mode first
    if (hasUnlimitedMode) {
      setGameActive(true);
      return;
    }
    
    // Check if player has attempts left
    if (attemptsLeft <= 0) {
      toast.error(t('noAttemptsLeft'), {
        description: t('watchAdOrBuy')
      });
      return;
    }
    
    // Check if player has daily attempts left
    if (dailyAttemptsLeft <= 0) {
      toast.error(t('dailyLimitReached'), {
        description: t('newAttemptsAvailable')
      });
      return;
    }
    
    // Use an attempt from daily allowance
    const result = useAttempt();
    if (result.success) {
      setDailyAttemptsLeft(result.remainingAttempts);
      setAttemptsLeft(prev => prev - 1);
      setGameActive(true);
    } else {
      toast.error(t('dailyLimitReached'), {
        description: t('newAttemptsAvailable')
      });
    }
  };
  
  // Watch ad for attempts
  const handleWatchAd = () => {
    // Track ad view started
    trackAdView('started');
    GameAnalytics.addDesignEvent('add:watched')
    // Call p_adextra function if it exists
    try {
      window.p_adextra(
        // Success callback
        () => {
          console.log("Ad displayed successfully");
          setAttemptsLeft(prev => prev + 1);
          
          // Track ad view completed
          trackAdView('completed');
          
          toast.success(t('adCompleted'), {
            description: t('adAttemptReceived')
          });
        },
        // Error callback
        () => {
          console.log("Ad failed to display");
          
          // Track ad view failed
          trackAdView('failed');
          
          toast.error(t('adError'), {
            description: t('paymentErrorMessage')
          });
        }
      );
      
      toast.info(t('adLoading'), {
        description: t('paymentWaiting'),
      });
      return;
    } catch (err) {
      console.error('Error calling p_adextra:', err);
    }
    
    // If in Telegram, send event to show ad
    if (isTelegramWebApp && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.sendData(JSON.stringify({ action: 'watchAd' }));
        toast.info(t('adLoading'), {
          description: t('paymentWaiting'),
        });
      } catch (err) {
        console.error('Error sending data to Telegram:', err);
        simulateAdView();
      }
    } else {
      simulateAdView();
    }
  };
  
  // Simulate ad viewing (fallback for non-Telegram environment)
  const simulateAdView = () => {
    trackAdView('started');
    
    toast.info(t('adLoading'), {
      description: t('adSimulation'),
    });
    
    setTimeout(() => {
      setAttemptsLeft(prev => prev + 1);
      
      // Track ad view completed
      trackAdView('completed');
      
      toast.success(t('adCompleted'), {
        description: t('adAttemptReceived')
      });
    }, 2000);
  };
  
  // Update handleBuyUnlimited to include translations
  const handleBuyUnlimited = () => {
    // Prevent multiple payments by checking paymentProcessing flag
    if (paymentProcessing) {
      toast.info(t('processingPayment'), {
        description: t('paymentInProgressMessage')
      });
      return;
    }
    
    // Log the current payment verification and unlimited mode status
    console.log("Current payment verification status:", isPaymentVerified());
    console.log("Current unlimited mode status:", hasUnlimitedAttempts());
    
    // If unlimited mode is already active or payment is already verified,
    // show a message and exit early to avoid making unnecessary API calls
    if (hasUnlimitedMode) {
      toast.info(t('daemonAlreadyActive'), {
        description: t('alreadyActiveMessage')
      });
      return;
    }
    
    // Check if payment was already verified
    if (isPaymentVerified()) {
      console.log("Payment was previously verified, activating unlimited mode");
      // If payment was verified but unlimited mode isn't active yet, activate it
      enableUnlimitedAttempts();
      setHasUnlimitedMode(true);
      setAttemptsLeft(Infinity);
      setDailyAttemptsLeft(Infinity);
      
      toast.success(t('paymentSuccess'), {
        description: t('paymentActivated')
      });
      return;
    }

    // Set payment processing flag
    setPaymentProcessing(true);

    // If in Telegram, send event to process payment
    if (isTelegramWebApp && window.Telegram?.WebApp) {
      try {
        toast.info(t('paymentCreating'), {
          description: t('paymentWaiting'),
          id: "invoice-creation"
        });

        // Create a function to make the API call
        const createInvoice = () => {
          console.log("Creating invoice with Telegram WebApp initData:", !!window.Telegram?.WebApp.initData);
          
          // Make API call to create invoice
          return fetch('https://autobrain.ai/api/v1/invoice', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'token': window.Telegram.WebApp.initData,
              'Content-Type': 'application/json',
              'hash': '820d7678089ba5ecfcdd146a2ebb9b5cadc4b74d6655d824ee2ec30f867736b9'
            },
            body: JSON.stringify({
              title: "Протокол демон",
              price_amount: 50
            }),
            referrerPolicy: 'strict-origin-when-cross-origin'
          });
        };
        
        // Execute the API call
        createInvoice()
        .then(response => {
          console.log("Invoice API response status:", response.status);
          return response.json();
        })
        .then(responseData => {
          console.log("Invoice response:", responseData);

          // Extract the URL from the response
          let invoiceUrl;

          if (typeof responseData === 'string') {
            // If response is a direct string
            invoiceUrl = responseData;
          } else if (responseData && responseData.data) {
            // If response has a data property (as shown in the feedback)
            invoiceUrl = responseData.data;
          } else if (responseData && responseData.link) {
            // Fallback for link property
            invoiceUrl = responseData.link;
          } else {
            console.error("Unexpected response format:", responseData);
            throw new Error('Invalid response format from server');
          }

          // Clean the URL if needed (remove quotes, etc.)
          if (invoiceUrl && typeof invoiceUrl === 'string') {
            invoiceUrl = invoiceUrl.replace(/^"|"$/g, '').trim();

            console.log("Using invoice URL:", invoiceUrl);

            toast.success("Счет создан", {
              id: "invoice-creation",
              description: "Переход к оплате..."
            });

            // Open the invoice - the invoiceClosed event handler will take care of processing the result
            if (window.Telegram?.WebApp) {
              window.Telegram.WebApp.openInvoice(invoiceUrl);
            }
          } else {
            throw new Error('Invalid URL format');
          }
        })
        .catch(error => {
          console.error('Error creating invoice:', error);
          // Track payment error
          trackError('payment', `Invoice creation failed: ${error.message}`);
          
          toast.error("Ошибка создания счета", {
            id: "invoice-creation",
            description: "Пожалуйста, попробуйте позже.",
          });
          setPaymentProcessing(false);
          simulatePurchase(); // Fallback to simulation in development
        });
      } catch (err) {
        console.error('Error in payment process:', err);
        // Track payment error
        trackError('payment', `Payment process error: ${err instanceof Error ? err.message : String(err)}`);
        
        setPaymentProcessing(false);
        simulatePurchase();
      }
    } else {
      simulatePurchase();
    }
  };
  
  // Update simulatePurchase to include translations
  const simulatePurchase = () => {
    toast.info(t('processingPayment'), {
      description: t('adSimulation'),
    });
    
    // Set payment processing flag
    setPaymentProcessing(true);
    
    setTimeout(() => {
      // Track purchase in analytics
      trackPurchase("UnlimitedMode", 1, "USD");
      
      // Mark payment as verified
      setPaymentVerified();
      // Enable unlimited mode
      enableUnlimitedAttempts();
      setHasUnlimitedMode(true);
      setAttemptsLeft(Infinity);
      setDailyAttemptsLeft(Infinity);
      
      toast.success(t('paymentSuccess'), {
        description: t('paymentActivated')
      });
      
      // Clear payment processing flag
      setPaymentProcessing(false);
    }, 2000);
  };
  
  // Add attempts (can be called from Telegram backend)
  const addAttempts = (count: number) => {
    setAttemptsLeft(prev => prev + count);
    toast.success(t('adCompleted'), {
      description: t('additionalAttemptsReceived', { count: count.toString() })
    });
  };
  
  // Set unlimited attempts (can be called from Telegram backend)
  const activateUnlimited = () => {
    enableUnlimitedAttempts();
    setHasUnlimitedMode(true);
    setAttemptsLeft(Infinity);
    setDailyAttemptsLeft(Infinity);
    
    toast.success(t('unlimitedModeActivated'), {
      description: t('unlimitedModeMessage')
    });
  };

  // Add session tracking for app visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App went to background
        trackSession('pause');
      } else {
        // App came to foreground
        trackSession('resume');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Track errors globally
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      trackError('runtime', `${event.message} at ${event.filename}:${event.lineno}`);
    };
    
    window.addEventListener('error', handleGlobalError);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  // Register app open with autobrain.ai
  useEffect(() => {
    const registerAppOpen = async () => {
      try {
        console.log("Registering app open with autobrain.ai");
        
        // Make the POST request to register app open with exact format from curl command
        const response = await fetch('https://autobrain.ai/api/v1/register', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'token': window.Telegram.WebApp.initData
          },
          // Empty body as specified in the curl command
          body: ''
        });
        
        if (response.ok) {
          console.log("Successfully registered app open");
        } else {
          console.error("Failed to register app open:", await response.text());
        }
      } catch (error) {
        console.error("Error registering app open:", error);
        // Don't track this error to avoid potential infinite loops
      }
    };
    
    // Call the registration function
    registerAppOpen();
  }, []); // Empty dependency array ensures this runs only once when component mounts

  // Expose functions to window for Telegram to call
  useEffect(() => {
    if (isTelegramWebApp) {
      (window as any).addAttempts = addAttempts;
      (window as any).activateUnlimited = activateUnlimited;
      
      // Add handler for successful payments directly from Telegram
      const handleTelegramPaymentSuccess = () => {
        console.log("Payment success callback from Telegram");
        setPaymentVerified();
        enableUnlimitedAttempts();
        setHasUnlimitedMode(true);
        setAttemptsLeft(Infinity);
        setDailyAttemptsLeft(Infinity);
        
        toast.success("Покупка успешна", {
          description: "Протокол 'Демон' активирован! У вас безлимитные попытки!"
        });
      };
      
      (window as any).handleTelegramPaymentSuccess = handleTelegramPaymentSuccess;
    }
    
    return () => {
      if (isTelegramWebApp) {
        delete (window as any).addAttempts;
        delete (window as any).activateUnlimited;
        delete (window as any).handleTelegramPaymentSuccess;
      }
    };
  }, [isTelegramWebApp]);

  // Load ad script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://partner.adextra.io/jt/01cac2bf3cf062e1ca4de1ca9b54eebdc16ad762.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Add language indicator during development
  const LanguageDebug = () => {
    if (process.env.NODE_ENV !== 'production') {
      return (
        <div className="absolute top-2 left-2 text-xs bg-black/30 text-white px-2 py-1 rounded z-50">
          Lang: {currentLanguage.toUpperCase()}
        </div>
      );
    }
    return null;
  };

  // Loading sequence
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-background flex items-center justify-center flex-col gap-4">
        <LanguageDebug />
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
          {t('initializingHack')}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cyber-background overflow-hidden">
      {/* Language Debug Indicator */}
      <LanguageDebug />
      
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
        onGameWin={handleGameWin}
        attemptsLeft={attemptsLeft}
        selectedSkin={selectedSkin}
        isTelegramWebApp={isTelegramWebApp}
      />
      
      {/* Start Screen */}
      <StartScreen 
        isVisible={!gameActive}
        onStartGame={handleStartGame}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        onShowAchievements={() => setShowAchievements(true)}
        onShowScripts={() => setShowScripts(true)}
        onWatchAd={handleWatchAd}
        onBuyUnlimited={handleBuyUnlimited}
        attemptsLeft={attemptsLeft}
        lastScore={lastScore}
        isTelegramWebApp={isTelegramWebApp}
        dailyAttemptsLeft={dailyAttemptsLeft}
        hasUnlimitedMode={hasUnlimitedMode}
        paymentProcessing={paymentProcessing}
      />
      
      {/* Leaderboard */}
      <Leaderboard 
        isVisible={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
      
      {/* Achievements */}
      <Achievements
        isVisible={showAchievements}
        onClose={() => setShowAchievements(false)}
        isTelegramWebApp={isTelegramWebApp}
      />
      
      {/* Scripts */}
      <Scripts
        isVisible={showScripts}
        onClose={() => setShowScripts(false)}
        onSelectSkin={handleSelectSkin}
        selectedSkin={selectedSkin}
        isTelegramWebApp={isTelegramWebApp}
      />
      
      {/* Ad script */}
      <div className="absolute bottom-10 left-0 right-0 z-10">
        <div id="01cac2bf3cf062e1ca4de1ca9b54eebdc16ad762"></div>
      </div>

      {/* Version tag */}
      <div className="absolute bottom-2 right-2 text-xs text-cyber-foreground/30">
        {t('version')} 1.6.2
      </div>
    </div>
  );
};

export default Index;
