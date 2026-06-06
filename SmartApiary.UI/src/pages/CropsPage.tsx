import { type ChangeEvent, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, Wheat } from 'lucide-react';
import {
  deleteCrop,
  getApiErrorMessage,
  getCropsByParcel,
  getParcels,
  type CropDto,
  type ParcelDto,
} from '../api/apiClient';
import CropFormModal from '../components/CropFormModal';
import PageHeader from '../components/PageHeader';

const loadingMessage = 'Učitavanje kultura...';
const loadErrorMessage = 'Greška pri učitavanju kultura.';
const noParcelsMessage = 'Prvo dodajte parcelu da biste mogli uneti kulturu.';
const emptyCropsMessage = 'Nema unetih kultura za ovu parcelu.';

export default function CropsPage() {
  const [parcels, setParcels] = useState<ParcelDto[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState('');
  const [crops, setCrops] = useState<CropDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropDto | null>(null);
  const [deletingCropId, setDeletingCropId] = useState<string | null>(null);

  async function loadCropsForParcel(parcelId: string) {
    const crops = await getCropsByParcel(parcelId);
    setCrops(crops);
  }

  async function fetchCropsForParcel(parcelId: string) {
    setLoading(true);
    setError(null);

    try {
      await loadCropsForParcel(parcelId);
      return true;
    } catch {
      setCrops([]);
      setError(loadErrorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function loadInitialData() {
    setLoading(true);
    setError(null);

    try {
      const parcels = await getParcels();
      const nextParcelId = parcels.length > 0 ? parcels[0].id : '';

      setParcels(parcels);
      setSelectedParcelId(nextParcelId);

      if (nextParcelId) {
        await loadCropsForParcel(nextParcelId);
      } else {
        setCrops([]);
      }
    } catch {
      setParcels([]);
      setSelectedParcelId('');
      setCrops([]);
      setError(loadErrorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleParcelChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextParcelId = event.target.value;

    setSuccessMessage(null);
    setSelectedParcelId(nextParcelId);
    setCrops([]);

    if (!nextParcelId) {
      return;
    }

    await fetchCropsForParcel(nextParcelId);
  };

  const handleCropCreated = async () => {
    if (selectedParcelId) {
      const refreshed = await fetchCropsForParcel(selectedParcelId);

      if (refreshed) {
        setSuccessMessage('Kultura je uspešno dodata.');
      }
    }
  };

  const handleCropUpdated = async () => {
    if (selectedParcelId) {
      const refreshed = await fetchCropsForParcel(selectedParcelId);

      if (refreshed) {
        setSuccessMessage('Kultura je uspešno izmenjena.');
      }
    }
  };

  const handleDeleteCrop = async (crop: CropDto) => {
    const confirmed = window.confirm(`Da li želite da obrišete kulturu "${crop.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingCropId(crop.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteCrop(crop.id);

      if (selectedParcelId) {
        const refreshed = await fetchCropsForParcel(selectedParcelId);

        if (refreshed) {
          setSuccessMessage('Kultura je uspešno obrisana.');
        }
      }
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greška pri brisanju kulture.'));
    } finally {
      setDeletingCropId(null);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Kulture"
        subtitle="Kulture za izabranu parcelu"
        action={
          <button
            className="primary-button apiary-add-button"
            disabled={!selectedParcelId}
            onClick={() => {
              setSuccessMessage(null);
              setIsCreateModalOpen(true);
            }}
            type="button"
          >
            <Plus size={18} />
            Dodaj kulturu
          </button>
        }
      />

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

      {successMessage ? <section className="section-card message-card success">{successMessage}</section> : null}

      {error ? (
        <section className="section-card message-card error" role="alert">
          {error}
        </section>
      ) : null}

      {!loading && !error && parcels.length === 0 ? (
        <section className="section-card">{noParcelsMessage}</section>
      ) : null}

      {!loading && !error && selectedParcelId && crops.length === 0 ? (
        <section className="section-card">{emptyCropsMessage}</section>
      ) : null}

      {!loading && !error && selectedParcelId && crops.length > 0 ? (
        <section className="card-grid three">
          {crops.map((crop) => (
            <article className="section-card crop-card" key={crop.id}>
              <div className="card-topline">
                <div className="section-icon">
                  <Wheat size={18} />
                </div>
              </div>

              <div>
                <h2>{crop.name}</h2>
                {crop.notes ? <p>{crop.notes}</p> : null}
              </div>

              <div className="detail-grid">
                <div>
                  <span>ExpectedBloomingStart</span>
                  <strong>{formatDate(crop.expectedBloomingStart)}</strong>
                </div>
                <div>
                  <span>ExpectedBloomingEnd</span>
                  <strong>{formatDate(crop.expectedBloomingEnd)}</strong>
                </div>
                {crop.area !== null && crop.area !== undefined ? (
                  <div>
                    <span>Area</span>
                    <strong>{crop.area}</strong>
                  </div>
                ) : null}
              </div>

              <div className="card-action-row">
                <button
                  className="secondary-action-button"
                  disabled={deletingCropId === crop.id}
                  onClick={() => {
                    setSuccessMessage(null);
                    setEditingCrop(crop);
                  }}
                  type="button"
                >
                  <Pencil size={16} />
                  Izmeni
                </button>
                <button
                  className="danger-action-button"
                  disabled={deletingCropId === crop.id}
                  onClick={() => handleDeleteCrop(crop)}
                  type="button"
                >
                  <Trash2 size={16} />
                  {deletingCropId === crop.id ? 'Brisanje...' : 'Obriši'}
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {isCreateModalOpen ? (
        <CropFormModal
          onClose={() => setIsCreateModalOpen(false)}
          onSaved={handleCropCreated}
          selectedParcelId={selectedParcelId}
        />
      ) : null}

      {editingCrop ? (
        <CropFormModal
          crop={editingCrop}
          onClose={() => setEditingCrop(null)}
          onSaved={handleCropUpdated}
          selectedParcelId={selectedParcelId}
        />
      ) : null}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || '-';
  }

  return date.toLocaleDateString('sr-Latn-RS');
}
