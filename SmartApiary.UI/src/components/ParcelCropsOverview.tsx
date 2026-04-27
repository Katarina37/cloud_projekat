import { useCallback, useEffect, useState } from 'react';
import { Wheat } from 'lucide-react';
import {
  getApiErrorMessage,
  getCropsByParcel,
  getParcels,
  type CropDto,
  type ParcelDto,
} from '../api/apiClient';
import SectionCard from './SectionCard';

type ParcelCrops = {
  parcel: ParcelDto;
  crops: CropDto[];
};

const loadingMessage = 'Učitavanje kultura po parcelama...';
const loadErrorMessage = 'Greška pri učitavanju kultura po parcelama.';

export default function ParcelCropsOverview() {
  const [parcelCrops, setParcelCrops] = useState<ParcelCrops[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadParcelCrops = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const parcels = await getParcels();
      const cropsByParcel = await Promise.all(
        parcels.map(async (parcel) => ({
          parcel,
          crops: await getCropsByParcel(parcel.id),
        })),
      );

      setParcelCrops(cropsByParcel);
    } catch (requestError) {
      setParcelCrops([]);
      setError(getApiErrorMessage(requestError, loadErrorMessage));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadParcelCrops();
  }, [loadParcelCrops]);

  return (
    <SectionCard
      title="Kulture po parcelama"
      subtitle="Read-only pregled kultura dostupnih pčelaru"
      icon={<Wheat size={18} />}
    >
      {loading ? <p>{loadingMessage}</p> : null}

      {!loading && error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && parcelCrops.length === 0 ? (
        <p className="muted-text">Nema parcela za prikaz.</p>
      ) : null}

      {!loading && !error && parcelCrops.length > 0 ? (
        <div className="parcel-crops-list">
          {parcelCrops.map(({ parcel, crops }) => (
            <div className="parcel-crop-group" key={parcel.id}>
              <div className="parcel-crop-header">
                <div className="table-title">
                  <strong>{parcel.name}</strong>
                  <span>
                    {crops.length === 1 ? '1 kultura' : `${crops.length} kultura`}
                  </span>
                </div>
              </div>

              {crops.length > 0 ? (
                <div className="crop-overview-list">
                  {crops.map((crop) => (
                    <div className="crop-overview-row" key={crop.id}>
                      <strong>{crop.name}</strong>
                      <span>{formatBloomingPeriod(crop)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted-text">Nema kultura za ovu parcelu.</p>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </SectionCard>
  );
}

function formatBloomingPeriod(crop: CropDto) {
  return `${formatDate(crop.expectedBloomingStart)} - ${formatDate(crop.expectedBloomingEnd)}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || '-';
  }

  return date.toLocaleDateString('sr-Latn-RS');
}
