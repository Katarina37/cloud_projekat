// Zajednicka UI komponenta: AuthLayout.

import type { ReactNode } from 'react';
import './AuthLayout.css';

type AuthLayoutProps = {
  children: ReactNode;
  videoSrc: string;
  variant?: 'default' | 'compact';
};

export default function AuthLayout({ children, videoSrc, variant = 'default' }: AuthLayoutProps) {
  return (
    <main className={`auth-layout${variant === 'compact' ? ' auth-layout-compact' : ''}`}>
      <div className="auth-layout-video" aria-hidden="true">
        <video autoPlay loop muted playsInline>
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="auth-layout-video-overlay" />
      </div>

      <div className="auth-layout-panel">
        <div className="auth-layout-panel-content">{children}</div>
      </div>
    </main>
  );
}
