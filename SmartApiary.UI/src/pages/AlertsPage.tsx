// Stranica za alarme i njihova podesavanja.

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Inbox,
  LoaderCircle,
  MailOpen,
  RefreshCw,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import {
  getAlertSettings,
  getApiErrorMessage,
  getNotifications,
  markNotificationAsRead,
  type AlertSettingsDto,
  type NotificationDto,
} from '../api/apiClient';
import alertsBanner from '../assets/banners/alerts-banner.png';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import SettingsModal from '../components/SettingsModal';
import StatusBadge from '../components/StatusBadge';

const loadingMessage = 'Učitavanje obavještenja...';
const loadErrorMessage = 'Greška pri učitavanju obavještenja.';
const markAsReadErrorMessage = 'Greška pri označavanju obavještenja.';
const markAsReadSuccessMessage = 'Obavještenje je označeno kao pročitano.';
const settingsLoadErrorMessage = 'Greška pri učitavanju pragova upozorenja.';
const settingsSavedMessage = 'Prag upozorenja je sačuvan.';
const defaultWeightDropThresholdKg = 10;

type NotificationFilter = 'all' | 'unread' | 'read';

export default function AlertsPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null);
  const [alertSettings, setAlertSettings] = useState<AlertSettingsDto | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  async function loadNotifications() {
    setLoading(true);
    setLoadError(null);
    setFeedbackError(null);
    setSuccessMessage(null);

    try {
      const nextNotifications = await getNotifications();
      setNotifications(nextNotifications);
    } catch (requestError) {
      setNotifications([]);
      setLoadError(getApiErrorMessage(requestError, loadErrorMessage));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const readCount = notifications.length - unreadCount;
  const hasLoadError = loadError !== null;

  const visibleNotifications = useMemo(() => {
    return [...notifications]
      .filter((notification) => {
        if (filter === 'unread') {
          return !notification.isRead;
        }

        if (filter === 'read') {
          return notification.isRead;
        }

        return true;
      })
      .sort((first, second) => {
        return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
      });
  }, [filter, notifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingNotificationId(notificationId);
    setFeedbackError(null);
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
      setFeedbackError(getApiErrorMessage(requestError, markAsReadErrorMessage));
    } finally {
      setMarkingNotificationId(null);
    }
  };

  const handleOpenSettings = async () => {
    setSettingsLoading(true);
    setFeedbackError(null);
    setSuccessMessage(null);

    try {
      const nextSettings = await getAlertSettings();
      setAlertSettings(nextSettings);
      setIsSettingsModalOpen(true);
    } catch (requestError) {
      setFeedbackError(getApiErrorMessage(requestError, settingsLoadErrorMessage));
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSettingsSaved = async () => {
    setIsSettingsModalOpen(false);
    setSuccessMessage(settingsSavedMessage);
  };

  return (
    <div className="page-stack alerts-page banner-page">
      <PageHeader
        bannerImage={alertsBanner}
        title="Upozorenja"
        subtitle="Brz pregled važnih događaja i promjena u vašim pčelinjacima"
        action={
          <button
            aria-label={settingsLoading ? 'Učitavanje pragova upozorenja' : 'Pragovi upozorenja'}
            className="alerts-settings-link page-banner-action page-banner-action-secondary"
            disabled={settingsLoading}
            onClick={() => void handleOpenSettings()}
            type="button"
          >
            {settingsLoading ? (
              <LoaderCircle className="alerts-spinner" size={18} aria-hidden="true" />
            ) : (
              <SlidersHorizontal size={18} aria-hidden="true" />
            )}
            <span className="page-banner-action-label">
              {settingsLoading ? 'Učitavanje pragova...' : 'Pragovi upozorenja'}
            </span>
          </button>
        }
      />

      {loading ? <AlertsLoadingState /> : null}

      {!loading && hasLoadError ? (
        <section className="section-card alerts-feedback alerts-feedback-error" role="alert">
          <div className="alerts-feedback-icon" aria-hidden="true">
            <AlertTriangle size={20} />
          </div>
          <div>
            <strong>Nismo uspjeli učitati upozorenja</strong>
            <p>{loadError}</p>
          </div>
          <button className="secondary-action-button" onClick={() => void loadNotifications()} type="button">
            <RefreshCw size={16} />
            Pokušaj ponovo
          </button>
        </section>
      ) : null}

      {!loading && successMessage ? (
        <div className="alerts-toast" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          {successMessage}
        </div>
      ) : null}

      {!loading && feedbackError ? (
        <div className="alerts-toast alerts-toast-error" role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          {feedbackError}
        </div>
      ) : null}

      {!loading && !hasLoadError ? (
        <>
          <section
            className="alerts-summary-grid"
            aria-label="Filtriraj obavještenja"
            role="group"
          >
            <SummaryFilterCard
              active={filter === 'unread'}
              count={unreadCount}
              description={unreadCount === 0 ? 'Sve je pregledano' : 'Čeka vašu pažnju'}
              filter="unread"
              icon={BellRing}
              label="Nepročitano"
              onSelect={setFilter}
              tone="unread"
            />
            <SummaryFilterCard
              active={filter === 'read'}
              count={readCount}
              description={readCount === 0 ? 'Još nema pregledanih' : 'Već pregledane stavke'}
              filter="read"
              icon={MailOpen}
              label="Pročitano"
              onSelect={setFilter}
              tone="read"
            />
            <SummaryFilterCard
              active={filter === 'all'}
              count={notifications.length}
              description="Sva obavještenja"
              filter="all"
              icon={Inbox}
              label="Sve"
              onSelect={setFilter}
              tone="total"
            />
          </section>

          <SectionCard
            className="alerts-center-card"
            title={getListTitle(filter)}
            subtitle={getListSubtitle(filter, visibleNotifications.length, unreadCount)}
            icon={<BellRing size={19} />}
          >
            {visibleNotifications.length > 0 ? (
              <div className="alert-list alerts-list">
                {visibleNotifications.map((notification, index) => {
                  const Icon = notification.isRead ? CheckCircle2 : BellRing;
                  const key = notification.id || `${notification.title}-${notification.createdAt}-${index}`;
                  const isMarking = markingNotificationId === notification.id;

                  return (
                    <article
                      className={`alert-card alerts-list-card ${
                        notification.isRead ? 'is-read' : 'is-unread'
                      }`}
                      key={key}
                    >
                      <div className="alert-icon" aria-hidden="true">
                        <Icon size={28} strokeWidth={1.8} />
                      </div>
                      <div className="alert-content">
                        <div className="alerts-notification-header">
                          <div className="alerts-notification-copy">
                            <div className="alerts-notification-eyebrow">
                              <span className="alerts-type-label">
                                {getNotificationTypeLabel(notification.type)}
                              </span>
                              <span className="alerts-date">
                                <CalendarClock size={14} aria-hidden="true" />
                                <time dateTime={notification.createdAt}>
                                  {formatDate(notification.createdAt)}
                                </time>
                              </span>
                            </div>
                            <h3>{notification.title}</h3>
                          </div>
                          <StatusBadge tone={notification.isRead ? 'good' : 'warning'}>
                            {notification.isRead ? 'Pročitano' : 'Nepročitano'}
                          </StatusBadge>
                        </div>

                        <p className="alerts-notification-message">{notification.message}</p>

                        {!notification.isRead ? (
                          <div className="alerts-notification-action">
                            <button
                              className="alerts-read-button"
                              disabled={isMarking}
                              onClick={() => void handleMarkAsRead(notification.id)}
                              type="button"
                            >
                              {isMarking ? (
                                <LoaderCircle className="alerts-spinner" size={16} aria-hidden="true" />
                              ) : (
                                <CheckCircle2 size={16} aria-hidden="true" />
                              )}
                              {isMarking ? 'Označavanje...' : 'Označi kao pročitano'}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={filter === 'unread' ? <CheckCircle2 size={24} /> : <Inbox size={24} />}
                title={getEmptyStateTitle(filter)}
                description={getEmptyStateDescription(filter)}
              />
            )}
          </SectionCard>
        </>
      ) : null}

      {isSettingsModalOpen ? (
        <SettingsModal
          initialWeightDropThresholdKg={
            alertSettings?.weightDropThresholdKg ?? defaultWeightDropThresholdKg
          }
          onClose={() => setIsSettingsModalOpen(false)}
          onSaved={handleSettingsSaved}
        />
      ) : null}
    </div>
  );
}

type SummaryFilterCardProps = {
  active: boolean;
  count: number;
  description: string;
  filter: NotificationFilter;
  icon: LucideIcon;
  label: string;
  onSelect: (filter: NotificationFilter) => void;
  tone: 'unread' | 'read' | 'total';
};

function SummaryFilterCard({
  active,
  count,
  description,
  filter,
  icon: Icon,
  label,
  onSelect,
  tone,
}: SummaryFilterCardProps) {
  return (
    <button
      aria-label={`${label}: ${count} obavještenja`}
      aria-pressed={active}
      className={`alerts-summary-card is-${tone}${active ? ' is-active' : ''}`}
      onClick={() => onSelect(filter)}
      type="button"
    >
      <span className="alerts-summary-icon" aria-hidden="true">
        <Icon size={21} />
      </span>
      <span className="alerts-summary-content">
        <span className="alerts-summary-label">{label}</span>
        <strong>{count}</strong>
        <small>{description}</small>
      </span>
      <span className="alerts-summary-active-label" aria-hidden="true">
        <CheckCircle2 size={14} />
        Aktivno
      </span>
    </button>
  );
}

function AlertsLoadingState() {
  return (
    <section className="section-card alerts-loading" aria-live="polite" aria-busy="true">
      <span className="visually-hidden">{loadingMessage}</span>
      <div className="alerts-loading-summary">
        <span />
        <span />
        <span />
      </div>
      <div className="alerts-loading-list">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}

function getListTitle(filter: NotificationFilter) {
  if (filter === 'unread') {
    return 'Nepročitana obavještenja';
  }

  if (filter === 'read') {
    return 'Pročitana obavještenja';
  }

  return 'Sva obavještenja';
}

function getListSubtitle(
  filter: NotificationFilter,
  visibleCount: number,
  unreadCount: number,
) {
  if (visibleCount === 0) {
    return 'Nova upozorenja će se pojaviti ovdje';
  }

  if (filter === 'all') {
    return unreadCount === 0
      ? `${visibleCount} ukupno · sve je pregledano`
      : `${visibleCount} ukupno · ${unreadCount} čeka pregled`;
  }

  return `${visibleCount} ${visibleCount === 1 ? 'obavještenje' : 'obavještenja'} u ovom prikazu`;
}

function getEmptyStateTitle(filter: NotificationFilter) {
  if (filter === 'unread') {
    return 'Sve je pregledano';
  }

  if (filter === 'read') {
    return 'Još nema pročitanih obavještenja';
  }

  return 'Još nema obavještenja';
}

function getEmptyStateDescription(filter: NotificationFilter) {
  if (filter === 'unread') {
    return 'Trenutno nemate nepročitanih upozorenja.';
  }

  if (filter === 'read') {
    return 'Obavještenja koja pregledate pojaviće se ovdje.';
  }

  return 'Nova upozorenja i važne promjene pojaviće se na ovom mjestu.';
}

function getNotificationTypeLabel(type: string | number) {
  const typeName = String(type);
  const typeLabels: Record<string, string> = {
    '0': 'Upozorenje o pesticidima',
    '1': 'Slaba baterija',
    '2': 'Nagli pad težine',
    '3': 'Promjena termina tretiranja',
    '4': 'Otkazano tretiranje',
    PesticideWarning: 'Upozorenje o pesticidima',
    BatteryLow: 'Slaba baterija',
    WeightDrop: 'Nagli pad težine',
    SprayingChanged: 'Promjena termina tretiranja',
    SprayingCancelled: 'Otkazano tretiranje',
  };

  return typeLabels[typeName] ?? typeName;
}

function formatDate(value: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const monthNames = [
    'jan',
    'feb',
    'mar',
    'apr',
    'maj',
    'jun',
    'jul',
    'aug',
    'sep',
    'okt',
    'nov',
    'dec',
  ];
  const time = new Intl.DateTimeFormat('bs-BA', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  return `${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}. · ${time}`;
}
