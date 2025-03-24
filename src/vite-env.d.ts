
/// <reference types="vite/client" />

// Telegram WebApp interface declarations
interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  MainButton: {
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  onEvent: (eventType: string, callback: (eventData?: any) => void) => void;
  offEvent: (eventType: string, callback: (eventData?: any) => void) => void;
  sendData: (data: string) => void;
  initData: string;
  initDataUnsafe?: {
    user?: {
      language_code?: string;
    }
  };
  openInvoice: (url: string) => void;
}

// Extend Window interface to include Telegram
declare interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
