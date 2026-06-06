import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  getApiErrorMessage,
  getNotifications,
  markNotificationAsRead,
  type NotificationDto,
} from '../api/apiClient';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusBadge, { type StatusTone } from '../components/StatusBadge';

const loadingMessage = 'Učitavanje obaveštenja...';
const loadErrorMessage = 'Greška pri učitavanju obaveštenja.';
const markAsReadErrorMessage = 'Greška pri označavanju obaveštenja.';
const emptyMessage = 'Nema obaveštenja.';
const markAsReadSuccessMessage = 'Obaveštenje je označeno kao pročitano.';

export default function AlertsPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const notifications = await getNotifications();
        setNotifications(notifications);
      } catch (requestError) {
        setNotifications([]);
        setError(getApiErrorMessage(requestError, loadErrorMessage));
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const notificationTypes: string[] = [];

  for (const notification of notifications) {
    const type = String(notification.type);

    if (!notificationTypes.includes(type)) {
      notificationTypes.push(type);
    }
  }

  const typeCount = notificationTypes.length;

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingNotificationId(notificationId);
    setError(null);
    setSuccessMessage(null);

    try {
      await markNotificationAsRead(notificationId);
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification,
        ),
      );
      setSuccessMessage(markAsReadSuccessMessage);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, markAsReadErrorMessage));
    } finally {
      setMarkingNotificationId(null);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader title="Upozorenja" subtitle="Pregled obaveštenja iz pčelinjaka" />

      {loading ? <section className="section-card">{loadingMessage}</section> : null}

      {!loading && error ? (
        <section className="section-card message-card error" role="alert">
          {error}
        </section>
      ) : null}

      {!loading && successMessage ? (
        <section className="section-card message-card success" role="status">
          {successMessage}
        </section>
      ) : null}

      {!loading && !error && notifications.length === 0 ? (
        <section className="section-card">{emptyMessage}</section>
      ) : null}

      {!loading && notifications.length > 0 ? (
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
              <strong>{notifications.length}</strong>
            </article>
          </section>

          <SectionCard title="Lista obaveštenja" subtitle="Najnovije stavke">
            <div className="alert-list">
              {notifications.map((notification, index) => {
                const tone = getNotificationTone(notification);
                const Icon = notification.isRead ? CheckCircle2 : AlertTriangle;
                const key = notification.id || `${notification.title}-${notification.createdAt}-${index}`;

                return (
                  <article className={`alert-card ${tone}`} key={key}>
                    <div className="alert-icon" aria-hidden="true">
                      <Icon size={18} />
                    </div>
                    <div className="alert-content">
                      <div className="alert-heading">
                        <div>
                          <strong>{notification.title}</strong>
                          <span>{getNotificationTypeLabel(notification.type)}</span>
                        </div>
                        <StatusBadge tone={notification.isRead ? 'muted' : tone}>
                          {notification.isRead ? 'Pročitano' : 'Nepročitano'}
                        </StatusBadge>
                      </div>
                      <p>{notification.message}</p>
                      <div className="alert-meta">
                        <small>{formatDate(notification.createdAt)}</small>
                        {!notification.isRead ? (
                          <button
                            className="secondary-action-button"
                            disabled={markingNotificationId === notification.id}
                            onClick={() => handleMarkAsRead(notification.id)}
                            type="button"
                          >
                            <CheckCircle2 size={16} />
                            Označi kao pročitano
                          </button>
                        ) : null}
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

function getNotificationTypeLabel(type: string | number) {
  const typeName = String(type);

  if (typeName === 'PesticideWarning') {
    return 'Upozorenje o pesticidima';
  }

  if (typeName === 'BatteryLow') {
    return 'Slaba baterija';
  }

  if (typeName === 'WeightDrop') {
    return 'Nagli pad težine';
  }

  if (typeName === 'SprayingChanged') {
    return 'Promena termina tretiranja';
  }

  if (typeName === 'SprayingCancelled') {
    return 'Otkazano tretiranje';
  }

  return typeName;
}

function getNotificationTone(notification: NotificationDto): StatusTone {
  if (notification.isRead) {
    return 'muted';
  }

  const typeName = String(notification.type);

  if (typeName === 'PesticideWarning' || typeName === 'SprayingCancelled') {
    return 'critical';
  }

  if (typeName === 'BatteryLow' || typeName === 'WeightDrop') {
    return 'warning';
  }

  return 'info';
}

function formatDate(value: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('sr-Latn-RS');
}
