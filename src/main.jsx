import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import './index.css'

if (typeof window !== 'undefined' && !window.__MKT_SCROLL_INIT) {
  window.__MKT_SCROLL_INIT = true
  window.history.scrollRestoration = 'manual'
  const scrollToHeader = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    const appRoot = document.getElementById('mkt-butorbolt-app') || document.getElementById('root')
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
  scrollToHeader()
  window.addEventListener('DOMContentLoaded', scrollToHeader)
  window.addEventListener('load', () => {
    scrollToHeader()
    requestAnimationFrame(() => { scrollToHeader(); setTimeout(scrollToHeader, 50); setTimeout(scrollToHeader, 150) })
  })
  window.addEventListener('pageshow', (e) => {
    scrollToHeader()
    if (e.persisted) {
      setTimeout(scrollToHeader, 50)
      setTimeout(scrollToHeader, 150)
    }
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
