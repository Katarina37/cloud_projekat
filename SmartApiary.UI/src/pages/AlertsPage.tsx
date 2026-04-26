import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import apiClient, { unwrapResult, type ResultResponse } from '../api/apiClient';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';

type AlertDto = {
  id?: string;
  Id?: string;
  title?: string;
  Title?: string;
  message?: string;
  Message?: string;
  type?: string | number;
  Type?: string | number;
  createdAt?: string;
  CreatedAt?: string;
  isRead?: boolean;
  IsRead?: boolean;
};

type BadgeTone = 'good' | 'warning' | 'critical' | 'muted' | 'info';

const endpointMissingMessage = 'Endpoint za upozorenja još nije implementiran.';
const loadingMessage = 'Učitavanje upozorenja...';
const loadErrorMessage = 'Greška pri učitavanju upozorenja.';
const emptyMessage = 'Nema aktivnih upozorenja.';

const getTitle = (alert: AlertDto) => alert.title ?? alert.Title ?? 'Upozorenje';
const getMessage = (alert: AlertDto) => alert.message ?? alert.Message ?? '';
const getType = (alert: AlertDto) => String(alert.type ?? alert.Type ?? 'Nepoznat tip');
const getCreatedAt = (alert: AlertDto) => alert.createdAt ?? alert.CreatedAt ?? '';
const getIsRead = (alert: AlertDto) => alert.isRead ?? alert.IsRead ?? false;

const formatDate = (value: string) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const getAlertTone = (alert: AlertDto): BadgeTone => {
  const type = getType(alert).toLowerCase();

  if (type.includes('weight') || type.includes('tež')) {
    return 'critical';
  }

  if (type.includes('battery') || type.includes('pesticide') || type.includes('spraying')) {
    return 'warning';
  }

  return getIsRead(alert) ? 'muted' : 'info';
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<AlertDto[] | ResultResponse<AlertDto[]>>('/notifications');
        const nextAlerts = unwrapResult(response.data, 'Failed to load alerts') ?? [];

        setAlerts(nextAlerts);
      } catch (requestError) {
        setAlerts([]);

        if (isAxiosError(requestError) && requestError.response?.status === 404) {
          setError(endpointMissingMessage);
        } else {
          setError(loadErrorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const unreadCount = useMemo(
    () => alerts.filter((alert) => !getIsRead(alert)).length,
    [alerts],
  );
  const typeCount = useMemo(
    () => new Set(alerts.map((alert) => getType(alert))).size,
    [alerts],
  );

  return (
    <div className="page-stack">
      <PageHeader title="Upozorenja" subtitle="Tip upozorenja, prioritet, vreme i status čitanja" />

      {loading ? <section className="section-card">{loadingMessage}</section> : null}

      {!loading && error ? (
        <section
          className="section-card"
          style={{ color: error === endpointMissingMessage ? 'var(--muted)' : 'var(--danger)' }}
        >
          {error}
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

          <SectionCard title="Lista upozorenja" subtitle="Podaci iz backend API-ja">
            <div className="alert-list">
              {alerts.map((alert, index) => {
                const title = getTitle(alert);
                const message = getMessage(alert);
                const type = getType(alert);
                const createdAt = getCreatedAt(alert);
                const isRead = getIsRead(alert);
                const tone = getAlertTone(alert);
                const Icon = isRead ? CheckCircle2 : AlertTriangle;
                const key = alert.id ?? alert.Id ?? `${title}-${createdAt}-${index}`;

                return (
                  <article className={`alert-card ${tone}`} key={key}>
                    <div className="alert-icon" aria-hidden="true">
                      <Icon size={18} />
                    </div>
                    <div className="alert-content">
                      <div className="alert-heading">
                        <div>
                          <strong>{title}</strong>
                          <span>{type}</span>
                        </div>
                        <StatusBadge tone={isRead ? 'muted' : 'info'}>
                          {isRead ? 'Pročitano' : 'Nepročitano'}
                        </StatusBadge>
                      </div>
                      <p>{message}</p>
                      <div className="alert-meta">
                        <small>{formatDate(createdAt)}</small>
                        <StatusBadge tone={tone}>{type}</StatusBadge>
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
