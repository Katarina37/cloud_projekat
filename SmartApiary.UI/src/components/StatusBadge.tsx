import type { ReactNode } from 'react';

export type StatusTone = 'good' | 'warning' | 'critical' | 'muted' | 'info';

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
};

export default function StatusBadge({ children, tone = 'muted' }: StatusBadgeProps) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}
