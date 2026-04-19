import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F2F2F2', padding: '20px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700, color: '#1A1A1A', marginBottom: '16px' }}>
            Something went wrong.
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#1A1C1C', marginBottom: '24px' }}>
            An unexpected error occurred. Please refresh the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              background: '#1A1A1A', 
              color: '#FAFAFA', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '4px', 
              fontFamily: "'Space Grotesk', sans-serif", 
              fontWeight: 700, 
              cursor: 'pointer', 
              textTransform: 'uppercase' 
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
