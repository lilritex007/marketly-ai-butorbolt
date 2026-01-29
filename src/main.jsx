import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// #region agent log
console.log('[DEBUG H5] main.jsx: Module loaded, about to render');
fetch('http://127.0.0.1:7243/ingest/ce754df7-7b1e-4d67-97a6-01293e3ab261',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:INIT',message:'React app initializing',data:{rootExists: !!document.getElementById('root')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
// #endregion

try {
  const rootEl = document.getElementById('root');
  // #region agent log
  console.log('[DEBUG H5] main.jsx: Root element:', rootEl);
  fetch('http://127.0.0.1:7243/ingest/ce754df7-7b1e-4d67-97a6-01293e3ab261',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:ROOT',message:'Root element check',data:{rootExists: !!rootEl, rootId: rootEl?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
  // #endregion
  
  if (rootEl) {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    // #region agent log
    console.log('[DEBUG H5] main.jsx: Render called successfully');
    fetch('http://127.0.0.1:7243/ingest/ce754df7-7b1e-4d67-97a6-01293e3ab261',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:RENDER_OK',message:'Render called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
  } else {
    console.error('[DEBUG H5] main.jsx: #root element not found!');
  }
} catch (err) {
  // #region agent log
  console.error('[DEBUG H5] main.jsx: Render error:', err);
  fetch('http://127.0.0.1:7243/ingest/ce754df7-7b1e-4d67-97a6-01293e3ab261',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:ERROR',message:'Render failed',data:{error: err.message, stack: err.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
  // #endregion
}
