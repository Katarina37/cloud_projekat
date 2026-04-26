import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Wheat } from 'lucide-react';
import {
  getApiErrorMessage,
  getCropsByParcel,
  getParcels,
  type CropDto,
  type ParcelDto,
} from '../api/apiClient';
import PageHeader from '../components/PageHeader';

const loadingMessage = 'Učitavanje kultura...';
const loadErrorMessage = 'Greška pri učitavanju kultura.';
const emptyMessage = 'Nema podataka za prikaz';

export default function CropsPage() {
  const [parcels, setParcels] = useState<ParcelDto[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState('');
  const [crops, setCrops] = useState<CropDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCropsForParcel = useCallback(async (parcelId: string) => {
    const crops = await getCropsByParcel(parcelId);
    setCrops(crops);
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
        await loadCropsForParcel(nextParcelId);
      } else {
        setCrops([]);
      }
    } catch (requestError) {
      setParcels([]);
      setSelectedParcelId('');
      setCrops([]);
      setError(getApiErrorMessage(requestError, loadErrorMessage));
    } finally {
      setLoading(false);
    }
  }, [loadCropsForParcel]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const handleParcelChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextParcelId = event.target.value;

    setSelectedParcelId(nextParcelId);
    setCrops([]);

    if (!nextParcelId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loadCropsForParcel(nextParcelId);
    } catch (requestError) {
      setCrops([]);
      setError(getApiErrorMessage(requestError, loadErrorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader title="Kulture" subtitle="Kulture za izabranu parcelu" />

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

      {!loading && !error && (parcels.length === 0 || crops.length === 0) ? (
        <section className="section-card">{emptyMessage}</section>
      ) : null}

      {!loading && !error && crops.length > 0 ? (
        <section className="card-grid three">
          {crops.map((crop) => (
            <article className="section-card crop-card" key={crop.id}>
              <div className="card-topline">
                <div className="section-icon">
                  <Wheat size={18} />
                </div>
              </div>
              <h2>{crop.name}</h2>
              {crop.notes ? <p>{crop.notes}</p> : null}
              <div className="detail-grid">
                <div>
                  <span>Početak cvetanja</span>
                  <strong>{formatDate(crop.expectedBloomingStart)}</strong>
                </div>
                <div>
                  <span>Kraj cvetanja</span>
                  <strong>{formatDate(crop.expectedBloomingEnd)}</strong>
                </div>
                <div>
                  <span>Površina</span>
                  <strong>{crop.area ?? '-'}</strong>
                </div>
              </div>
            </article>
          ))}
        </section>
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
