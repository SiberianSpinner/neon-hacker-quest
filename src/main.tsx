
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeGameAnalytics } from './utils/analyticsUtils'

// Initialize GameAnalytics if environment variables are available
const gaKey = import.meta.env.VITE_GA_KEY;
const gaSecret = import.meta.env.VITE_GA_SECRET;

if (gaKey && gaSecret) {
  // Initialize analytics
  initializeGameAnalytics(gaKey, gaSecret);
} else {
  console.warn('GameAnalytics environment variables not found. Analytics will not be initialized.');
}

createRoot(document.getElementById("root")!).render(<App />);
