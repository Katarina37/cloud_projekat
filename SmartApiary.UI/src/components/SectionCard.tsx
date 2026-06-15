// Zajednicka UI komponenta: SectionCard.

import type { ReactNode } from 'react';

type SectionCardProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function SectionCard({
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
}: SectionCardProps) {
  return (
    <section className={`section-card ${className}`}>
      <div className="section-card-header">
        <div className="section-heading">
          {icon ? <div className="section-icon">{icon}</div> : null}
          <div>
            <h2>{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
        </div>
        {action ? <div className="section-action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
