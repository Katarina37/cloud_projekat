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
  Users,
  Wheat,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { getCurrentUserRole } from '../auth/authStorage';

const beekeeperNavigation = [
  { to: '/pregled', label: 'Pregled', icon: LayoutDashboard },
  { to: '/pcelinjaci', label: 'Pčelinjaci', icon: MapPinned },
  { to: '/kosnice', label: 'Košnice', icon: Hexagon },
  { to: '/uredjaji', label: 'Uređaji', icon: Cpu },
  { to: '/telemetrija', label: 'Telemetrija', icon: Activity },
  { to: '/upozorenja', label: 'Upozorenja', icon: Bell },
  { to: '/dnevnik', label: 'Pčelarski dnevnik', icon: BookOpenText },
  { to: '/podesavanja', label: 'Podešavanja', icon: Settings },
];

const farmerNavigation = [
  { to: '/parcele', label: 'Parcele', icon: Sprout },
  { to: '/kulture', label: 'Kulture', icon: Wheat },
  { to: '/tretiranja', label: 'Tretiranja pesticidima', icon: CalendarClock },
];

const adminNavigation = [
  { to: '/admin/korisnici', label: 'Korisnici', icon: Users },
];

export default function Sidebar() {
  const role = getCurrentUserRole();
  const items = role === 'Admin'
    ? adminNavigation
    : role === 'Farmer'
      ? farmerNavigation
      : beekeeperNavigation;

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
        {items.map((item) => {
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
    </aside>
  );
}
