import { MapPin, Plus, Radio } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { apiaries } from '../data/mockData';

export default function ApiariesPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Pčelinjaci"
        subtitle="Lokacije, broj košnica i status pčelinjaka"
        action={
          <button className="primary-button" type="button">
            <Plus size={18} />
            Dodaj pčelinjak
          </button>
        }
      />

      <section className="card-grid three">
        {apiaries.map((apiary) => (
          <article className="section-card apiary-card" key={apiary.id}>
            <div className="card-topline">
              <div className="section-icon">
                <MapPin size={18} />
              </div>
              <StatusBadge tone={apiary.statusTone}>{apiary.status}</StatusBadge>
            </div>
            <div>
              <h2>{apiary.name}</h2>
              <p>{apiary.note}</p>
            </div>
            <div className="detail-grid">
              <div>
                <span>Lokacija</span>
                <strong>{apiary.location}</strong>
              </div>
              <div>
                <span>Košnice</span>
                <strong>{apiary.hivesCount}</strong>
              </div>
              <div>
                <span>Uređaji</span>
                <strong className="inline-metric">
                  <Radio size={15} />
                  {apiary.activeDevices}
                </strong>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
