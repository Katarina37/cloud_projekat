import { LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearAuthToken } from '../auth/authStorage';

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
  '/admin/korisnici': {
    title: 'Korisnici',
    subtitle: 'Administracija naloga',
  },
};

export default function Topbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const meta = pageMeta[pathname] ?? pageMeta['/pregled'];

  const handleLogout = () => {
    clearAuthToken();
    navigate('/login', { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-title">
          <strong>{meta.title}</strong>
          <span>{meta.subtitle}</span>
        </div>
        <button className="secondary-action-button topbar-logout-button" onClick={handleLogout} type="button">
          <LogOut size={16} />
          Odjava
        </button>
      </div>
    </header>
  );
}
