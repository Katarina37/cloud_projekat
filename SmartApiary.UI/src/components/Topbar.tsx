import { useLocation } from 'react-router-dom';

export default function Topbar() {
  const { pathname } = useLocation();
  const meta = getPageMeta(pathname);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-title">
          <strong>{meta.title}</strong>
          <span>{meta.subtitle}</span>
        </div>
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
