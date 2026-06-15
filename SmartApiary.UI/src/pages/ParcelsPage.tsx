// Stranica za parcele i mapu.

import { useEffect, useState } from 'react';
import {
  CalendarDays,
  FileDown,
  MapPinned,
  Pencil,
  Plus,
  Sprout,
  Trash2,
  Wheat,
} from 'lucide-react';
import {
  deleteParcel,
  getApiErrorMessage,
  getCropsByParcel,
  getParcels,
  type CropDto,
  type ParcelDto,
} from '../api/apiClient';
import parcelCardBackground from '../assets/card_backgrounds/parcelaBackground.png';
import MapView, { type MapItem } from '../components/MapView';
import ParcelFormModal from '../components/ParcelFormModal';
import { exportMapPdf } from '../utils/exportMapPdf';

type ParcelWithCrops = {
  parcel: ParcelDto;
  crops: CropDto[];
};

export default function ParcelsPage() {
  const [parcels, setParcels] = useState<ParcelDto[]>([]);
  const [parcelsWithCrops, setParcelsWithCrops] = useState<ParcelWithCrops[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<ParcelDto | null>(null);
  const [deletingParcelId, setDeletingParcelId] = useState<string | null>(null);

  async function fetchParcels() {
    setLoading(true);
    setError(null);

    try {
      const loadedParcels = await getParcels();
      const loadedParcelsWithCrops = await Promise.all(
        loadedParcels.map(async (parcel) => ({
          parcel,
          crops: await getCropsByParcel(parcel.id),
        })),
      );

      setParcels(loadedParcels);
      setParcelsWithCrops(loadedParcelsWithCrops);
      return true;
    } catch {
      setParcels([]);
      setParcelsWithCrops([]);
      setError('Greška pri učitavanju parcela.');
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchParcels();
  }, []);

  const handleParcelCreated = async () => {
    const refreshed = await fetchParcels();

    if (refreshed) {
      setSuccessMessage('Parcela je uspešno dodata.');
    }
  };

  const handleParcelUpdated = async () => {
    const refreshed = await fetchParcels();

    if (refreshed) {
      setSuccessMessage('Parcela je uspešno izmenjena.');
    }
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedParcel(null);
  };

  const handleDeleteParcel = async (parcel: ParcelDto) => {
    const confirmed = window.confirm(`Da li želite da obrišete parcelu "${parcel.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingParcelId(parcel.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteParcel(parcel.id);
      const refreshed = await fetchParcels();

      if (refreshed) {
        setSuccessMessage('Parcela je uspešno obrisana.');
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Greška pri brisanju parcele.'));
    } finally {
      setDeletingParcelId(null);
    }
  };

  const handleExportMap = async () => {
    setError(null);

    try {
      await exportMapPdf();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Greška pri generisanju PDF-a.'));
    }
  };

  const mapItems: MapItem[] = parcelsWithCrops.length > 0
    ? parcelsWithCrops.map(({ parcel, crops }) => ({
        id: parcel.id,
        name: parcel.name,
        latitude: parcel.latitude,
        longitude: parcel.longitude,
        type: 'parcel',
        crops: crops.map((crop) => ({
          name: crop.name,
          expectedBloomingStart: crop.expectedBloomingStart,
          expectedBloomingEnd: crop.expectedBloomingEnd,
          area: crop.area,
          notes: crop.notes,
        })),
      }))
    : parcels.map((parcel) => ({
        id: parcel.id,
        name: parcel.name,
        latitude: parcel.latitude,
        longitude: parcel.longitude,
        type: 'parcel',
      }));

  const selectedParcelCrops = selectedParcel
    ? parcelsWithCrops.find((item) => item.parcel.id === selectedParcel.id)?.crops ?? []
    : [];

  return (
    <div className="page-stack apiaries-page farmer-parcels-page map-hero-page">
      <section className="apiary-map-panel" aria-label="Mapa parcela">
        <MapView
          className="apiary-map-canvas"
          items={mapItems}
          height="100%"
          zoom={11}
          onSelect={(item) => {
            const foundParcel = parcels.find((parcel) => parcel.id === item.id) ?? null;

            if (foundParcel) {
              setSelectedParcel(foundParcel);
              setEditModalOpen(true);
            }
          }}
        />

        <div className="map-hero-heading">
          <span>Pregled zemljišta</span>
          <h1>Parcele</h1>
          <p>Lokacije parcela i pregled evidentiranih kultura</p>
        </div>

        <div className="map-hero-actions">
          <button
            aria-label="Izvezi mapu u PDF"
            className="map-hero-action map-hero-action-secondary"
            onClick={handleExportMap}
            type="button"
          >
            <FileDown aria-hidden="true" size={19} />
            <span className="map-hero-action-label">PDF izveštaj</span>
          </button>

          <button
            aria-label="Dodaj parcelu"
            className="map-hero-action map-hero-action-primary"
            onClick={() => {
              setError(null);
              setSuccessMessage(null);
              setCreateModalOpen(true);
            }}
            type="button"
          >
            <Plus aria-hidden="true" size={20} />
            <span className="map-hero-action-label">Dodaj parcelu</span>
          </button>
        </div>

        <div className="apiary-map-count" aria-live="polite">
          <MapPinned aria-hidden="true" size={15} />
          <span>{formatParcelCount(parcels.length)}</span>
        </div>
      </section>

      {loading ? (
        <section className="section-card resource-loading">
          <span className="resource-spinner" aria-hidden="true" />
          <div>
            <strong>Učitavanje parcela</strong>
            <p>Pripremamo mapu i podatke o kulturama.</p>
          </div>
        </section>
      ) : null}

      {successMessage ? (
        <section className="section-card message-card success" role="status">
          {successMessage}
        </section>
      ) : null}

      {error ? (
        <section className="section-card message-card error" role="alert">
          {error}
        </section>
      ) : null}

      {!loading && !error && parcels.length === 0 ? (
        <section className="section-card resource-empty-state">
          <span className="resource-empty-icon">
            <Sprout aria-hidden="true" size={27} />
          </span>
          <h2>Još nema parcela</h2>
          <p>Dodajte prvu parcelu kako biste evidentirali kulture i planirali tretiranja.</p>
          <button className="primary-button" onClick={() => setCreateModalOpen(true)} type="button">
            <Plus aria-hidden="true" size={18} />
            Dodaj parcelu
          </button>
        </section>
      ) : null}

      {!loading && !error && parcels.length > 0 ? (
        <section className="card-grid three">
          {parcels.map((parcel) => {
            const crops = parcelsWithCrops.find((item) => item.parcel.id === parcel.id)?.crops ?? [];

            return (
              <article
                aria-label={`Parcela ${parcel.name}`}
                className="apiary-card parcel-visual-card"
                key={parcel.id}
                tabIndex={0}
              >
                <div className="apiary-hero parcel-card-hero">
                  <img
                    alt=""
                    aria-hidden="true"
                    className="apiary-hero-image"
                    loading="lazy"
                    src={parcelCardBackground}
                  />

                  <div className="parcel-hero-crops">
                    <Wheat aria-hidden="true" size={16} />
                    <span>{formatHeroCropSummary(crops)}</span>
                  </div>

                  <time className="apiary-date-badge" dateTime={parcel.createdAt}>
                    <CalendarDays aria-hidden="true" size={11} />
                    {formatCompactDate(parcel.createdAt)}
                  </time>

                  <div className="apiary-card-actions">
                    <button
                      aria-label="Izmeni parcelu"
                      className="apiary-overlay-action"
                      disabled={deletingParcelId === parcel.id}
                      onClick={() => {
                        setError(null);
                        setSuccessMessage(null);
                        setSelectedParcel(parcel);
                        setEditModalOpen(true);
                      }}
                      title="Izmeni parcelu"
                      type="button"
                    >
                      <Pencil aria-hidden="true" size={15} />
                    </button>
                    <button
                      aria-label={deletingParcelId === parcel.id ? 'Brisanje parcele' : 'Obriši parcelu'}
                      className="apiary-overlay-action apiary-overlay-action-danger"
                      disabled={deletingParcelId === parcel.id}
                      onClick={() => handleDeleteParcel(parcel)}
                      title={deletingParcelId === parcel.id ? 'Brisanje parcele' : 'Obriši parcelu'}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={15} />
                    </button>
                  </div>
                </div>

                <div className="apiary-body apiary-info-panel parcel-info-panel">
                  <div className="apiary-title-row">
                    <h2>{parcel.name}</h2>
                  </div>

                  <p className="apiary-terrain">
                    <Wheat aria-hidden="true" className="apiary-terrain-icon" size={13} />
                    {formatCropSummary(crops)}
                  </p>

                  <div className="apiary-divider" />

                  <div className="apiary-coordinate-grid">
                    <div className="apiary-coord-cell">
                      <span className="apiary-coord-label">Geografska širina</span>
                      <strong className="apiary-coord-value">{parcel.latitude}</strong>
                    </div>
                    <div className="apiary-coord-cell">
                      <span className="apiary-coord-label">Geografska dužina</span>
                      <strong className="apiary-coord-value">{parcel.longitude}</strong>
                    </div>
                  </div>

                  {crops.length > 0 ? (
                    <div className="parcel-card-crop-list">
                      {crops.slice(0, 3).map((crop) => (
                        <span className="chip" key={crop.id}>{crop.name}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {createModalOpen ? (
        <ParcelFormModal onClose={() => setCreateModalOpen(false)} onSaved={handleParcelCreated} />
      ) : null}

      {editModalOpen && selectedParcel ? (
        <ParcelFormModal
          crops={selectedParcelCrops}
          onClose={handleEditModalClose}
          onSaved={handleParcelUpdated}
          parcel={selectedParcel}
        />
      ) : null}
    </div>
  );
}

function formatCompactDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('sr-Latn-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
}

function formatCropSummary(crops: CropDto[]) {
  if (crops.length === 0) {
    return 'Kulture još nisu evidentirane';
  }

  return crops.length === 1 ? '1 evidentirana kultura' : `${crops.length} evidentirane kulture`;
}

function formatHeroCropSummary(crops: CropDto[]) {
  if (crops.length === 0) {
    return 'Nema kultura';
  }

  return crops.length === 1 ? crops[0].name : `${crops[0].name} +${crops.length - 1}`;
}

function formatParcelCount(count: number) {
  if (count === 1) {
    return '1 parcela';
  }

  return `${count} parcela`;
}
