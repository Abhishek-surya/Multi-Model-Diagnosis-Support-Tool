import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ maxWidth: '640px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: 'var(--color-danger, #dc2626)', marginBottom: '0.5rem' }}>
            A rendering issue occurred
          </h2>
          <p style={{ color: 'var(--color-text-muted, #64748b)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            The application encountered an unexpected error while displaying this view.
          </p>
          <pre
            style={{
              textAlign: 'left',
              background: 'var(--color-surface-sunken, #f1f5f9)',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              overflowX: 'auto',
              marginBottom: '1.5rem',
              color: 'var(--color-text, #1e293b)'
            }}
          >
            {this.state.error?.message || String(this.state.error)}
          </pre>
          <button
            type="button"
            className="btn-primary"
            onClick={this.handleReset}
            style={{ display: 'inline-flex', padding: '0.6rem 1.5rem' }}
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
