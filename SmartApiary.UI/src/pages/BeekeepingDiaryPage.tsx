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
  type PagedResult,
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

  const loadInspections = useCallback(async (hiveId: string, nextPageNumber: number, nextPageSize: number) => {
    const response = await getHiveInspectionsByHive(hiveId, nextPageNumber, nextPageSize);
    setInspections(response.items);
    setPageNumber(response.pageNumber);
    setPageSize(nextPageSize);
    setTotalPages(response.totalPages);
    setTotalCount(response.totalCount);

    return response;
  }, []);

  const loadHivesAndInspections = useCallback(
    async (apiaryId: string) => {
      const hives = await getHivesByApiary(apiaryId);
      const nextHiveId = hives[0]?.id ?? '';

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
    },
    [loadInspections],
  );

  const fetchInspectionsForHive = useCallback(
    async (hiveId: string, nextPageNumber: number, nextPageSize: number) => {
      setLoading(true);
      setError(null);

      try {
        return await loadInspections(hiveId, nextPageNumber, nextPageSize);
      } catch {
        setInspections([]);
        setPageNumber(1);
        setTotalPages(1);
        setTotalCount(0);
        setError('Greška pri učitavanju');
        return null;
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
    setPageNumber(1);

    if (nextHiveId) {
      void fetchInspectionsForHive(nextHiveId, 1, pageSize);
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

      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 6;
      let cursorY = margin;

      const addLine = (text: string, fontSize = 10, bold = false) => {
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setFontSize(fontSize);
        const wrappedLines = pdf.splitTextToSize(text, contentWidth);

        if (cursorY + wrappedLines.length * lineHeight > pageHeight - margin) {
          pdf.addPage();
          cursorY = margin;
        }

        pdf.text(wrappedLines, margin, cursorY);
        cursorY += wrappedLines.length * lineHeight;
      };

      const addSpace = (size = 4) => {
        cursorY += size;
      };

      addLine('Karton košnice', 16, true);
      addSpace(2);
      addLine(`Pčelinjak: ${selectedApiary?.name ?? '-'}`);
      addLine(`Košnica: ${selectedHive?.label ?? '-'}`);
      addLine(`Ukupno zapisa: ${allInspections.totalCount}`);
      addSpace(4);

      const header = [
        'Datum',
        'Ramovi med',
        'Ramovi leglo',
        'Boja podnjače',
        'Med (kg)',
        'Matica',
        'Napomena',
      ];
      const columnWidths = [28, 20, 20, 28, 18, 16, 60];

      const drawRow = (values: string[], isHeader = false) => {
        const rowHeight = isHeader ? 8 : 10;

        if (cursorY + rowHeight > pageHeight - margin) {
          pdf.addPage();
          cursorY = margin;
        }

        let cursorX = margin;
        pdf.setFontSize(isHeader ? 9 : 8);
        pdf.setFont('helvetica', isHeader ? 'bold' : 'normal');

        values.forEach((value, index) => {
          const cellWidth = columnWidths[index];
          const wrapped = pdf.splitTextToSize(value, cellWidth - 2);
          const cellHeight = Math.max(rowHeight, wrapped.length * 4 + 2);

          if (cursorY + cellHeight > pageHeight - margin) {
            pdf.addPage();
            cursorY = margin;
            cursorX = margin;
          }

          pdf.rect(cursorX, cursorY, cellWidth, cellHeight);
          pdf.text(wrapped, cursorX + 1, cursorY + 4);
          cursorX += cellWidth;
        });

        cursorY += rowHeight + 2;
      };

      drawRow(header, true);

      allInspections.items.forEach((inspection) => {
        drawRow([
          formatDate(inspection.date),
          String(inspection.framesWithHoney),
          String(inspection.broodFrames),
          inspection.bottomBoardColor?.trim() ? inspection.bottomBoardColor : '-',
          formatWeightValue(inspection.honeyQuantityKg),
          inspection.queenPresent ? 'Da' : 'Ne',
          inspection.notes?.trim() ? inspection.notes.trim() : '-',
        ]);
      });

      pdf.save(`karton-kosnice-${selectedHive?.label ?? 'koznica'}.pdf`);
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
      header: 'Datum',
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
    <div className="page-stack">
      <PageHeader
        title="Pčelarski dnevnik"
        subtitle="Zapisi pregleda košnica i zapažanja sa terena"
        action={
          <div className="row-actions">
            <button
              className="secondary-action-button"
              disabled={!selectedHiveId || totalCount === 0}
              onClick={() => void handleExportPdf()}
              type="button"
            >
              PDF karton
            </button>
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
          </div>
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
              Strana {pageNumber} od {totalPages} · Ukupno zapisa: {totalCount}
            </div>

            <div className="row-actions">
              <button
                className="secondary-action-button"
                disabled={pageNumber <= 1 || loading}
                onClick={() => void handlePageChange(pageNumber - 1)}
                type="button"
              >
                Prethodna
              </button>
              <button
                className="secondary-action-button"
                disabled={pageNumber >= totalPages || loading}
                onClick={() => void handlePageChange(pageNumber + 1)}
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

  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatWeight(value: number) {
  return Number.isFinite(value) ? `${value.toFixed(2)} kg` : '-';
}

function formatWeightValue(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : '-';
}

function formatTextValue(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : <span className="muted-text">-</span>;
}
