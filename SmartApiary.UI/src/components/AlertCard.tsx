import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import StatusBadge, { type StatusTone } from './StatusBadge';

type AlertCardProps = {
  title: string;
  description: string;
  time: string;
  severity: StatusTone;
  type?: string;
  priority?: string;
  read?: boolean;
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
  let readStatus = null;

  if (read !== undefined) {
    readStatus = (
      <StatusBadge tone={read ? 'muted' : 'info'}>
        {read ? 'Pročitano' : 'Nepročitano'}
      </StatusBadge>
    );
  }

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
          <StatusBadge tone={severity}>
            {priority !== undefined ? priority : getSeverityLabel(severity)}
          </StatusBadge>
        </div>
        <p>{description}</p>
        <div className="alert-meta">
          <small>{time}</small>
          {readStatus}
        </div>
      </div>
    </article>
  );
}

function getSeverityLabel(severity: StatusTone) {
  if (severity === 'critical') {
    return 'Kritično';
  }

  if (severity === 'warning') {
    return 'Upozorenje';
  }

  if (severity === 'good') {
    return 'Dobro';
  }

  return 'Info';
}
