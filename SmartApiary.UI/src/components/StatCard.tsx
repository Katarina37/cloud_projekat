import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?:
    | 'honey'
    | 'orange'
    | 'green'
    | 'red'
    | 'apiary'
    | 'hive'
    | 'alert'
    | 'device'
    | 'weight'
    | 'temperature'
    | 'humidity'
    | 'battery'
    | 'time';
  variant?: 'default' | 'split';
};

export default function StatCard({
  title,
  value,
  detail,
  icon,
  tone = 'honey',
  variant = 'default',
}: StatCardProps) {
  return (
    <article className={`stat-card${variant === 'split' ? ` stat-card-split tone-${tone}` : ''}`}>
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div className="stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}
