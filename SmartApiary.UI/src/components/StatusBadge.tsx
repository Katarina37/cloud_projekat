import type { ReactNode } from 'react';
import type { StatusTone } from '../data/mockData';

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
};

export default function StatusBadge({ children, tone = 'muted' }: StatusBadgeProps) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}
