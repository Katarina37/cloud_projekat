// Zajednicka UI komponenta: ErrorBoundary.

import React from 'react';

type State = {
  hasError: boolean;
  error?: Error | null;
};

type Props = {
  children: React.ReactNode;
};

// React za hvatanje gresaka u prikazu i dalje zahteva klasnu komponentu.
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Detalji greske ostaju u konzoli da bi se lakse pronasao problem.
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

    return this.props.children;
  }
}
