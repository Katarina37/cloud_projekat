import PageHeader from '../components/PageHeader';

export default function BeekeepingDiaryPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Pčelarski dnevnik"
        subtitle="Zapisi pregleda košnica i zapažanja sa terena"
      />

      <section className="section-card">Nema podataka za prikaz</section>
    </div>
  );
}
