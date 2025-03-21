
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      // Check if it's actually a mobile device by screen width
      const isMobileByWidth = window.innerWidth < MOBILE_BREAKPOINT;
      
      // Also check for touch capability as a secondary indicator
      const hasTouchCapability = 'ontouchstart' in window || 
                               navigator.maxTouchPoints > 0 ||
                               (navigator as any).msMaxTouchPoints > 0;
      
      // Check for Telegram WebApp
      const isTelegramWebApp = window.Telegram && window.Telegram.WebApp;
      
      // For Telegram, explicitly determine if it's mobile or desktop
      let isTelegramMobile = false;
      if (isTelegramWebApp) {
        // Since 'platform' property might not exist in all Telegram WebApp versions,
        // we'll rely primarily on userAgent detection for Telegram clients
        isTelegramMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
        
        // Additionally, check window dimensions as a fallback
        if (!isTelegramMobile) {
          isTelegramMobile = window.innerWidth < MOBILE_BREAKPOINT && 
                            'ontouchstart' in window;
        }
      }
      
      // Consider it mobile if any condition is met for non-Telegram
      // Or specifically for Telegram, only if we've determined it's a mobile device
      setIsMobile(isTelegramWebApp ? isTelegramMobile : (isMobileByWidth || hasTouchCapability));
    };

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      checkMobile();
    }
    
    mql.addEventListener("change", onChange)
    checkMobile(); // Initial check
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
