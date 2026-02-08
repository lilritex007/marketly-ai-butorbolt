import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import './index.css'

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
