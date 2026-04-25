import AlertCard from '../components/AlertCard';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import { alerts } from '../data/mockData';

const unreadCount = alerts.filter((alert) => !alert.read).length;
const criticalCount = alerts.filter((alert) => alert.severity === 'critical').length;

export default function AlertsPage() {
  return (
    <div className="page-stack">
      <PageHeader title="Upozorenja" subtitle="Tip upozorenja, prioritet, vreme i status čitanja" />

      <section className="summary-grid">
        <article className="summary-tile">
          <span>Nepročitano</span>
          <strong>{unreadCount}</strong>
        </article>
        <article className="summary-tile">
          <span>Kritično</span>
          <strong>{criticalCount}</strong>
        </article>
        <article className="summary-tile">
          <span>Ukupno</span>
          <strong>{alerts.length}</strong>
        </article>
      </section>

      <SectionCard title="Lista upozorenja" subtitle="Demo događaji iz pčelinjaka">
        <div className="alert-list">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} {...alert} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Statusi" subtitle="Brzi pregled obrade upozorenja">
        <div className="compact-list">
          {alerts.map((alert) => (
            <article className="compact-row" key={`${alert.id}-status`}>
              <div>
                <strong>{alert.type}</strong>
                <span>{alert.time}</span>
              </div>
              <div className="row-badges">
                <StatusBadge tone={alert.severity}>{alert.priority}</StatusBadge>
                <StatusBadge tone={alert.read ? 'muted' : 'info'}>{alert.read ? 'Pročitano' : 'Nepročitano'}</StatusBadge>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
