import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { StatusTone } from '../data/mockData';
import StatusBadge from './StatusBadge';

type AlertCardProps = {
  title: string;
  description: string;
  time: string;
  severity: StatusTone;
  type?: string;
  priority?: string;
  read?: boolean;
};

const severityLabel: Record<StatusTone, string> = {
  critical: 'Kritično',
  warning: 'Upozorenje',
  good: 'Dobro',
  muted: 'Info',
  info: 'Info',
};

export default function AlertCard({
  title,
  description,
  time,
  severity,
  type,
  priority,
  read,
}: AlertCardProps) {
  const Icon = severity === 'good' ? CheckCircle2 : AlertTriangle;

  return (
    <article className={`alert-card ${severity}`}>
      <div className="alert-icon" aria-hidden="true">
        <Icon size={18} />
      </div>
      <div className="alert-content">
        <div className="alert-heading">
          <div>
            <strong>{title}</strong>
            {type ? <span>{type}</span> : null}
          </div>
          <StatusBadge tone={severity}>{priority ?? severityLabel[severity]}</StatusBadge>
        </div>
        <p>{description}</p>
        <div className="alert-meta">
          <small>{time}</small>
          {read === undefined ? null : <StatusBadge tone={read ? 'muted' : 'info'}>{read ? 'Pročitano' : 'Nepročitano'}</StatusBadge>}
        </div>
      </div>
    </article>
  );
}
