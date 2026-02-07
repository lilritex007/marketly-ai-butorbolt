import React from 'react';

/**
 * Root Error Boundary – elkapja a gyerek komponensek hibáit,
 * fallback UI-t jelenít meg, hogy az app ne dőljön el teljesen.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof window !== 'undefined' && window.console) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      if (Fallback) return <Fallback error={this.state.error} />;
      return (
        <div
          role="alert"
          className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-gray-50 border border-gray-200 rounded-xl text-center"
        >
          <p className="text-gray-700 font-medium mb-2">Valami hiba történt.</p>
          <p className="text-sm text-gray-500 mb-4">Frissítsd az oldalt, vagy próbáld később.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            Oldal frissítése
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
