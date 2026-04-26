import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';
import { getParcels, type ParcelDto } from '../api/apiClient';
import PageHeader from '../components/PageHeader';

export default function ParcelsPage() {
  const [parcels, setParcels] = useState<ParcelDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParcels = async () => {
      setLoading(true);
      setError(null);

      try {
        const parcels = await getParcels();
        setParcels(parcels);
      } catch {
        setError('Greška pri učitavanju parcela.');
      } finally {
        setLoading(false);
      }
    };

    fetchParcels();
  }, []);

  return (
    <div className="page-stack">
      <PageHeader title="Parcele" subtitle="Naziv, koordinate i kultura povezani sa okruženjem pčelinjaka" />

      {loading ? <section className="section-card">Učitavanje parcela...</section> : null}

      {error ? (
        <section className="section-card" style={{ color: 'var(--danger)' }}>
          {error}
        </section>
      ) : null}

      {!loading && !error && parcels.length === 0 ? (
        <section className="section-card">Nema unetih parcela.</section>
      ) : null}

      {!loading && !error && parcels.length > 0 ? (
        <section className="card-grid three">
          {parcels.map((parcel) => (
            <article className="section-card parcel-card" key={parcel.id}>
              <div className="card-topline">
                <div className="section-icon">
                  <Leaf size={18} />
                </div>
              </div>
              <h2>{parcel.name}</h2>
              <div className="detail-grid">
                <div>
                  <span>Latitude</span>
                  <strong>{parcel.latitude}</strong>
                </div>
                <div>
                  <span>Longitude</span>
                  <strong>{parcel.longitude}</strong>
                </div>
                <div>
                  <span>CreatedAt</span>
                  <strong>{new Date(parcel.createdAt).toLocaleString()}</strong>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
