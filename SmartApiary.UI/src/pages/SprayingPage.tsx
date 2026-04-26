import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { CalendarClock, UsersRound } from 'lucide-react';
import {
  getApiErrorMessage,
  getParcels,
  getSprayingByParcel,
  type ParcelDto,
  type SprayingAnnouncementDto,
} from '../api/apiClient';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

const loadingMessage = 'Učitavanje tretiranja...';
const loadErrorMessage = 'Greška pri učitavanju tretiranja.';
const emptyMessage = 'Nema podataka za prikaz';

const columns: DataTableColumn<SprayingAnnouncementDto>[] = [
  {
    header: 'Početak',
    render: (item) => (
      <span className="inline-metric">
        <CalendarClock size={15} />
        {formatDateTime(item.startTime)}
      </span>
    ),
  },
  { header: 'Trajanje', render: (item) => `${item.durationHours} h` },
  { header: 'Preparat', render: (item) => item.preparationType || <span className="muted-text">-</span> },
  { header: 'Status', render: (item) => <StatusBadge tone="muted">{item.status || '-'}</StatusBadge> },
  {
    header: 'Obavešteno',
    render: (item) => (
      <span className="inline-metric">
        <UsersRound size={15} />
        {item.notifiedBeekeepersCount} pčelara
      </span>
    ),
  },
  { header: 'Kreirano', render: (item) => formatDateTime(item.createdAt) },
];

export default function SprayingPage() {
  const [parcels, setParcels] = useState<ParcelDto[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState('');
  const [announcements, setAnnouncements] = useState<SprayingAnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSprayingForParcel = useCallback(async (parcelId: string) => {
    const announcements = await getSprayingByParcel(parcelId);
    setAnnouncements(announcements);
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const parcels = await getParcels();
      const nextParcelId = parcels[0]?.id ?? '';

      setParcels(parcels);
      setSelectedParcelId(nextParcelId);

      if (nextParcelId) {
        await loadSprayingForParcel(nextParcelId);
      } else {
        setAnnouncements([]);
      }
    } catch (requestError) {
      setParcels([]);
      setSelectedParcelId('');
      setAnnouncements([]);
      setError(getApiErrorMessage(requestError, loadErrorMessage));
    } finally {
      setLoading(false);
    }
  }, [loadSprayingForParcel]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const handleParcelChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextParcelId = event.target.value;

    setSelectedParcelId(nextParcelId);
    setAnnouncements([]);

    if (!nextParcelId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loadSprayingForParcel(nextParcelId);
    } catch (requestError) {
      setAnnouncements([]);
      setError(getApiErrorMessage(requestError, loadErrorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader title="Tretiranja pesticidima" subtitle="Najave za izabranu parcelu" />

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

      {!loading && error ? (
        <section className="section-card message-card error" role="alert">
          {loadErrorMessage}
        </section>
      ) : null}

      {!loading && !error && (parcels.length === 0 || announcements.length === 0) ? (
        <section className="section-card">{emptyMessage}</section>
      ) : null}

      {!loading && !error && announcements.length > 0 ? (
        <section className="section-card table-card">
          <DataTable columns={columns} rows={announcements} getRowKey={(item) => item.id} minWidth={920} />
        </section>
      ) : null}
    </div>
  );
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
