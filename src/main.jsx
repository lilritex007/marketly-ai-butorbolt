import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import './index.css'

if (typeof window !== 'undefined' && !window.__MKT_SCROLL_INIT) {
  window.__MKT_SCROLL_INIT = true
  window.history.scrollRestoration = 'manual'
  const scrollTopNow = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }
  window.addEventListener('load', scrollTopNow)
  window.addEventListener('pageshow', scrollTopNow)
}

const rootEl = document.getElementById('root')
if (rootEl) {
  if (!window.__MKT_BUTORBOLT_APP_MOUNTED) {
    window.__MKT_BUTORBOLT_APP_MOUNTED = true
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    )
  }
}
