import {
  Activity,
  Bell,
  BookOpenText,
  CalendarClock,
  Cpu,
  Hexagon,
  LayoutDashboard,
  MapPinned,
  Settings,
  Sprout,
  Wheat,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const navigation = [
  { to: '/pregled', label: 'Pregled', icon: LayoutDashboard },
  { to: '/pcelinjaci', label: 'Pčelinjaci', icon: MapPinned },
  { to: '/kosnice', label: 'Košnice', icon: Hexagon },
  { to: '/uredjaji', label: 'Uređaji', icon: Cpu },
  { to: '/telemetrija', label: 'Telemetrija', icon: Activity },
  { to: '/upozorenja', label: 'Upozorenja', icon: Bell },
  { to: '/parcele', label: 'Parcele', icon: Sprout },
  { to: '/kulture', label: 'Kulture', icon: Wheat },
  { to: '/tretiranja', label: 'Tretiranja pesticidima', icon: CalendarClock },
  { to: '/dnevnik', label: 'Pčelarski dnevnik', icon: BookOpenText },
  { to: '/podesavanja', label: 'Podešavanja', icon: Settings },
];

const apiBackedPages = new Set(['/pcelinjaci', '/parcele', '/podesavanja']);

export default function Sidebar() {
  const { pathname } = useLocation();
  const usesRealApi = apiBackedPages.has(pathname);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <Hexagon size={22} />
        </div>
        <div>
          <strong>Smart Apiary</strong>
          <span>Pametno pčelarstvo</span>
        </div>
      </div>

      <nav className="side-nav" aria-label="Glavna navigacija">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {!usesRealApi ? (
        <div className="sidebar-note">
          <span>Demo podaci</span>
          <strong>Lokalni prikaz</strong>
        </div>
      ) : null}
    </aside>
  );
}
