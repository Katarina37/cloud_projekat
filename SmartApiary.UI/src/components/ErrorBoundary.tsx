import React from 'react';

type State = {
  hasError: boolean;
  error?: Error | null;
};

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console for developer to inspect
    // eslint-disable-next-line no-console
    console.error('Unhandled error in UI:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="section-card message-card error">
          <h3>Došlo je do greške u aplikaciji</h3>
          <p>Molimo osvežite stranicu ili se odjavite i pokušajte ponovo. Pogledajte konzolu za detalje.</p>
          {this.state.error ? <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre> : null}
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
