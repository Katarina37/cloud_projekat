// Stranica za prskanje i digitalni karton.

import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  FileDown,
  Filter,
  History,
  MapPinned,
  Plus,
  RotateCw,
  UsersRound,
  XCircle,
} from 'lucide-react';
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
  // Ovde drzimo filtere, stranice tabele, modale i poruke.
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
  const selectedParcel = parcels.find((parcel) => parcel.id === selectedParcelId);
  const scheduledOnPage = announcements.filter((item) => isScheduledSprayingStatus(item.status)).length;
  const completedOnPage = announcements.filter((item) => isCompletedSprayingStatus(item.status)).length;

  async function loadSprayingForParcel(
    parcelId: string,
    nextPageNumber: number,
    nextPageSize: number,
    nextFromDate: string,
    nextToDate: string,
  ) {
    // Backend vrati jednu stranicu rezultata.
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
      const completedTreatments: SprayingAnnouncementDto[] = [];
      const exportPageSize = 50;
      let exportPageNumber = 1;
      let exportTotalPages = 1;

      // Za PDF ucitamo sve stranice zavrsenih tretmana.
      while (exportPageNumber <= exportTotalPages) {
        const result = await getSprayingByParcel(
          selectedParcelId,
          toFromDateParameter(fromDate),
          toToDateParameter(toDate),
          exportPageNumber,
          exportPageSize,
        );

        completedTreatments.push(
          ...result.items.filter((item) => isCompletedSprayingStatus(item.status)),
        );
        exportTotalPages = result.totalPages;
        exportPageNumber += 1;
      }

      if (completedTreatments.length === 0) {
        setActionError('Nema zavrsenih tretmana za PDF izvoz.');
        return;
      }

      const selectedParcel = parcels.find((parcel) => parcel.id === selectedParcelId);
      // PDF helper od ovoga pravi karton prskanja.
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
    { header: 'Trajanje', render: (item) => `${item.durationHours} h` },
    {
      header: 'Preparat',
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
      header: 'Obavešteni pčelari',
      render: (item) => (
        <span className="inline-metric">
          <UsersRound size={15} />
          {item.notifiedBeekeepersCount} pčelara
        </span>
      ),
    },
    { header: 'Evidentirano', render: (item) => formatDateTime(item.createdAt) },
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
      header: 'Vremenski uslovi',
      render: (item) => formatWeather(item),
    },
    {
      header: 'Otkazano',
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
                  aria-label="Pomeri termin"
                  className="secondary-action-button orange-action-button icon-action-button"
                  disabled={actionsDisabled}
                  onClick={() => {
                    setSuccessMessage(null);
                    setActionError(null);
                    setWeatherWarning(null);
                    setReschedulingAnnouncement(item);
                  }}
                  title="Pomeri termin"
                  type="button"
                >
                  <RotateCw size={16} />
                </button>

                <button
                  aria-label={actionLoadingId === item.id ? 'Otkazivanje tretiranja' : 'Otkaži tretiranje'}
                  className="danger-action-button icon-action-button"
                  disabled={actionsDisabled}
                  onClick={() => handleCancelSpraying(item)}
                  title={actionLoadingId === item.id ? 'Otkazivanje tretiranja' : 'Otkaži tretiranje'}
                  type="button"
                >
                  <XCircle size={16} />
                </button>
              </>
            ) : null}

            {isScheduledSprayingStatus(item.status) ? (
              <button
                aria-label="Završi prskanje"
                className="secondary-action-button icon-action-button"
                disabled={actionsDisabled}
                onClick={() => {
                  setSuccessMessage(null);
                  setActionError(null);
                  setWeatherWarning(null);
                  setCompletingAnnouncement(item);
                }}
                title="Završi prskanje"
                type="button"
              >
                <CheckCircle2 size={16} />
              </button>
            ) : null}

            <button
              aria-label="Status obaveštenja"
              className="secondary-action-button icon-action-button"
              disabled={notificationDisabled}
              onClick={() => handleNotificationStatus(item)}
              title="Status obaveštenja"
              type="button"
            >
              <Bell size={16} />
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
    <div className="page-stack resource-page farmer-page spraying-page">
      <PageHeader
        title="Tretiranja pesticidima"
        subtitle="Planirajte tretmane, pratite obaveštenja pčelarima i vodite digitalni karton prskanja."
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

      <section className="farmer-summary-grid" aria-label="Pregled tretiranja">
        <article className="farmer-summary-card farmer-tone-land">
          <span className="farmer-summary-icon"><MapPinned aria-hidden="true" size={22} /></span>
          <div>
            <span>Izabrana parcela</span>
            <strong className="farmer-summary-name">{selectedParcel?.name ?? 'Nema parcele'}</strong>
            <small>{totalCount} tretiranja u rezultatu</small>
          </div>
        </article>
        <article className="farmer-summary-card farmer-tone-scheduled">
          <span className="farmer-summary-icon"><CalendarClock aria-hidden="true" size={22} /></span>
          <div>
            <span>Zakazana</span>
            <strong>{scheduledOnPage}</strong>
            <small>Na trenutno prikazanoj strani</small>
          </div>
        </article>
        <article className="farmer-summary-card farmer-tone-completed">
          <span className="farmer-summary-icon"><CheckCircle2 aria-hidden="true" size={22} /></span>
          <div>
            <span>Završena</span>
            <strong>{completedOnPage}</strong>
            <small>Na trenutno prikazanoj strani</small>
          </div>
        </article>
      </section>

      {parcels.length > 0 ? (
        <section className="section-card farmer-filter-card farmer-spraying-filter-card">
          <div className="farmer-filter-heading">
            <span className="farmer-filter-icon"><Filter aria-hidden="true" size={20} /></span>
            <div>
              <h2>Filter tretiranja</h2>
              <p>Sužite prikaz po parceli i periodu izvođenja.</p>
            </div>
          </div>
          <form className="farmer-filter-grid" onSubmit={handleFilterSubmit}>
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

      {loading ? (
        <section className="section-card resource-loading">
          <span className="resource-spinner" aria-hidden="true" />
          <div>
            <strong>{loadingMessage}</strong>
            <p>Učitavamo termine, statuse i podatke o obaveštenjima.</p>
          </div>
        </section>
      ) : null}

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

      {!loading && !error && parcels.length === 0 ? (
        <section className="section-card resource-empty-state">
          <span className="resource-empty-icon"><MapPinned aria-hidden="true" size={27} /></span>
          <h2>Nema parcela</h2>
          <p>{noParcelsMessage}</p>
        </section>
      ) : null}

      {!loading && !error && selectedParcelId && announcements.length === 0 ? (
        <section className="section-card resource-empty-state">
          <span className="resource-empty-icon"><CalendarClock aria-hidden="true" size={27} /></span>
          <h2>Nema tretiranja u izabranom periodu</h2>
          <p>{emptyMessage}</p>
          <button className="primary-button" onClick={() => setIsCreateModalOpen(true)} type="button">
            <Plus aria-hidden="true" size={18} />
            Zakaži tretiranje
          </button>
        </section>
      ) : null}

      {!loading && !error && selectedParcelId && announcements.length > 0 ? (
        <section className="section-card table-card farmer-table-card">
          <div className="farmer-table-header">
            <div>
              <span className="resource-eyebrow">Digitalni karton</span>
              <h2>Istorija tretiranja</h2>
              <p>Planirani i realizovani termini sa statusima obaveštavanja.</p>
            </div>
            <History aria-hidden="true" size={24} />
          </div>

          <div className="farmer-table-toolbar">
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

          <DataTable columns={columns} rows={announcements} getRowKey={(item) => item.id} minWidth={1580} />
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
