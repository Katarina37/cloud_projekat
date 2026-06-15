// Stranica za kosnice.

import { type ChangeEvent, useEffect, useState } from 'react';
import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  Crown,
  MapPinned,
  PackageOpen,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  deleteHive,
  getApiaries,
  getApiErrorMessage,
  getHivesByApiary,
  type ApiaryDto,
  type HiveDto,
  type HiveType,
} from '../api/apiClient';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import HiveFormModal from '../components/HiveFormModal';
import PageHeader from '../components/PageHeader';

export default function HivesPage() {
  const [apiaries, setApiaries] = useState<ApiaryDto[]>([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState('');
  const [hives, setHives] = useState<HiveDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHive, setEditingHive] = useState<HiveDto | null>(null);
  const [deletingHiveId, setDeletingHiveId] = useState<string | null>(null);
  const selectedApiary = apiaries.find((apiary) => apiary.id === selectedApiaryId);
  const averageQueenAge =
    hives.length > 0
      ? hives.reduce((total, hive) => total + hive.queenAgeYears, 0) / hives.length
      : 0;

  async function loadHives(apiaryId: string) {
    const hives = await getHivesByApiary(apiaryId);
    setHives(hives);
  }

  async function fetchHivesForApiary(apiaryId: string) {
    setLoading(true);
    setError(null);

    try {
      await loadHives(apiaryId);
      return true;
    } catch (error) {
      setHives([]);
      setError(getApiErrorMessage(error, 'Greška pri učitavanju košnica.'));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function fetchInitialData() {
    setLoading(true);
    setError(null);

    try {
      const apiaries = await getApiaries();
      const nextSelectedApiaryId = apiaries.length > 0 ? apiaries[0].id : '';

      setApiaries(apiaries);
      setSelectedApiaryId(nextSelectedApiaryId);

      if (nextSelectedApiaryId) {
        await loadHives(nextSelectedApiaryId);
      } else {
        setHives([]);
      }
    } catch (error) {
      setApiaries([]);
      setSelectedApiaryId('');
      setHives([]);
      setError(getApiErrorMessage(error, 'Greška pri učitavanju košnica.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleApiaryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextApiaryId = event.target.value;

    setSuccessMessage(null);
    setSelectedApiaryId(nextApiaryId);

    if (nextApiaryId) {
      fetchHivesForApiary(nextApiaryId);
    } else {
      setHives([]);
    }
  };

  const handleHiveCreated = async () => {
    if (selectedApiaryId) {
      const refreshed = await fetchHivesForApiary(selectedApiaryId);

      if (refreshed) {
        setSuccessMessage('Košnica je uspešno dodata.');
      }
    }
  };

  const handleHiveUpdated = async () => {
    if (selectedApiaryId) {
      const refreshed = await fetchHivesForApiary(selectedApiaryId);

      if (refreshed) {
        setSuccessMessage('Košnica je uspešno izmenjena.');
      }
    }
  };

  const handleDeleteHive = async (hive: HiveDto) => {
    const confirmed = window.confirm(`Da li želite da obrišete košnicu "${hive.label}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingHiveId(hive.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteHive(hive.id);

      if (selectedApiaryId) {
        const refreshed = await fetchHivesForApiary(selectedApiaryId);

        if (refreshed) {
          setSuccessMessage('Košnica je uspešno obrisana.');
        }
      }
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greška pri brisanju košnice.'));
    } finally {
      setDeletingHiveId(null);
    }
  };

  const columns: DataTableColumn<HiveDto>[] = [
    {
      header: 'Košnica',
      render: (hive) => (
        <div className="table-title">
          <strong>{hive.label}</strong>
          <span>Dodato {formatDate(hive.createdAt)}</span>
        </div>
      ),
    },
    {
      header: 'Tip',
      render: (hive) => <span className="hive-type-pill">{formatHiveType(hive.type)}</span>,
    },
    {
      header: 'Boja sanduka',
      render: (hive) => hive.boxColor,
    },
    {
      header: 'Starost matice',
      render: (hive) => formatQueenAge(hive.queenAgeYears),
    },
    {
      header: 'Beleške',
      render: (hive) => {
        const notes = hive.notes ? hive.notes.trim() : '';
        return notes ? notes : <span className="muted-text">Nema beleški</span>;
      },
    },
    {
      header: 'Akcije',
      className: 'table-actions-cell',
      render: (hive) => (
        <div className="row-actions">
          <button
            aria-label="Izmeni košnicu"
            className="secondary-action-button icon-action-button"
            disabled={deletingHiveId === hive.id}
            onClick={() => {
              setSuccessMessage(null);
              setEditingHive(hive);
            }}
            title="Izmeni košnicu"
            type="button"
          >
            <Pencil size={16} />
          </button>
          <button
            aria-label={deletingHiveId === hive.id ? 'Brisanje košnice' : 'Obriši košnicu'}
            className="danger-action-button icon-action-button"
            disabled={deletingHiveId === hive.id}
            onClick={() => handleDeleteHive(hive)}
            title={deletingHiveId === hive.id ? 'Brisanje košnice' : 'Obriši košnicu'}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack resource-page hives-page">
      <PageHeader
        title="Košnice"
        subtitle="Organizujte košnice po pčelinjaku i održavajte njihove osnovne podatke na jednom mestu."
        action={
          <button
            className="primary-button apiary-add-button"
            disabled={!selectedApiaryId}
            onClick={() => {
              setSuccessMessage(null);
              setIsCreateModalOpen(true);
            }}
            type="button"
          >
            <Plus size={18} />
            Dodaj košnicu
          </button>
        }
      />

      {!loading && apiaries.length > 0 ? (
        <section className="resource-summary-grid" aria-label="Pregled košnica">
          <article className="resource-summary-card resource-tone-hive">
            <div className="resource-summary-icon">
              <Boxes size={22} />
            </div>
            <div>
              <span>Ukupno košnica</span>
              <strong>{hives.length}</strong>
              <small>u izabranom pčelinjaku</small>
            </div>
          </article>
          <article className="resource-summary-card resource-tone-apiary">
            <div className="resource-summary-icon">
              <MapPinned size={22} />
            </div>
            <div>
              <span>Aktivni pčelinjak</span>
              <strong className="resource-summary-name">{selectedApiary?.name ?? 'Nije izabran'}</strong>
              <small>
                {apiaries.length} {apiaries.length === 1 ? 'pčelinjak' : 'pčelinjaka'} ukupno
              </small>
            </div>
          </article>
          <article className="resource-summary-card resource-tone-queen">
            <div className="resource-summary-icon">
              <Crown size={22} />
            </div>
            <div>
              <span>Prosečna starost matice</span>
              <strong>
                {averageQueenAge.toLocaleString('sr-Latn-RS', { maximumFractionDigits: 1 })}
              </strong>
              <small>godina po košnici</small>
            </div>
          </article>
        </section>
      ) : null}

      {apiaries.length > 0 ? (
        <section className="section-card resource-filter-card">
          <div className="resource-filter-heading">
            <div className="resource-filter-icon">
              <MapPinned size={19} />
            </div>
            <div>
              <h2>Izaberite pčelinjak</h2>
              <p>Prikazane su samo košnice koje pripadaju izabranom pčelinjaku.</p>
            </div>
          </div>
          <div className="filter-row resource-filter-control">
            <label>
              Pčelinjak za pregled
              <select disabled={loading} onChange={handleApiaryChange} value={selectedApiaryId}>
                {apiaries.map((apiary) => (
                  <option key={apiary.id} value={apiary.id}>
                    {apiary.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
      ) : null}

      {loading ? (
        <section className="section-card resource-loading" aria-busy="true" aria-live="polite">
          <span className="resource-spinner" />
          <div>
            <strong>Učitavanje košnica</strong>
            <p>Pripremamo podatke za izabrani pčelinjak.</p>
          </div>
        </section>
      ) : null}

      {successMessage ? (
        <section className="section-card message-card success resource-feedback" role="status">
          <CheckCircle2 size={20} />
          <strong>{successMessage}</strong>
        </section>
      ) : null}

      {error ? (
        <section className="section-card message-card error resource-feedback" role="alert">
          <AlertCircle size={20} />
          <strong>{error}</strong>
        </section>
      ) : null}

      {!loading && !error && apiaries.length === 0 ? (
        <section className="section-card resource-empty-state">
          <div className="resource-empty-icon">
            <MapPinned size={28} />
          </div>
          <h2>Najpre dodajte pčelinjak</h2>
          <p>Košnice se uvek vezuju za pčelinjak, pa je potrebno da prvo kreirate njegovu lokaciju.</p>
        </section>
      ) : null}

      {!loading && !error && selectedApiaryId && hives.length === 0 ? (
        <section className="section-card resource-empty-state">
          <div className="resource-empty-icon">
            <PackageOpen size={28} />
          </div>
          <h2>Još nema košnica</h2>
          <p>
            Dodajte prvu košnicu za pčelinjak „{selectedApiary?.name}“ i počnite da pratite njene
            podatke.
          </p>
          <button className="primary-button" onClick={() => setIsCreateModalOpen(true)} type="button">
            <Plus size={18} />
            Dodaj prvu košnicu
          </button>
        </section>
      ) : null}

      {!loading && !error && selectedApiaryId && hives.length > 0 ? (
        <section className="section-card table-card resource-table-card">
          <div className="resource-table-header">
            <div>
              <span className="resource-eyebrow">Evidencija</span>
              <h2>Košnice u pčelinjaku</h2>
              <p>{selectedApiary?.name} · {formatHiveCount(hives.length)}</p>
            </div>
          </div>
          <DataTable columns={columns} rows={hives} getRowKey={(hive) => hive.id} minWidth={960} />
        </section>
      ) : null}

      {isCreateModalOpen ? (
        <HiveFormModal
          onClose={() => setIsCreateModalOpen(false)}
          onSaved={handleHiveCreated}
          selectedApiaryId={selectedApiaryId}
        />
      ) : null}

      {editingHive ? (
        <HiveFormModal
          hive={editingHive}
          onClose={() => setEditingHive(null)}
          onSaved={handleHiveUpdated}
          selectedApiaryId={selectedApiaryId}
        />
      ) : null}
    </div>
  );
}

function formatHiveType(type: HiveType) {
  if (typeof type === 'string') {
    return type;
  }

  if (type === 0) {
    return 'LR';
  }

  if (type === 1) {
    return 'DB';
  }

  if (type === 2) {
    return 'Poloska';
  }

  return 'Ostalo';
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('sr-Latn-RS', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
}

function formatQueenAge(value: number) {
  const lastTwoDigits = value % 100;
  const lastDigit = value % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${value} godina`;
  }

  if (lastDigit === 1) {
    return `${value} godina`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${value} godine`;
  }

  return `${value} godina`;
}

function formatHiveCount(value: number) {
  const lastTwoDigits = value % 100;
  const lastDigit = value % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${value} košnica`;
  }

  if (lastDigit === 1) {
    return `${value} košnica`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${value} košnice`;
  }

  return `${value} košnica`;
}
