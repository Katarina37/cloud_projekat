// Stranica za kulture na parcelama.

import { type ChangeEvent, useEffect, useState } from 'react';
import { CalendarRange, MapPinned, Pencil, Plus, Ruler, Trash2, Wheat } from 'lucide-react';
import {
  deleteCrop,
  getApiErrorMessage,
  getCropsByParcel,
  getParcels,
  type CropDto,
  type ParcelDto,
} from '../api/apiClient';
import defaultCropImage from '../assets/card_backgrounds/default-card-background.png';
import lavenderImage from '../assets/card_backgrounds/lavender-card-background.png';
import rapeseedImage from '../assets/card_backgrounds/rapeseed-card-background.png';
import sunflowerImage from '../assets/card_backgrounds/sunflower-card-background.png';
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
  const selectedParcel = parcels.find((parcel) => parcel.id === selectedParcelId);
  const totalArea = crops.reduce((sum, crop) => sum + (crop.area ?? 0), 0);

  async function loadCropsForParcel(parcelId: string) {
    const loadedCrops = await getCropsByParcel(parcelId);
    setCrops(loadedCrops);
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
      const loadedParcels = await getParcels();
      const nextParcelId = loadedParcels.length > 0 ? loadedParcels[0].id : '';

      setParcels(loadedParcels);
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
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Greška pri brisanju kulture.'));
    } finally {
      setDeletingCropId(null);
    }
  };

  return (
    <div className="page-stack resource-page farmer-page crops-page">
      <PageHeader
        title="Kulture"
        subtitle="Pratite period cvetanja, površinu i beleške za svaku parcelu."
        action={
          <button
            className="primary-button"
            disabled={!selectedParcelId}
            onClick={() => {
              setSuccessMessage(null);
              setIsCreateModalOpen(true);
            }}
            type="button"
          >
            <Plus aria-hidden="true" size={18} />
            Dodaj kulturu
          </button>
        }
      />

      <section className="farmer-summary-grid" aria-label="Pregled kultura">
        <article className="farmer-summary-card farmer-tone-land">
          <span className="farmer-summary-icon"><MapPinned aria-hidden="true" size={22} /></span>
          <div>
            <span>Izabrana parcela</span>
            <strong className="farmer-summary-name">{selectedParcel?.name ?? 'Nema parcele'}</strong>
            <small>{parcels.length} ukupno evidentirano</small>
          </div>
        </article>
        <article className="farmer-summary-card farmer-tone-crop">
          <span className="farmer-summary-icon"><Wheat aria-hidden="true" size={22} /></span>
          <div>
            <span>Kulture</span>
            <strong>{crops.length}</strong>
            <small>Na izabranoj parceli</small>
          </div>
        </article>
        <article className="farmer-summary-card farmer-tone-area">
          <span className="farmer-summary-icon"><Ruler aria-hidden="true" size={22} /></span>
          <div>
            <span>Ukupna površina</span>
            <strong>{formatArea(totalArea)}</strong>
            <small>Prema unetim kulturama</small>
          </div>
        </article>
      </section>

      {parcels.length > 0 ? (
        <section className="section-card farmer-filter-card">
          <div className="farmer-filter-heading">
            <span className="farmer-filter-icon"><MapPinned aria-hidden="true" size={20} /></span>
            <div>
              <h2>Izaberite parcelu</h2>
              <p>Prikazane kartice se automatski osvežavaju za odabranu parcelu.</p>
            </div>
          </div>
          <div className="farmer-filter-control">
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

      {loading ? (
        <section className="section-card resource-loading">
          <span className="resource-spinner" aria-hidden="true" />
          <div>
            <strong>{loadingMessage}</strong>
            <p>Pripremamo podatke o cvetanju i površinama.</p>
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
          <span className="resource-empty-icon"><MapPinned aria-hidden="true" size={27} /></span>
          <h2>Nema parcela</h2>
          <p>{noParcelsMessage}</p>
        </section>
      ) : null}

      {!loading && !error && selectedParcelId && crops.length === 0 ? (
        <section className="section-card resource-empty-state">
          <span className="resource-empty-icon"><Wheat aria-hidden="true" size={27} /></span>
          <h2>Nema kultura na ovoj parceli</h2>
          <p>{emptyCropsMessage}</p>
          <button className="primary-button" onClick={() => setIsCreateModalOpen(true)} type="button">
            <Plus aria-hidden="true" size={18} />
            Dodaj kulturu
          </button>
        </section>
      ) : null}

      {!loading && !error && selectedParcelId && crops.length > 0 ? (
        <section className="card-grid three farmer-entity-grid">
          {crops.map((crop) => (
            <article
              className={`farmer-entity-card crop-entity-card ${getCropTone(crop.name)}`}
              key={crop.id}
              tabIndex={0}
            >
              <div className="farmer-card-hero">
                <img alt="" aria-hidden="true" loading="lazy" src={getCropImage(crop.name)} />
                <span className="farmer-card-kicker">Kultura</span>
                <div className="apiary-card-actions">
                  <button
                    aria-label="Izmeni kulturu"
                    className="apiary-overlay-action"
                    disabled={deletingCropId === crop.id}
                    onClick={() => {
                      setSuccessMessage(null);
                      setEditingCrop(crop);
                    }}
                    title="Izmeni kulturu"
                    type="button"
                  >
                    <Pencil aria-hidden="true" size={15} />
                  </button>
                  <button
                    aria-label={deletingCropId === crop.id ? 'Brisanje kulture' : 'Obriši kulturu'}
                    className="apiary-overlay-action apiary-overlay-action-danger"
                    disabled={deletingCropId === crop.id}
                    onClick={() => handleDeleteCrop(crop)}
                    title={deletingCropId === crop.id ? 'Brisanje kulture' : 'Obriši kulturu'}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={15} />
                  </button>
                </div>
              </div>

              <div className="farmer-card-body">
                <h2>{crop.name}</h2>
                <p className="farmer-card-description">
                  {crop.notes || 'Nema dodatne beleške za ovu kulturu.'}
                </p>

                <div className="farmer-metric-grid">
                  <div>
                    <span><CalendarRange aria-hidden="true" size={13} /> Početak cvetanja</span>
                    <strong>{formatDate(crop.expectedBloomingStart)}</strong>
                  </div>
                  <div>
                    <span><CalendarRange aria-hidden="true" size={13} /> Kraj cvetanja</span>
                    <strong>{formatDate(crop.expectedBloomingEnd)}</strong>
                  </div>
                  <div>
                    <span><Ruler aria-hidden="true" size={13} /> Površina</span>
                    <strong>
                      {crop.area !== null && crop.area !== undefined
                        ? formatArea(crop.area)
                        : 'Nije uneta'}
                    </strong>
                  </div>
                </div>
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

function formatArea(value: number) {
  return `${new Intl.NumberFormat('sr-Latn-RS', { maximumFractionDigits: 2 }).format(value)} ha`;
}

function getCropImage(name: string) {
  switch (name.trim().toLowerCase()) {
    case 'suncokret':
    case 'sunflower':
      return sunflowerImage;
    case 'uljana repica':
    case 'rapeseed':
      return rapeseedImage;
    case 'lavanda':
    case 'lavender':
      return lavenderImage;
    default:
      return defaultCropImage;
  }
}

function getCropTone(name: string) {
  switch (name.trim().toLowerCase()) {
    case 'lavanda':
    case 'lavender':
      return 'crop-tone-lavender';
    case 'uljana repica':
    case 'rapeseed':
      return 'crop-tone-rapeseed';
    case 'suncokret':
    case 'sunflower':
      return 'crop-tone-sunflower';
    default:
      return 'crop-tone-default';
  }
}
