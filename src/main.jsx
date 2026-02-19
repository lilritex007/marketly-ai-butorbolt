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
    const appRoot = document.getElementById('mkt-butorbolt-app')
    if (appRoot) {
      let parent = appRoot.parentElement
      while (parent && parent !== document.body) {
        const style = getComputedStyle(parent)
        const oy = style.overflowY
        const isScrollable = (oy === 'auto' || oy === 'scroll' || oy === 'overlay') && parent.scrollHeight > parent.clientHeight
        if (isScrollable) {
          parent.scrollTo({ top: 0, left: 0, behavior: 'auto' })
          break
        }
        parent = parent.parentElement
      }
    }
  }
  scrollTopNow()
  window.addEventListener('DOMContentLoaded', scrollTopNow)
  window.addEventListener('load', scrollTopNow)
  window.addEventListener('pageshow', (e) => {
    scrollTopNow()
    if (e.persisted) setTimeout(scrollTopNow, 80)
  })
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
