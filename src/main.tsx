import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { automationEngine } from './services/automationEngine'

// Start workflow automation engine
// Runs every 60 seconds (1 minute) to process workflow instances
// DISABLED: Uncomment when ready for production or after resolving startup race condition
// automationEngine.start(60000);

console.log('[Main] Workflow automation engine available (not auto-started)');
console.log('[Main] To start manually, run: automationEngine.start(60000) in console');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
