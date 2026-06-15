// Zajednicka UI komponenta: EmptyState.

import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
};

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon ? <div className="empty-state-icon">{icon}</div> : null}
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
