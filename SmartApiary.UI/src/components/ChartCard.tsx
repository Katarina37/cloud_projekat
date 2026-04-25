import type { ReactNode } from 'react';

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export default function ChartCard({ title, subtitle, children, className = '' }: ChartCardProps) {
  return (
    <section className={`section-card chart-card ${className}`}>
      <div className="section-card-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="chart-body">{children}</div>
    </section>
  );
}
