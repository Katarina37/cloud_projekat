import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: 'honey' | 'orange' | 'green' | 'red';
};

export default function StatCard({ title, value, detail, icon, tone = 'honey' }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div className="stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}
