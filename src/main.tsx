
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeGameAnalytics } from './utils/analyticsUtils'



createRoot(document.getElementById("root")!).render(<App />);
