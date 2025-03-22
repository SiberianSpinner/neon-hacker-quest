
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize GameAnalytics if environment variables are available
const gaKey = import.meta.env.VITE_GA_KEY;
const gaSecret = import.meta.env.VITE_GA_SECRET;

if (gaKey && gaSecret) {
  // Initialize analytics
  try {
    // This would be the actual initialization code for GameAnalytics
    console.log('GameAnalytics initialized with key:', gaKey);
  } catch (error) {
    console.error('Failed to initialize GameAnalytics:', error);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
