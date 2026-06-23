// Stranica sa pcelarskim dnevnikom.

import { type ChangeEvent, useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  FileDown,
  MapPinned,
  Pencil,
  Plus,
  Trash2,
  Warehouse,
} from 'lucide-react';
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
import diaryBanner from '../assets/banners/diary-banner.png';
import DataTable, { type DataTableColumn } from '../components/DataTable';
import HiveInspectionFormModal from '../components/HiveInspectionFormModal';
import PageHeader from '../components/PageHeader';
import { exportHiveInspectionsPdf } from '../utils/exportHiveInspectionsPdf';

export default function BeekeepingDiaryPage() {
  const [apiaries, setApiaries] = useState<ApiaryDto[]>([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState('');
  const [hives, setHives] = useState<HiveDto[]>([]);
  const [selectedHiveId, setSelectedHiveId] = useState('');
  const [inspections, setInspections] = useState<HiveInspectionDto[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<HiveInspectionDto | null>(null);
  const [deletingInspectionId, setDeletingInspectionId] = useState<string | null>(null);
  const selectedApiary = apiaries.find((apiary) => apiary.id === selectedApiaryId);
  const selectedHive = hives.find((hive) => hive.id === selectedHiveId);

  async function loadInspections(hiveId: string, nextPageNumber: number, nextPageSize: number) {
    const response = await getHiveInspectionsByHive(hiveId, nextPageNumber, nextPageSize);
    setInspections(response.items);
    setPageNumber(response.pageNumber);
    setPageSize(nextPageSize);
    setTotalPages(response.totalPages);
    setTotalCount(response.totalCount);

    return response;
  }

  async function loadHivesAndInspections(apiaryId: string) {
    const hives = await getHivesByApiary(apiaryId);
    const nextHiveId = hives.length > 0 ? hives[0].id : '';

    setHives(hives);
    setSelectedHiveId(nextHiveId);
    setPageNumber(1);
    setTotalPages(1);
    setTotalCount(0);

    if (nextHiveId) {
      await loadInspections(nextHiveId, 1, 10);
    } else {
      setInspections([]);
    }
  }

  async function fetchInspectionsForHive(hiveId: string, nextPageNumber: number, nextPageSize: number) {
    setLoading(true);
    setError(null);

    try {
      return await loadInspections(hiveId, nextPageNumber, nextPageSize);
    } catch {
      setInspections([]);
      setPageNumber(1);
      setTotalPages(1);
      setTotalCount(0);
      setError('Greška pri učitavanju.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function fetchHivesForApiary(apiaryId: string) {
    setLoading(true);
    setError(null);

    try {
      await loadHivesAndInspections(apiaryId);
      return true;
    } catch {
      setHives([]);
      setSelectedHiveId('');
      setInspections([]);
      setError('Greška pri učitavanju.');
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
      const nextApiaryId = apiaries.length > 0 ? apiaries[0].id : '';

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
      setError('Greška pri učitavanju.');
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
      setSelectedHiveId('');
      setInspections([]);
    }
  };

  const handleHiveChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextHiveId = event.target.value;

    setSuccessMessage(null);
    setSelectedHiveId(nextHiveId);
    setPageNumber(1);

    if (nextHiveId) {
      fetchInspectionsForHive(nextHiveId, 1, pageSize);
    } else {
      setInspections([]);
      setTotalPages(1);
      setTotalCount(0);
    }
  };

  const handleInspectionCreated = async () => {
    if (selectedHiveId) {
      const refreshed = await fetchInspectionsForHive(selectedHiveId, pageNumber, pageSize);

      if (refreshed) {
        setSuccessMessage('Zapis je uspešno dodat.');
      }
    }
  };

  const handleInspectionUpdated = async () => {
    if (selectedHiveId) {
      const refreshed = await fetchInspectionsForHive(selectedHiveId, pageNumber, pageSize);

      if (refreshed) {
        setSuccessMessage('Zapis je uspešno izmenjen.');
      }
    }
  };

  const handleExportPdf = async () => {
    if (!selectedHiveId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const allInspections = await getHiveInspectionsByHive(selectedHiveId, 1, Math.max(totalCount, 1));
      const selectedApiary = apiaries.find((apiary) => apiary.id === selectedApiaryId);
      const selectedHive = hives.find((hive) => hive.id === selectedHiveId);
      const apiaryName = selectedApiary ? selectedApiary.name : '-';
      const hiveLabel = selectedHive ? selectedHive.label : 'košnica';

      await exportHiveInspectionsPdf(
        apiaryName,
        hiveLabel,
        allInspections.items,
        allInspections.totalCount,
      );
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greška pri generisanju PDF kartona košnice.'));
    } finally {
      setLoading(false);
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
        const refreshed = await fetchInspectionsForHive(selectedHiveId, pageNumber, pageSize);

        if (refreshed) {
          if (refreshed.items.length === 0 && refreshed.pageNumber > 1) {
            await fetchInspectionsForHive(selectedHiveId, refreshed.pageNumber - 1, pageSize);
          }

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
      header: 'Datum i vreme',
      render: (inspection) => (
        <div className="table-title">
          <strong>{formatDate(inspection.date)}</strong>
        </div>
      ),
    },
    { header: 'Ramovi sa medom', render: (inspection) => inspection.framesWithHoney },
    { header: 'Ramovi legla', render: (inspection) => inspection.broodFrames },
    { header: 'Boja podnjače', render: (inspection) => formatTextValue(inspection.bottomBoardColor) },
    { header: 'Količina meda (kg)', render: (inspection) => formatWeight(inspection.honeyQuantityKg) },
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
      className: 'table-text-cell',
      render: (inspection) => {
        const notes = inspection.notes ? inspection.notes.trim() : '';
        return notes ? notes : <span className="muted-text">-</span>;
      },
    },
    {
      header: 'Akcije',
      className: 'table-actions-cell',
      render: (inspection) => (
        <div className="row-actions">
          <button
            aria-label="Izmeni zapis"
            className="secondary-action-button icon-action-button"
            disabled={deletingInspectionId === inspection.id}
            onClick={() => {
              setSuccessMessage(null);
              setEditingInspection(inspection);
            }}
            title="Izmeni zapis"
            type="button"
          >
            <Pencil size={16} />
          </button>
          <button
            aria-label={deletingInspectionId === inspection.id ? 'Brisanje zapisa' : 'Obriši zapis'}
            className="danger-action-button icon-action-button"
            disabled={deletingInspectionId === inspection.id}
            onClick={() => handleDeleteInspection(inspection)}
            title={deletingInspectionId === inspection.id ? 'Brisanje zapisa' : 'Obriši zapis'}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const handlePageChange = async (nextPageNumber: number) => {
    if (!selectedHiveId || nextPageNumber < 1 || nextPageNumber === pageNumber || nextPageNumber > totalPages) {
      return;
    }

    await fetchInspectionsForHive(selectedHiveId, nextPageNumber, pageSize);
  };

  const handlePageSizeChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextPageSize = Number(event.target.value);

    if (!selectedHiveId || !Number.isFinite(nextPageSize) || nextPageSize <= 0) {
      return;
    }

    await fetchInspectionsForHive(selectedHiveId, 1, nextPageSize);
  };

  return (
    <div className="page-stack resource-page diary-page banner-page">
      <PageHeader
        bannerImage={diaryBanner}
        title="Pčelarski dnevnik"
        subtitle="Vodite urednu istoriju pregleda košnica, stanja matice, prinosa meda i zapažanja sa terena."
        action={
          <div className="row-actions page-banner-actions">
            <button
              aria-label="Preuzmi PDF karton košnice"
              className="secondary-action-button page-banner-action page-banner-action-secondary"
              disabled={!selectedHiveId || totalCount === 0}
              onClick={handleExportPdf}
              type="button"
            >
              <FileDown aria-hidden="true" size={19} />
              <span className="page-banner-action-label">PDF karton</span>
            </button>
            <button
              aria-label="Dodaj zapis u pčelarski dnevnik"
              className="primary-button apiary-add-button page-banner-action"
              disabled={!selectedHiveId}
              onClick={() => {
                setSuccessMessage(null);
                setIsCreateModalOpen(true);
              }}
              type="button"
            >
              <Plus aria-hidden="true" size={20} />
              <span className="page-banner-action-label">Dodaj zapis</span>
            </button>
          </div>
        }
      />

      {!loading && apiaries.length > 0 ? (
        <section className="resource-summary-grid" aria-label="Pregled pčelarskog dnevnika">
          <article className="resource-summary-card diary-tone-records">
            <div className="resource-summary-icon">
              <BookOpenCheck size={22} />
            </div>
            <div>
              <span>Ukupno zapisa</span>
              <strong>{totalCount}</strong>
              <small>za izabranu košnicu</small>
            </div>
          </article>
          <article className="resource-summary-card resource-tone-apiary">
            <div className="resource-summary-icon">
              <MapPinned size={22} />
            </div>
            <div>
              <span>Aktivni pčelinjak</span>
              <strong className="resource-summary-name">{selectedApiary?.name ?? 'Nije izabran'}</strong>
              <small>{apiaries.length} dostupno</small>
            </div>
          </article>
          <article className="resource-summary-card diary-tone-hive">
            <div className="resource-summary-icon">
              <Warehouse size={22} />
            </div>
            <div>
              <span>Košnica za pregled</span>
              <strong className="resource-summary-name">{selectedHive?.label ?? 'Nije izabrana'}</strong>
              <small>{hives.length} u aktivnom pčelinjaku</small>
            </div>
          </article>
        </section>
      ) : null}

      {apiaries.length > 0 ? (
        <section className="section-card resource-filter-card diary-filter-card">
          <div className="resource-filter-heading">
            <div className="resource-filter-icon">
              <BookOpenCheck size={19} />
            </div>
            <div>
              <h2>Izaberite karton košnice</h2>
              <p>Zapisi i PDF karton se prikazuju samo za trenutno izabranu košnicu.</p>
            </div>
          </div>
          <div className="device-filter-grid diary-filter-grid">
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

      {loading ? (
        <section className="section-card resource-loading" aria-busy="true" aria-live="polite">
          <span className="resource-spinner" />
          <div>
            <strong>Učitavanje pčelarskog dnevnika</strong>
            <p>Pripremamo zapise za izabranu košnicu.</p>
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
          <p>Pčelarski dnevnik se vodi po košnici, zato je prvo potreban pčelinjak.</p>
        </section>
      ) : null}

      {!loading && !error && selectedApiaryId && hives.length === 0 ? (
        <section className="section-card resource-empty-state">
          <div className="resource-empty-icon">
            <Warehouse size={28} />
          </div>
          <h2>Još nema košnica</h2>
          <p>Dodajte košnicu u pčelinjak „{selectedApiary?.name}“ da biste vodili njen karton.</p>
        </section>
      ) : null}

      {!loading && !error && selectedHiveId && inspections.length === 0 ? (
        <section className="section-card resource-empty-state">
          <div className="resource-empty-icon">
            <BookOpenCheck size={28} />
          </div>
          <h2>Još nema zapisa</h2>
          <p>Zabeležite prvi pregled košnice „{selectedHive?.label}“ i započnite njenu istoriju.</p>
          <button className="primary-button" onClick={() => setIsCreateModalOpen(true)} type="button">
            <Plus size={18} />
            Dodaj prvi zapis
          </button>
        </section>
      ) : null}

      {!loading && !error && selectedHiveId && inspections.length > 0 ? (
        <section className="section-card table-card resource-table-card diary-table-card">
          <div className="resource-table-header">
            <div>
              <span className="resource-eyebrow">Karton košnice</span>
              <h2>Istorija pregleda</h2>
              <p>{selectedApiary?.name} · {selectedHive?.label} · {formatRecordCount(totalCount)}</p>
            </div>
          </div>
          <div className="diary-table-toolbar">
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

            <div className="diary-table-summary">
              Strana {pageNumber} od {totalPages} · Ukupno zapisa: {totalCount}
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

          <DataTable columns={columns} rows={inspections} getRowKey={(inspection) => inspection.id} minWidth={1180} />
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

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('sr-Latn-RS', {
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
}

function formatWeight(value: number) {
  return Number.isFinite(value) ? `${value.toFixed(2)} kg` : '-';
}

function formatTextValue(value: string | null | undefined) {
  const trimmed = value ? value.trim() : '';

  return trimmed ? trimmed : <span className="muted-text">-</span>;
}

function formatRecordCount(value: number) {
  const lastTwoDigits = value % 100;
  const lastDigit = value % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${value} zapisa`;
  }

  if (lastDigit === 1) {
    return `${value} zapis`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${value} zapisa`;
  }

  return `${value} zapisa`;
}
