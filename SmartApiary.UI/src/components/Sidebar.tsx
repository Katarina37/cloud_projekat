// Zajednicka UI komponenta: Sidebar.

import {
  Bell,
  BookOpen,
  Boxes,
  CalendarClock,
  Cpu,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Radio,
  Sprout,
  Users,
  Wheat,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  clearAuthToken,
  getCurrentUserEmail,
  getCurrentUserRole,
} from '../auth/authStorage';
import BrandLogo from './BrandLogo';
import './Sidebar.css';

const beekeeperNavigation = [
  { path: '/pregled', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/pcelinjaci', label: 'Pčelinjaci', icon: MapPinned },
  { path: '/kosnice', label: 'Košnice', icon: Boxes },
  { path: '/uredjaji', label: 'Uređaji', icon: Cpu },
  { path: '/telemetrija', label: 'Telemetrija', icon: Radio },
  { path: '/dnevnik', label: 'Dnevnik', icon: BookOpen },
  { path: '/upozorenja', label: 'Upozorenja', icon: Bell },
];

const farmerNavigation = [
  { path: '/parcele', label: 'Parcele i mapa', icon: Sprout },
  { path: '/kulture', label: 'Kulture', icon: Wheat },
  { path: '/tretiranja', label: 'Tretiranja pesticidima', icon: CalendarClock },
];

const adminNavigation = [
  { path: '/admin/korisnici', label: 'Korisnici', icon: Users },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = getCurrentUserRole();
  const email = getCurrentUserEmail() ?? '';
  const initials = email.charAt(0).toUpperCase();
  const currentPath = `${location.pathname}${location.hash}`;
  let items = beekeeperNavigation;

  if (role === 'Admin') {
    items = adminNavigation;
  }

  if (role === 'Farmer') {
    items = farmerNavigation;
  }

  const roleLabel =
    role === 'Admin'
      ? 'Administrator'
      : role === 'Farmer'
        ? 'Poljoprivrednik'
        : 'Pčelar';

  const handleLogout = () => {
    clearAuthToken();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandLogo />
        <div className="sidebar-brand-copy">
          <strong>SmartApiary</strong>
          <span>Pametno pčelarstvo</span>
        </div>
      </div>

      <nav className="side-nav" aria-label="Glavna navigacija">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              aria-label={item.label}
              className={() => `nav-item${currentPath === item.path ? ' active' : ''}`}
              key={item.path}
              title={item.label}
              to={item.path}
            >
              <Icon aria-hidden="true" size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-profile">
        <div className="sidebar-avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="sidebar-profile-content">
          <div className="sidebar-profile-copy">
            <strong title={email}>{email}</strong>
            <span>{roleLabel}</span>
          </div>
          <button
            aria-label="Odjava"
            className="sidebar-logout-button"
            onClick={handleLogout}
            title="Odjava"
            type="button"
          >
            <LogOut aria-hidden="true" size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
