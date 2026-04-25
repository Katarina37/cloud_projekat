import { Save, SlidersHorizontal, UserRound } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';

export default function SettingsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Podešavanja"
        subtitle="Osnovna podešavanja korisnika i pragovi upozorenja"
        action={
          <button className="primary-button" type="button">
            <Save size={18} />
            Sačuvaj
          </button>
        }
      />

      <section className="settings-grid">
        <SectionCard title="Korisnik" subtitle="Podaci naloga" icon={<UserRound size={18} />}>
          <div className="form-grid">
            <label>
              Ime i prezime
              <input value="Marko Petrović" readOnly />
            </label>
            <label>
              Uloga
              <input value="Pčelar" readOnly />
            </label>
            <label>
              Email
              <input value="marko.petrovic@example.com" readOnly />
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Pragovi upozorenja" subtitle="Demo podešavanja" icon={<SlidersHorizontal size={18} />}>
          <div className="form-grid">
            <label>
              Prag pada težine u 24h
              <input value="1.5 kg" readOnly />
            </label>
            <label>
              Minimalna baterija
              <input value="30%" readOnly />
            </label>
            <label>
              Maksimalna temperatura
              <input value="37°C" readOnly />
            </label>
            <label>
              Radijus za tretiranja pesticidima
              <input value="5 km" readOnly />
            </label>
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
