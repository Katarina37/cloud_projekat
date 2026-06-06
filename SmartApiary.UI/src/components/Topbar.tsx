import { LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearAuthToken } from '../auth/authStorage';

export default function Topbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const meta = getPageMeta(pathname);

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

function getPageMeta(pathname: string) {
  if (pathname === '/pcelinjaci') {
    return { title: 'Pčelinjaci', subtitle: 'Lokacije i operativni status' };
  }

  if (pathname === '/kosnice') {
    return { title: 'Košnice', subtitle: 'Merenja i stanje po košnici' };
  }

  if (pathname === '/uredjaji') {
    return { title: 'Uređaji', subtitle: 'Pametne vage i senzori' };
  }

  if (pathname === '/telemetrija') {
    return { title: 'Telemetrija', subtitle: 'Trendovi težine, temperature i vlažnosti' };
  }

  if (pathname === '/upozorenja') {
    return { title: 'Upozorenja', subtitle: 'Prioriteti iz pčelinjaka' };
  }

  if (pathname === '/parcele') {
    return { title: 'Parcele', subtitle: 'Okolne parcele i koordinate' };
  }

  if (pathname === '/kulture') {
    return { title: 'Kulture', subtitle: 'Biljne kulture i periodi cvetanja' };
  }

  if (pathname === '/tretiranja') {
    return { title: 'Tretiranja pesticidima', subtitle: 'Najave u blizini pčelinjaka' };
  }

  if (pathname === '/dnevnik') {
    return { title: 'Pčelarski dnevnik', subtitle: 'Zapisi pregleda košnica' };
  }

  if (pathname === '/podesavanja') {
    return { title: 'Podešavanja', subtitle: 'Pragovi i korisničke vrednosti' };
  }

  if (pathname === '/admin/korisnici') {
    return { title: 'Korisnici', subtitle: 'Administracija naloga' };
  }

  return {
    title: 'Pregled sistema',
    subtitle: 'Stanje pčelinjaka, košnica i uređaja',
  };
}
