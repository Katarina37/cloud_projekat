import { BookOpenText, Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { diaryEntries } from '../data/mockData';

export default function BeekeepingDiaryPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Pčelarski dnevnik"
        subtitle="Zapisi pregleda košnica i zapažanja sa terena"
        action={
          <button className="primary-button" type="button">
            <Plus size={18} />
            Dodaj zapis
          </button>
        }
      />

      <section className="diary-list">
        {diaryEntries.map((entry) => (
          <article className="section-card diary-card" key={entry.id}>
            <div className="card-topline">
              <div className="section-icon">
                <BookOpenText size={18} />
              </div>
              <span className="muted-text">{entry.date}</span>
            </div>
            <h2>Pregled košnice {entry.hive}</h2>
            <div className="detail-grid four">
              <div>
                <span>Ramovi sa medom</span>
                <strong>{entry.honeyFrames}</strong>
              </div>
              <div>
                <span>Leglo</span>
                <strong>{entry.brood}</strong>
              </div>
              <div>
                <span>Matica</span>
                <strong>{entry.queen}</strong>
              </div>
              <div>
                <span>Napomena</span>
                <strong>{entry.note}</strong>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
