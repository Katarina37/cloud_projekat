// Zajednicka UI komponenta: ParcelCropsOverview.

import { useEffect, useState } from 'react';
import { Wheat } from 'lucide-react';
import {
  getApiErrorMessage,
  getCropsByParcel,
  getParcels,
  getNearbyParcels,
  type CropDto,
  type ParcelDto,
} from '../api/apiClient';
import { getCurrentUserRole } from '../auth/authStorage';
import SectionCard from './SectionCard';

type ParcelCrops = {
  parcel: ParcelDto;
  crops: CropDto[];
  cropsUnavailable?: boolean;
};

const loadingMessage = 'Učitavanje kultura po parcelama...';
const loadErrorMessage = 'Greška pri učitavanju kultura po parcelama.';

type Props = {
  apiaryId?: string;
};

export default function ParcelCropsOverview({ apiaryId }: Props) {
  const [parcelCrops, setParcelCrops] = useState<ParcelCrops[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadParcelCrops() {
    setLoading(true);
    setError(null);
    try {
      const role = getCurrentUserRole();

      if (role === 'Beekeeper') {
        // Pcelar vidi parcele koje se nalaze u blizini izabranog pcelinjaka.
        if (!apiaryId) {
          setParcelCrops([]);
          setError('Odaberite pčelinjak da bi se prikazale okolne parcele.');
          setLoading(false);
          return;
        }

        const nearby = await getNearbyParcels(apiaryId);
        const results: ParcelCrops[] = nearby.map((p) => ({
          parcel: { id: p.parcelId, name: p.parcelName, latitude: p.latitude, longitude: p.longitude, createdAt: '' },
          crops: (p.crops || []).map((crop) => ({
            id: crop.cropId,
            parcelId: p.parcelId,
            name: crop.name,
            expectedBloomingStart: crop.expectedBloomingStart,
            expectedBloomingEnd: crop.expectedBloomingEnd,
            area: crop.area,
            notes: crop.notes,
          })),
          cropsUnavailable: false,
        }));

        setParcelCrops(results);
        setError(null);
        setLoading(false);
        return;
      }

      // Farmer vidi svoje parcele i kulture koje je uneo.
      const parcels = await getParcels();

      const results: ParcelCrops[] = [];
      for (const parcel of parcels) {
        try {
          const crops = await getCropsByParcel(parcel.id);
          results.push({ parcel, crops });
        } catch {
          // Jedna greska ne treba da zaustavi prikaz svih ostalih parcela.
          results.push({ parcel, crops: [], cropsUnavailable: true });
        }
      }

      setParcelCrops(results);
    } catch (requestError) {
      setParcelCrops([]);
      setError(getApiErrorMessage(requestError, loadErrorMessage));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadParcelCrops();
  }, [apiaryId]);

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
          {parcelCrops.map(({ parcel, crops, cropsUnavailable }) => (
            <div className="parcel-crop-group" key={parcel.id}>
              <div className="parcel-crop-header">
                <div className="table-title">
                  <strong>{parcel.name}</strong>
                  <span>
                    {cropsUnavailable
                      ? 'nedostupno'
                      : crops.length === 1
                      ? '1 kultura'
                      : `${crops.length} kultura`}
                  </span>
                </div>
              </div>
              {cropsUnavailable ? (
                <p className="muted-text">Kulture nisu dostupne za ovu parcelu.</p>
              ) : crops.length > 0 ? (
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
