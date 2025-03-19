
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
      
      // Check for Telegram mobile app
      const isTelegramMobile = isTelegramWebApp() && window.innerWidth < MOBILE_BREAKPOINT;
      
      // Consider it mobile if any condition is met
      setIsMobile(isMobileByWidth || hasTouchCapability || isTelegramMobile);
    };

    // Check if we're in a Telegram WebApp environment
    function isTelegramWebApp() {
      return window.Telegram && window.Telegram.WebApp;
    }

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
