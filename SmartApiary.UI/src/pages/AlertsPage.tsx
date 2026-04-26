import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getAlerts, getApiErrorMessage, type AlertDto } from '../api/apiClient';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusBadge, { type StatusTone } from '../components/StatusBadge';

const loadingMessage = 'Učitavanje upozorenja...';
const loadErrorMessage = 'Greška pri učitavanju upozorenja.';
const emptyMessage = 'Nema podataka za prikaz';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);

      try {
        const alerts = await getAlerts();
        setAlerts(alerts);
      } catch (requestError) {
        setAlerts([]);
        setError(getApiErrorMessage(requestError, loadErrorMessage));
      } finally {
        setLoading(false);
      }
    };

    void fetchAlerts();
  }, []);

  const unreadCount = useMemo(
    () => alerts.filter((alert) => !alert.isRead).length,
    [alerts],
  );
  const typeCount = useMemo(
    () => new Set(alerts.map((alert) => String(alert.type))).size,
    [alerts],
  );

  return (
    <div className="page-stack">
      <PageHeader title="Upozorenja" subtitle="Pregled dostupnih upozorenja" />

      {loading ? <section className="section-card">{loadingMessage}</section> : null}

      {!loading && error ? (
        <section className="section-card message-card error" role="alert">
          {loadErrorMessage}
        </section>
      ) : null}

      {!loading && !error && alerts.length === 0 ? (
        <section className="section-card">{emptyMessage}</section>
      ) : null}

      {!loading && !error && alerts.length > 0 ? (
        <>
          <section className="summary-grid">
            <article className="summary-tile">
              <span>Nepročitano</span>
              <strong>{unreadCount}</strong>
            </article>
            <article className="summary-tile">
              <span>Tipova</span>
              <strong>{typeCount}</strong>
            </article>
            <article className="summary-tile">
              <span>Ukupno</span>
              <strong>{alerts.length}</strong>
            </article>
          </section>

          <SectionCard title="Lista upozorenja" subtitle="Najnovije stavke">
            <div className="alert-list">
              {alerts.map((alert, index) => {
                const tone: StatusTone = alert.isRead ? 'muted' : 'info';
                const Icon = alert.isRead ? CheckCircle2 : AlertTriangle;
                const key = alert.id || `${alert.title}-${alert.createdAt}-${index}`;

                return (
                  <article className={`alert-card ${tone}`} key={key}>
                    <div className="alert-icon" aria-hidden="true">
                      <Icon size={18} />
                    </div>
                    <div className="alert-content">
                      <div className="alert-heading">
                        <div>
                          <strong>{alert.title}</strong>
                          <span>{String(alert.type)}</span>
                        </div>
                        <StatusBadge tone={tone}>{alert.isRead ? 'Pročitano' : 'Nepročitano'}</StatusBadge>
                      </div>
                      <p>{alert.message}</p>
                      <div className="alert-meta">
                        <small>{formatDate(alert.createdAt)}</small>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}

function formatDate(value: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('sr-Latn-RS');
}
