import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <section className="section first-section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
          <div className="container" style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
            <div className="panel-card" style={{ padding: '2.5rem 1.5rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertTriangle size={28} />
              </div>
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>Something went wrong</h2>
              <p className="subtle-copy" style={{ marginBottom: '1.5rem' }}>
                We encountered an unexpected problem while rendering this page. You can reload the page or return home.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={this.handleReload}
                  type="button"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <RefreshCw size={16} />
                  Reload Page
                </button>
                <a
                  className="btn btn-secondary"
                  href="/"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Home size={16} />
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
