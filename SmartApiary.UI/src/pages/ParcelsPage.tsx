import { Leaf, MapPin } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import { parcels } from '../data/mockData';

export default function ParcelsPage() {
  return (
    <div className="page-stack">
      <PageHeader title="Parcele" subtitle="Naziv, koordinate i kultura povezani sa okruženjem pčelinjaka" />

      <section className="parcels-layout">
        <SectionCard title="Mapa parcela" subtitle="Stilizovan placeholder za buduću mapu">
          <div className="map-placeholder" aria-label="Mapa parcela">
            <span className="map-point primary">P</span>
            <span className="map-point secondary">A12</span>
            <span className="map-point warning">B04</span>
            <span className="map-point green">C19</span>
          </div>
        </SectionCard>

        <div className="parcel-list">
          {parcels.map((parcel) => (
            <article className="section-card parcel-card" key={parcel.id}>
              <div className="card-topline">
                <div className="section-icon">
                  <Leaf size={18} />
                </div>
                <StatusBadge tone={parcel.statusTone}>{parcel.status}</StatusBadge>
              </div>
              <h2>{parcel.name}</h2>
              <p>{parcel.crop}</p>
              <div className="detail-grid">
                <div>
                  <span>Koordinate</span>
                  <strong>{parcel.coordinates}</strong>
                </div>
                <div>
                  <span>Udaljenost</span>
                  <strong className="inline-metric">
                    <MapPin size={15} />
                    {parcel.distance}
                  </strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
