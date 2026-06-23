// Zajednicki raspored za prijavljeni deo aplikacije.

import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ErrorBoundary from '../components/ErrorBoundary';

export default function DashboardLayout() {
  const location = useLocation();
  const isWideContentPage = location.pathname === '/parcele';
  const isEdgeContentPage = [
    '/pcelinjaci',
    '/kosnice',
    '/uredjaji',
    '/telemetrija',
    '/dnevnik',
    '/upozorenja',
    '/kulture',
    '/tretiranja',
  ].includes(location.pathname);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <main
          className={[
            'content-shell',
            isWideContentPage ? 'content-shell-wide' : '',
            isEdgeContentPage ? 'content-shell-edge' : '',
          ].filter(Boolean).join(' ')}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
