import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  getApiaries,
  getHivesByApiary,
  type ApiaryDto,
  type HiveDto,
  type HiveType,
} from '../api/apiClient';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import HiveFormModal from '../components/HiveFormModal';
import PageHeader from '../components/PageHeader';

const HIVE_TYPE_LABELS: Record<0 | 1 | 2 | 3, string> = {
  0: 'LR',
  1: 'DB',
  2: 'Poloska',
  3: 'Other',
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
];

export default function HivesPage() {
  const [apiaries, setApiaries] = useState<ApiaryDto[]>([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState('');
  const [hives, setHives] = useState<HiveDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
      } catch {
        setHives([]);
        setError('Greška pri učitavanju košnica.');
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
    } catch {
      setApiaries([]);
      setSelectedApiaryId('');
      setHives([]);
      setError('Greška pri učitavanju košnica.');
    } finally {
      setLoading(false);
    }
  }, [loadHives]);

  useEffect(() => {
    void fetchInitialData();
  }, [fetchInitialData]);

  const handleApiaryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextApiaryId = event.target.value;

    setSelectedApiaryId(nextApiaryId);

    if (nextApiaryId) {
      void fetchHivesForApiary(nextApiaryId);
    } else {
      setHives([]);
    }
  };

  const handleHiveCreated = async () => {
    if (selectedApiaryId) {
      await fetchHivesForApiary(selectedApiaryId);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Košnice"
        subtitle="Oznaka, tip, boja sanduka i osnovni podaci"
        action={
          <button
            className="primary-button apiary-add-button"
            disabled={!selectedApiaryId}
            onClick={() => setIsCreateModalOpen(true)}
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

      {error ? (
        <section className="section-card" style={{ color: 'var(--danger)' }}>
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
          <DataTable columns={columns} rows={hives} getRowKey={(hive) => hive.id} minWidth={940} />
        </section>
      ) : null}

      {isCreateModalOpen ? (
        <HiveFormModal
          onClose={() => setIsCreateModalOpen(false)}
          onHiveCreated={handleHiveCreated}
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
