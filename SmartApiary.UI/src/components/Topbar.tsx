import { BadgeCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/pregled': {
    title: 'Pregled sistema',
    subtitle: 'Stanje pčelinjaka, košnica i uređaja',
  },
  '/pcelinjaci': {
    title: 'Pčelinjaci',
    subtitle: 'Lokacije i operativni status',
  },
  '/kosnice': {
    title: 'Košnice',
    subtitle: 'Merenja i stanje po košnici',
  },
  '/uredjaji': {
    title: 'Uređaji',
    subtitle: 'Pametne vage i senzori',
  },
  '/telemetrija': {
    title: 'Telemetrija',
    subtitle: 'Trendovi težine, temperature i vlažnosti',
  },
  '/upozorenja': {
    title: 'Upozorenja',
    subtitle: 'Prioriteti iz pčelinjaka',
  },
  '/parcele': {
    title: 'Parcele',
    subtitle: 'Okolne parcele i koordinate',
  },
  '/kulture': {
    title: 'Kulture',
    subtitle: 'Biljne kulture i periodi cvetanja',
  },
  '/tretiranja': {
    title: 'Tretiranja pesticidima',
    subtitle: 'Najave u blizini pčelinjaka',
  },
  '/dnevnik': {
    title: 'Pčelarski dnevnik',
    subtitle: 'Zapisi pregleda košnica',
  },
  '/podesavanja': {
    title: 'Podešavanja',
    subtitle: 'Pragovi i korisničke vrednosti',
  },
};

export default function Topbar() {
  const { pathname } = useLocation();
  const meta = pageMeta[pathname] ?? pageMeta['/pregled'];

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-title">
          <strong>{meta.title}</strong>
          <span>{meta.subtitle}</span>
        </div>

        <div className="demo-pill">
          <BadgeCheck size={16} />
          <span>Demo podaci</span>
        </div>
      </div>
    </header>
  );
}
