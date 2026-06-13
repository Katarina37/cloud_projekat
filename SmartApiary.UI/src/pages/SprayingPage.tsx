import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { AlertTriangle, Bell, CalendarClock, CheckCircle2, FileDown, Plus, RotateCw, UsersRound, XCircle } from 'lucide-react';
import {
  cancelSpraying,
  getApiErrorMessage,
  getParcels,
  getSprayingByParcel,
  getSprayingNotificationStatus,
  type ParcelDto,
  type SprayingAnnouncementDto,
} from '../api/apiClient';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import CompleteSprayingModal from '../components/CompleteSprayingModal';
import PageHeader from '../components/PageHeader';
import RescheduleSprayingModal from '../components/RescheduleSprayingModal';
import SprayingFormModal from '../components/SprayingFormModal';
import StatusBadge, { type StatusTone } from '../components/StatusBadge';
import { exportSprayingHistoryPdf } from '../utils/exportSprayingHistoryPdf';

const loadingMessage = 'Učitavanje tretiranja...';
const loadErrorMessage = 'Greška pri učitavanju tretiranja.';
const noParcelsMessage = 'Prvo dodajte parcelu da biste mogli zakazati tretiranje.';
const emptyMessage = 'Nema zakazanih tretiranja za ovu parcelu.';

export default function SprayingPage() {
  const [parcels, setParcels] = useState<ParcelDto[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState('');
  const [announcements, setAnnouncements] = useState<SprayingAnnouncementDto[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [weatherWarning, setWeatherWarning] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reschedulingAnnouncement, setReschedulingAnnouncement] = useState<SprayingAnnouncementDto | null>(null);
  const [completingAnnouncement, setCompletingAnnouncement] = useState<SprayingAnnouncementDto | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notificationLoadingId, setNotificationLoadingId] = useState<string | null>(null);
  const [notificationCounts, setNotificationCounts] = useState<{ [id: string]: number }>({});

  async function loadSprayingForParcel(
    parcelId: string,
    nextPageNumber: number,
    nextPageSize: number,
    nextFromDate: string,
    nextToDate: string,
  ) {
    const result = await getSprayingByParcel(
      parcelId,
      toFromDateParameter(nextFromDate),
      toToDateParameter(nextToDate),
      nextPageNumber,
      nextPageSize,
    );

    setAnnouncements(result.items);
    setPageNumber(result.pageNumber);
    setPageSize(nextPageSize);
    setTotalPages(result.totalPages);
    setTotalCount(result.totalCount);

    return result;
  }

  async function fetchSprayingForParcel(
    parcelId: string,
    nextPageNumber = 1,
    nextPageSize = pageSize,
    nextFromDate = fromDate,
    nextToDate = toDate,
  ) {
    setLoading(true);
    setError(null);

    try {
      return await loadSprayingForParcel(
        parcelId,
        nextPageNumber,
        nextPageSize,
        nextFromDate,
        nextToDate,
      );
    } catch {
      setAnnouncements([]);
      setPageNumber(1);
      setTotalPages(1);
      setTotalCount(0);
      setError(loadErrorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function loadInitialData() {
    setLoading(true);
    setError(null);
    setActionError(null);
    setSuccessMessage(null);
    setWeatherWarning(null);

    try {
      const parcels = await getParcels();
      const nextParcelId = parcels.length > 0 ? parcels[0].id : '';

      setParcels(parcels);
      setSelectedParcelId(nextParcelId);
      setNotificationCounts({});

      if (nextParcelId) {
        await loadSprayingForParcel(nextParcelId, 1, 10, '', '');
      } else {
        setAnnouncements([]);
        setPageNumber(1);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch {
      setParcels([]);
      setSelectedParcelId('');
      setAnnouncements([]);
      setPageNumber(1);
      setTotalPages(1);
      setTotalCount(0);
      setNotificationCounts({});
      setError(loadErrorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Ucitavanje parcela i tretiranja za prvu izabranu parcelu.
    loadInitialData();
  }, []);

  async function refreshSelectedSpraying() {
    if (!selectedParcelId) {
      return false;
    }

    setNotificationCounts({});
    return fetchSprayingForParcel(selectedParcelId, pageNumber, pageSize, fromDate, toDate);
  }

  const handleParcelChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextParcelId = event.target.value;

    setSuccessMessage(null);
    setActionError(null);
    setWeatherWarning(null);
    setSelectedParcelId(nextParcelId);
    setAnnouncements([]);
    setPageNumber(1);
    setTotalPages(1);
    setTotalCount(0);
    setNotificationCounts({});

    if (!nextParcelId) {
      return;
    }

    await fetchSprayingForParcel(nextParcelId, 1, pageSize, fromDate, toDate);
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

  const handleSprayingCompleted = async () => {
    setActionError(null);
    setSuccessMessage(null);
    setWeatherWarning(null);

    const refreshed = await refreshSelectedSpraying();

    if (refreshed) {
      setSuccessMessage('Digitalni karton prskanja je uspešno sačuvan.');
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

  const handleFilterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedParcelId) {
      return;
    }

    setSuccessMessage(null);
    setActionError(null);
    await fetchSprayingForParcel(selectedParcelId, 1, pageSize, fromDate, toDate);
  };

  const handleClearFilters = async () => {
    setFromDate('');
    setToDate('');
    setSuccessMessage(null);
    setActionError(null);

    if (selectedParcelId) {
      await fetchSprayingForParcel(selectedParcelId, 1, pageSize, '', '');
    }
  };

  const handlePageChange = async (nextPageNumber: number) => {
    if (
      !selectedParcelId
      || nextPageNumber < 1
      || nextPageNumber === pageNumber
      || nextPageNumber > totalPages
    ) {
      return;
    }

    await fetchSprayingForParcel(selectedParcelId, nextPageNumber, pageSize, fromDate, toDate);
  };

  const handlePageSizeChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextPageSize = Number(event.target.value);

    if (!selectedParcelId || !Number.isFinite(nextPageSize) || nextPageSize <= 0) {
      return;
    }

    await fetchSprayingForParcel(selectedParcelId, 1, nextPageSize, fromDate, toDate);
  };

  const handleExportPdf = async () => {
    if (!selectedParcelId) {
      return;
    }

    setPdfLoading(true);
    setActionError(null);

    try {
      const result = await getSprayingByParcel(
        selectedParcelId,
        toFromDateParameter(fromDate),
        toToDateParameter(toDate),
        1,
        Math.max(totalCount, 1),
      );
      const completedTreatments = result.items.filter((item) => isCompletedSprayingStatus(item.status));

      if (completedTreatments.length === 0) {
        setActionError('Nema zavrsenih tretmana za PDF izvoz.');
        return;
      }

      const selectedParcel = parcels.find((parcel) => parcel.id === selectedParcelId);
      await exportSprayingHistoryPdf(
        selectedParcel ? selectedParcel.name : 'Parcela',
        completedTreatments,
        fromDate,
        toDate,
      );
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'Greska pri generisanju PDF kartona prskanja.'));
    } finally {
      setPdfLoading(false);
    }
  };

  const columns: DataTableColumn<SprayingAnnouncementDto>[] = [
    {
      header: 'Planirani početak',
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
      header: 'Kultura',
      render: (item) => item.cropName || <span className="muted-text">-</span>,
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
      header: 'Stvarni početak',
      render: (item) => (
        item.actualStartTime
          ? formatDateTime(item.actualStartTime)
          : <span className="muted-text">-</span>
      ),
    },
    {
      header: 'Stvarni kraj',
      render: (item) => (
        item.actualEndTime
          ? formatDateTime(item.actualEndTime)
          : <span className="muted-text">-</span>
      ),
    },
    {
      header: 'Napomena',
      render: (item) => item.note || <span className="muted-text">-</span>,
    },
    {
      header: 'Weather snapshot',
      render: (item) => formatWeather(item),
    },
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
        const actionsDisabled = actionLoadingId !== null;
        const notificationDisabled = notificationLoadingId !== null;

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
                  onClick={() => handleCancelSpraying(item)}
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
                onClick={() => {
                  setSuccessMessage(null);
                  setActionError(null);
                  setWeatherWarning(null);
                  setCompletingAnnouncement(item);
                }}
                type="button"
              >
                <CheckCircle2 size={16} />
                Završi prskanje
              </button>
            ) : null}

            <button
              className="secondary-action-button"
              disabled={notificationDisabled}
              onClick={() => handleNotificationStatus(item)}
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
        subtitle="Najave i digitalni karton prskanja za izabranu parcelu"
        action={
          <div className="row-actions">
            <button
              className="secondary-action-button"
              disabled={!selectedParcelId || totalCount === 0 || pdfLoading}
              onClick={handleExportPdf}
              type="button"
            >
              <FileDown size={18} />
              {pdfLoading ? 'PDF...' : 'PDF karton'}
            </button>
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
          </div>
        }
      />

      {parcels.length > 0 ? (
        <section className="section-card">
          <form className="filter-row" onSubmit={handleFilterSubmit}>
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

            <label>
              Od datuma
              <input
                disabled={loading}
                onChange={(event) => setFromDate(event.target.value)}
                type="date"
                value={fromDate}
              />
            </label>

            <label>
              Do datuma
              <input
                disabled={loading}
                onChange={(event) => setToDate(event.target.value)}
                type="date"
                value={toDate}
              />
            </label>

            <button className="secondary-action-button" disabled={loading} type="submit">
              Primeni filter
            </button>
            <button
              className="secondary-action-button"
              disabled={loading || (!fromDate && !toDate)}
              onClick={handleClearFilters}
              type="button"
            >
              Očisti
            </button>
          </form>
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
          <div className="filter-row">
            <label>
              Broj zapisa po strani
              <select disabled={loading} onChange={handlePageSizeChange} value={pageSize}>
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <div className="muted-text">
              Strana {pageNumber} od {totalPages} | Ukupno zapisa: {totalCount}
            </div>

            <div className="row-actions">
              <button
                className="secondary-action-button"
                disabled={pageNumber <= 1 || loading}
                onClick={() => handlePageChange(pageNumber - 1)}
                type="button"
              >
                Prethodna
              </button>
              <button
                className="secondary-action-button"
                disabled={pageNumber >= totalPages || loading}
                onClick={() => handlePageChange(pageNumber + 1)}
                type="button"
              >
                Sledeća
              </button>
            </div>
          </div>

          <DataTable columns={columns} rows={announcements} getRowKey={(item) => item.id} minWidth={1500} />
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

      {completingAnnouncement ? (
        <CompleteSprayingModal
          onClose={() => setCompletingAnnouncement(null)}
          onSaved={handleSprayingCompleted}
          spraying={completingAnnouncement}
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

function isCompletedSprayingStatus(status: string) {
  return status.toLowerCase() === 'completed';
}

function formatWeather(item: SprayingAnnouncementDto) {
  const weather = item.weatherSnapshot;

  if (!weather) {
    return <span className="muted-text">-</span>;
  }

  return `${weather.description || 'Bez opisa'}, ${weather.windSpeed.toFixed(1)} m/s, kiša: ${weather.hasRain ? 'da' : 'ne'}`;
}

function toFromDateParameter(value: string) {
  return value ? `${value}T00:00:00` : undefined;
}

function toToDateParameter(value: string) {
  return value ? `${value}T23:59:59.999` : undefined;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

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
