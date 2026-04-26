import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  deleteHiveInspection,
  getApiaries,
  getApiErrorMessage,
  getHiveInspectionsByHive,
  getHivesByApiary,
  type ApiaryDto,
  type HiveDto,
  type HiveInspectionDto,
} from '../api/apiClient';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import HiveInspectionFormModal from '../components/HiveInspectionFormModal';
import PageHeader from '../components/PageHeader';

export default function BeekeepingDiaryPage() {
  const [apiaries, setApiaries] = useState<ApiaryDto[]>([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState('');
  const [hives, setHives] = useState<HiveDto[]>([]);
  const [selectedHiveId, setSelectedHiveId] = useState('');
  const [inspections, setInspections] = useState<HiveInspectionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<HiveInspectionDto | null>(null);
  const [deletingInspectionId, setDeletingInspectionId] = useState<string | null>(null);

  const loadInspections = useCallback(async (hiveId: string) => {
    const inspections = await getHiveInspectionsByHive(hiveId);
    setInspections(inspections);
  }, []);

  const loadHivesAndInspections = useCallback(
    async (apiaryId: string) => {
      const hives = await getHivesByApiary(apiaryId);
      const nextHiveId = hives[0]?.id ?? '';

      setHives(hives);
      setSelectedHiveId(nextHiveId);

      if (nextHiveId) {
        await loadInspections(nextHiveId);
      } else {
        setInspections([]);
      }
    },
    [loadInspections],
  );

  const fetchInspectionsForHive = useCallback(
    async (hiveId: string) => {
      setLoading(true);
      setError(null);

      try {
        await loadInspections(hiveId);
        return true;
      } catch {
        setInspections([]);
        setError('Greška pri učitavanju');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loadInspections],
  );

  const fetchHivesForApiary = useCallback(
    async (apiaryId: string) => {
      setLoading(true);
      setError(null);

      try {
        await loadHivesAndInspections(apiaryId);
        return true;
      } catch {
        setHives([]);
        setSelectedHiveId('');
        setInspections([]);
        setError('Greška pri učitavanju');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loadHivesAndInspections],
  );

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiaries = await getApiaries();
      const nextApiaryId = apiaries[0]?.id ?? '';

      setApiaries(apiaries);
      setSelectedApiaryId(nextApiaryId);

      if (nextApiaryId) {
        await loadHivesAndInspections(nextApiaryId);
      } else {
        setHives([]);
        setSelectedHiveId('');
        setInspections([]);
      }
    } catch {
      setApiaries([]);
      setSelectedApiaryId('');
      setHives([]);
      setSelectedHiveId('');
      setInspections([]);
      setError('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  }, [loadHivesAndInspections]);

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
      setSelectedHiveId('');
      setInspections([]);
    }
  };

  const handleHiveChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextHiveId = event.target.value;

    setSuccessMessage(null);
    setSelectedHiveId(nextHiveId);

    if (nextHiveId) {
      void fetchInspectionsForHive(nextHiveId);
    } else {
      setInspections([]);
    }
  };

  const handleInspectionCreated = async () => {
    if (selectedHiveId) {
      const refreshed = await fetchInspectionsForHive(selectedHiveId);

      if (refreshed) {
        setSuccessMessage('Zapis je uspešno dodat.');
      }
    }
  };

  const handleInspectionUpdated = async () => {
    if (selectedHiveId) {
      const refreshed = await fetchInspectionsForHive(selectedHiveId);

      if (refreshed) {
        setSuccessMessage('Zapis je uspešno izmenjen.');
      }
    }
  };

  const handleDeleteInspection = async (inspection: HiveInspectionDto) => {
    const confirmed = window.confirm(`Da li želite da obrišete zapis od ${formatDate(inspection.date)}?`);

    if (!confirmed) {
      return;
    }

    setDeletingInspectionId(inspection.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteHiveInspection(inspection.id);

      if (selectedHiveId) {
        const refreshed = await fetchInspectionsForHive(selectedHiveId);

        if (refreshed) {
          setSuccessMessage('Zapis je uspešno obrisan.');
        }
      }
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greška pri brisanju zapisa.'));
    } finally {
      setDeletingInspectionId(null);
    }
  };

  const columns: DataTableColumn<HiveInspectionDto>[] = [
    {
      header: 'Datum',
      render: (inspection) => (
        <div className="table-title">
          <strong>{formatDate(inspection.date)}</strong>
        </div>
      ),
    },
    { header: 'Ramovi sa medom', render: (inspection) => inspection.framesWithHoney },
    { header: 'Ramovi legla', render: (inspection) => inspection.broodFrames },
    {
      header: 'Matica',
      render: (inspection) => (
        <span className={`status-badge ${inspection.queenPresent ? 'good' : 'warning'}`}>
          {inspection.queenPresent ? 'Da' : 'Ne'}
        </span>
      ),
    },
    {
      header: 'Napomena',
      render: (inspection) => {
        const notes = inspection.notes?.trim();
        return notes ? notes : <span className="muted-text">-</span>;
      },
    },
    {
      header: 'Akcije',
      className: 'table-actions-cell',
      render: (inspection) => (
        <div className="row-actions">
          <button
            className="secondary-action-button"
            disabled={deletingInspectionId === inspection.id}
            onClick={() => {
              setSuccessMessage(null);
              setEditingInspection(inspection);
            }}
            type="button"
          >
            <Pencil size={16} />
            Izmeni
          </button>
          <button
            className="danger-action-button"
            disabled={deletingInspectionId === inspection.id}
            onClick={() => void handleDeleteInspection(inspection)}
            type="button"
          >
            <Trash2 size={16} />
            {deletingInspectionId === inspection.id ? 'Brisanje...' : 'Obriši'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Pčelarski dnevnik"
        subtitle="Zapisi pregleda košnica i zapažanja sa terena"
        action={
          <button
            className="primary-button apiary-add-button"
            disabled={!selectedHiveId}
            onClick={() => {
              setSuccessMessage(null);
              setIsCreateModalOpen(true);
            }}
            type="button"
          >
            <Plus size={18} />
            Dodaj zapis
          </button>
        }
      />

      {apiaries.length > 0 ? (
        <section className="section-card">
          <div className="device-filter-grid">
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

            <label>
              Košnica
              <select disabled={loading || hives.length === 0} onChange={handleHiveChange} value={selectedHiveId}>
                {hives.map((hive) => (
                  <option key={hive.id} value={hive.id}>
                    {hive.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
      ) : null}

      {loading ? <section className="section-card">Učitavanje dnevnika...</section> : null}

      {successMessage ? <section className="section-card message-card success">{successMessage}</section> : null}

      {error ? (
        <section className="section-card message-card error" role="alert">
          {error}
        </section>
      ) : null}

      {!loading && !error && apiaries.length === 0 ? (
        <section className="section-card">Prvo dodajte pčelinjak da biste vodili dnevnik.</section>
      ) : null}

      {!loading && !error && selectedApiaryId && hives.length === 0 ? (
        <section className="section-card">Prvo dodajte košnicu za izabrani pčelinjak.</section>
      ) : null}

      {!loading && !error && selectedHiveId && inspections.length === 0 ? (
        <section className="section-card">Nema zapisa za ovu košnicu</section>
      ) : null}

      {!loading && !error && selectedHiveId && inspections.length > 0 ? (
        <section className="section-card table-card">
          <DataTable columns={columns} rows={inspections} getRowKey={(inspection) => inspection.id} minWidth={980} />
        </section>
      ) : null}

      {isCreateModalOpen ? (
        <HiveInspectionFormModal
          onClose={() => setIsCreateModalOpen(false)}
          onSaved={handleInspectionCreated}
          selectedHiveId={selectedHiveId}
        />
      ) : null}

      {editingInspection ? (
        <HiveInspectionFormModal
          inspection={editingInspection}
          onClose={() => setEditingInspection(null)}
          onSaved={handleInspectionUpdated}
          selectedHiveId={selectedHiveId}
        />
      ) : null}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
