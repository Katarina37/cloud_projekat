import { Wheat } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { crops } from '../data/mockData';

export default function CropsPage() {
  return (
    <div className="page-stack">
      <PageHeader title="Kulture" subtitle="Parcele, kulture i periodi cvetanja" />

      <section className="card-grid three">
        {crops.map((crop) => (
          <article className="section-card crop-card" key={crop.id}>
            <div className="card-topline">
              <div className="section-icon">
                <Wheat size={18} />
              </div>
              <StatusBadge tone={crop.statusTone}>Paša</StatusBadge>
            </div>
            <h2>{crop.crop}</h2>
            <p>{crop.note}</p>
            <div className="detail-grid">
              <div>
                <span>Parcela</span>
                <strong>{crop.parcel}</strong>
              </div>
              <div>
                <span>Period cvetanja</span>
                <strong>{crop.floweringPeriod}</strong>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
