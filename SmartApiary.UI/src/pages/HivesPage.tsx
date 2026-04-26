import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  deleteHive,
  getApiaries,
  getApiErrorMessage,
  getHivesByApiary,
  type ApiaryDto,
  type HiveDto,
  type HiveType,
  type HiveTypeValue,
} from '../api/apiClient';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import HiveFormModal from '../components/HiveFormModal';
import PageHeader from '../components/PageHeader';

const HIVE_TYPE_LABELS: Record<HiveTypeValue, string> = {
  0: 'LR',
  1: 'DB',
  2: 'Poloska',
  3: 'Other',
};

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

  const loadHives = useCallback(async (apiaryId: string) => {
    const hives = await getHivesByApiary(apiaryId);
    setHives(hives);
  }, []);

  const fetchHivesForApiary = useCallback(
    async (apiaryId: string) => {
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
    },
    [loadHives],
  );

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiaries = await getApiaries();
      const nextSelectedApiaryId = apiaries[0]?.id ?? '';

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
  }, [loadHives]);

  useEffect(() => {
    void fetchInitialData();
  }, [fetchInitialData]);

  const handleApiaryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextApiaryId = event.target.value;

    setSuccessMessage(null);
    setSelectedApiaryId(nextApiaryId);

    if (nextApiaryId) {
      void fetchHivesForApiary(nextApiaryId);
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
      header: 'Label',
      render: (hive) => (
        <div className="table-title">
          <strong>{hive.label}</strong>
        </div>
      ),
    },
    { header: 'Type', render: (hive) => formatHiveType(hive.type) },
    { header: 'BoxColor', render: (hive) => hive.boxColor },
    { header: 'QueenAgeYears', render: (hive) => hive.queenAgeYears },
    {
      header: 'Notes',
      render: (hive) => {
        const notes = hive.notes?.trim();
        return notes ? notes : <span className="muted-text">-</span>;
      },
    },
    { header: 'CreatedAt', render: (hive) => formatDate(hive.createdAt) },
    {
      header: 'Akcije',
      className: 'table-actions-cell',
      render: (hive) => (
        <div className="row-actions">
          <button
            className="secondary-action-button"
            disabled={deletingHiveId === hive.id}
            onClick={() => {
              setSuccessMessage(null);
              setEditingHive(hive);
            }}
            type="button"
          >
            <Pencil size={16} />
            Izmeni
          </button>
          <button
            className="danger-action-button"
            disabled={deletingHiveId === hive.id}
            onClick={() => void handleDeleteHive(hive)}
            type="button"
          >
            <Trash2 size={16} />
            {deletingHiveId === hive.id ? 'Brisanje...' : 'Obriši'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Košnice"
        subtitle="Oznaka, tip, boja sanduka i osnovni podaci"
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

      {apiaries.length > 0 ? (
        <section className="section-card">
          <div className="filter-row">
            <label>
              Pčelinjak
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

      {loading ? <section className="section-card">Učitavanje košnica...</section> : null}

      {successMessage ? <section className="section-card message-card success">{successMessage}</section> : null}

      {error ? (
        <section className="section-card message-card error" role="alert">
          {error}
        </section>
      ) : null}

      {!loading && !error && apiaries.length === 0 ? (
        <section className="section-card">Prvo dodajte pčelinjak da biste mogli dodati košnice.</section>
      ) : null}

      {!loading && !error && selectedApiaryId && hives.length === 0 ? (
        <section className="section-card">Nema unetih košnica za ovaj pčelinjak.</section>
      ) : null}

      {!loading && !error && selectedApiaryId && hives.length > 0 ? (
        <section className="section-card table-card">
          <DataTable columns={columns} rows={hives} getRowKey={(hive) => hive.id} minWidth={1120} />
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

  return HIVE_TYPE_LABELS[type] ?? String(type);
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
