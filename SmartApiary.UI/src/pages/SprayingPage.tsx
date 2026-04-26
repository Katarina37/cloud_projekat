import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Bell, CalendarClock, CheckCircle2, Plus, RotateCw, UsersRound, XCircle } from 'lucide-react';
import {
  cancelSpraying,
  completeSpraying,
  getApiErrorMessage,
  getParcels,
  getSprayingByParcel,
  getSprayingNotificationStatus,
  type ParcelDto,
  type SprayingAnnouncementDto,
} from '../api/apiClient';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import RescheduleSprayingModal from '../components/RescheduleSprayingModal';
import SprayingFormModal from '../components/SprayingFormModal';
import StatusBadge, { type StatusTone } from '../components/StatusBadge';

const loadingMessage = 'Učitavanje tretiranja...';
const loadErrorMessage = 'Greška pri učitavanju tretiranja.';
const noParcelsMessage = 'Prvo dodajte parcelu da biste mogli zakazati tretiranje.';
const emptyMessage = 'Nema zakazanih tretiranja za ovu parcelu.';

export default function SprayingPage() {
  const [parcels, setParcels] = useState<ParcelDto[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState('');
  const [announcements, setAnnouncements] = useState<SprayingAnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [weatherWarning, setWeatherWarning] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reschedulingAnnouncement, setReschedulingAnnouncement] = useState<SprayingAnnouncementDto | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notificationLoadingId, setNotificationLoadingId] = useState<string | null>(null);
  const [notificationCounts, setNotificationCounts] = useState<Record<string, number>>({});

  const loadSprayingForParcel = useCallback(async (parcelId: string) => {
    const announcements = await getSprayingByParcel(parcelId);
    setAnnouncements(announcements);
  }, []);

  const fetchSprayingForParcel = useCallback(
    async (parcelId: string) => {
      setLoading(true);
      setError(null);

      try {
        await loadSprayingForParcel(parcelId);
        return true;
      } catch {
        setAnnouncements([]);
        setError(loadErrorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loadSprayingForParcel],
  );

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);
    setSuccessMessage(null);
    setWeatherWarning(null);

    try {
      const parcels = await getParcels();
      const nextParcelId = parcels[0]?.id ?? '';

      setParcels(parcels);
      setSelectedParcelId(nextParcelId);
      setNotificationCounts({});

      if (nextParcelId) {
        await loadSprayingForParcel(nextParcelId);
      } else {
        setAnnouncements([]);
      }
    } catch {
      setParcels([]);
      setSelectedParcelId('');
      setAnnouncements([]);
      setNotificationCounts({});
      setError(loadErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [loadSprayingForParcel]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const refreshSelectedSpraying = useCallback(async () => {
    if (!selectedParcelId) {
      return false;
    }

    setNotificationCounts({});
    return fetchSprayingForParcel(selectedParcelId);
  }, [fetchSprayingForParcel, selectedParcelId]);

  const handleParcelChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextParcelId = event.target.value;

    setSuccessMessage(null);
    setActionError(null);
    setWeatherWarning(null);
    setSelectedParcelId(nextParcelId);
    setAnnouncements([]);
    setNotificationCounts({});

    if (!nextParcelId) {
      return;
    }

    await fetchSprayingForParcel(nextParcelId);
  };

  const handleSprayingCreated = async (nextWeatherWarning: string | null) => {
    const refreshed = await refreshSelectedSpraying();

    if (refreshed) {
      setSuccessMessage('Tretiranje je uspešno zakazano.');
      setWeatherWarning(nextWeatherWarning);
    }
  };

  const handleSprayingRescheduled = async (nextWeatherWarning: string | null) => {
    const refreshed = await refreshSelectedSpraying();

    if (refreshed) {
      setSuccessMessage('Termin tretiranja je uspešno pomeren.');
      setWeatherWarning(nextWeatherWarning);
    }
  };

  const handleCancelSpraying = async (announcement: SprayingAnnouncementDto) => {
    const confirmed = window.confirm('Da li želite da otkažete tretiranje?');

    if (!confirmed) {
      return;
    }

    setActionLoadingId(announcement.id);
    setActionError(null);
    setSuccessMessage(null);
    setWeatherWarning(null);

    try {
      await cancelSpraying(announcement.id);
      const refreshed = await refreshSelectedSpraying();

      if (refreshed) {
        setSuccessMessage('Tretiranje je uspešno otkazano.');
      }
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'Greška pri otkazivanju tretiranja.'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteSpraying = async (announcement: SprayingAnnouncementDto) => {
    const confirmed = window.confirm('Da li želite da označite tretiranje kao završeno?');

    if (!confirmed) {
      return;
    }

    setActionLoadingId(announcement.id);
    setActionError(null);
    setSuccessMessage(null);
    setWeatherWarning(null);

    try {
      await completeSpraying(announcement.id);
      const refreshed = await refreshSelectedSpraying();

      if (refreshed) {
        setSuccessMessage('Tretiranje je označeno kao završeno.');
      }
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'Greška pri završavanju tretiranja.'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleNotificationStatus = async (announcement: SprayingAnnouncementDto) => {
    setNotificationLoadingId(announcement.id);
    setActionError(null);

    try {
      const count = await getSprayingNotificationStatus(announcement.id);
      setNotificationCounts((currentCounts) => ({
        ...currentCounts,
        [announcement.id]: count,
      }));
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'Greška pri učitavanju statusa obaveštenja.'));
    } finally {
      setNotificationLoadingId(null);
    }
  };

  const columns: DataTableColumn<SprayingAnnouncementDto>[] = [
    {
      header: 'StartTime',
      render: (item) => (
        <span className="inline-metric">
          <CalendarClock size={15} />
          {formatDateTime(item.startTime)}
        </span>
      ),
    },
    { header: 'DurationHours', render: (item) => `${item.durationHours} h` },
    {
      header: 'PreparationType',
      render: (item) => item.preparationType || <span className="muted-text">-</span>,
    },
    {
      header: 'Status',
      render: (item) => <StatusBadge tone={getSprayingStatusTone(item.status)}>{item.status || '-'}</StatusBadge>,
    },
    {
      header: 'NotifiedBeekeepersCount',
      render: (item) => (
        <span className="inline-metric">
          <UsersRound size={15} />
          {item.notifiedBeekeepersCount} pčelara
        </span>
      ),
    },
    { header: 'CreatedAt', render: (item) => formatDateTime(item.createdAt) },
    {
      header: 'CancelledAt',
      render: (item) => (item.cancelledAt ? formatDateTime(item.cancelledAt) : <span className="muted-text">-</span>),
    },
    {
      header: 'Akcije',
      className: 'table-actions-cell',
      render: (item) => {
        const notificationCount = notificationCounts[item.id];
        const notificationLoaded = notificationCount !== undefined;
        const actionsDisabled = Boolean(actionLoadingId);
        const notificationDisabled = Boolean(notificationLoadingId);

        return (
          <div className="row-actions">
            {!isFinalSprayingStatus(item.status) ? (
              <>
                <button
                  className="secondary-action-button orange-action-button"
                  disabled={actionsDisabled}
                  onClick={() => {
                    setSuccessMessage(null);
                    setActionError(null);
                    setWeatherWarning(null);
                    setReschedulingAnnouncement(item);
                  }}
                  type="button"
                >
                  <RotateCw size={16} />
                  Pomeri termin
                </button>

                <button
                  className="danger-action-button"
                  disabled={actionsDisabled}
                  onClick={() => void handleCancelSpraying(item)}
                  type="button"
                >
                  <XCircle size={16} />
                  {actionLoadingId === item.id ? 'Otkazivanje...' : 'Otkaži'}
                </button>
              </>
            ) : null}

            {isScheduledSprayingStatus(item.status) ? (
              <button
                className="secondary-action-button"
                disabled={actionsDisabled}
                onClick={() => void handleCompleteSpraying(item)}
                type="button"
              >
                <CheckCircle2 size={16} />
                {actionLoadingId === item.id ? 'Čuvanje...' : 'Označi kao završeno'}
              </button>
            ) : null}

            <button
              className="secondary-action-button"
              disabled={notificationDisabled}
              onClick={() => void handleNotificationStatus(item)}
              type="button"
            >
              <Bell size={16} />
              {notificationLoadingId === item.id ? 'Učitavanje...' : 'Status obaveštenja'}
            </button>

            {notificationLoaded ? (
              <span className="inline-metric muted-text">Obavešteno pčelara: {notificationCount}</span>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Tretiranja pesticidima"
        subtitle="Najave za izabranu parcelu"
        action={
          <button
            className="primary-button orange-button"
            disabled={!selectedParcelId}
            onClick={() => {
              setSuccessMessage(null);
              setActionError(null);
              setWeatherWarning(null);
              setIsCreateModalOpen(true);
            }}
            type="button"
          >
            <Plus size={18} />
            Zakaži tretiranje
          </button>
        }
      />

      {parcels.length > 0 ? (
        <section className="section-card">
          <div className="filter-row">
            <label>
              Parcela
              <select disabled={loading} onChange={handleParcelChange} value={selectedParcelId}>
                {parcels.map((parcel) => (
                  <option key={parcel.id} value={parcel.id}>
                    {parcel.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
      ) : null}

      {loading ? <section className="section-card">{loadingMessage}</section> : null}

      {successMessage ? <section className="section-card message-card success">{successMessage}</section> : null}

      {weatherWarning ? (
        <section className="section-card message-card warning weather-warning-card" role="status">
          <span className="weather-warning-icon" aria-hidden="true">
            <AlertTriangle size={20} />
          </span>
          <span>{weatherWarning}</span>
        </section>
      ) : null}

      {actionError ? (
        <section className="section-card message-card error" role="alert">
          {actionError}
        </section>
      ) : null}

      {!loading && error ? (
        <section className="section-card message-card error" role="alert">
          {error}
        </section>
      ) : null}

      {!loading && !error && parcels.length === 0 ? <section className="section-card">{noParcelsMessage}</section> : null}

      {!loading && !error && selectedParcelId && announcements.length === 0 ? (
        <section className="section-card">{emptyMessage}</section>
      ) : null}

      {!loading && !error && selectedParcelId && announcements.length > 0 ? (
        <section className="section-card table-card">
          <DataTable columns={columns} rows={announcements} getRowKey={(item) => item.id} minWidth={1180} />
        </section>
      ) : null}

      {isCreateModalOpen ? (
        <SprayingFormModal
          onClose={() => setIsCreateModalOpen(false)}
          onSaved={handleSprayingCreated}
          selectedParcelId={selectedParcelId}
        />
      ) : null}

      {reschedulingAnnouncement ? (
        <RescheduleSprayingModal
          onClose={() => setReschedulingAnnouncement(null)}
          onSaved={handleSprayingRescheduled}
          spraying={reschedulingAnnouncement}
        />
      ) : null}
    </div>
  );
}

function getSprayingStatusTone(status: string): StatusTone {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === 'cancelled') {
    return 'critical';
  }

  if (normalizedStatus === 'completed') {
    return 'good';
  }

  if (normalizedStatus === 'scheduled') {
    return 'warning';
  }

  return 'muted';
}

function isFinalSprayingStatus(status: string) {
  const normalizedStatus = status.toLowerCase();

  return normalizedStatus === 'cancelled' || normalizedStatus === 'completed';
}

function isScheduledSprayingStatus(status: string) {
  return status.toLowerCase() === 'scheduled';
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || '-';
  }

  return date.toLocaleString('sr-Latn-RS', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
