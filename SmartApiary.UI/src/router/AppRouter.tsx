import type { ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ActivateAccountPage from '../pages/ActivateAccountPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import BeekeepingDiaryPage from '../pages/BeekeepingDiaryPage';
import DashboardLayout from '../layouts/DashboardLayout';
import AlertsPage from '../pages/AlertsPage';
import ApiariesPage from '../pages/ApiariesPage';
import CropsPage from '../pages/CropsPage';
import DashboardPage from '../pages/DashboardPage';
import DevicesPage from '../pages/DevicesPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import HivesPage from '../pages/HivesPage';
import LoginPage from '../pages/LoginPage';
import ParcelsPage from '../pages/ParcelsPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import SettingsPage from '../pages/SettingsPage';
import SprayingPage from '../pages/SprayingPage';
import TelemetryPage from '../pages/TelemetryPage';
import { getCurrentUserRole, hasAuthToken } from '../auth/authStorage';

type UserRole = 'Admin' | 'Beekeeper' | 'Farmer';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/activate"
          element={
            <PublicRoute>
              <ActivateAccountPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        <Route element={<ProtectedLayout />}>
          <Route index element={<DefaultRoute />} />
          <Route path="/pregled" element={<RoleRoute roles={['Beekeeper']}><DashboardPage /></RoleRoute>} />
          <Route path="/pcelinjaci" element={<RoleRoute roles={['Beekeeper']}><ApiariesPage /></RoleRoute>} />
          <Route path="/kosnice" element={<RoleRoute roles={['Beekeeper']}><HivesPage /></RoleRoute>} />
          <Route path="/uredjaji" element={<RoleRoute roles={['Beekeeper']}><DevicesPage /></RoleRoute>} />
          <Route path="/telemetrija" element={<RoleRoute roles={['Beekeeper']}><TelemetryPage /></RoleRoute>} />
          <Route path="/upozorenja" element={<RoleRoute roles={['Beekeeper']}><AlertsPage /></RoleRoute>} />
          <Route path="/parcele" element={<RoleRoute roles={['Farmer']}><ParcelsPage /></RoleRoute>} />
          <Route path="/kulture" element={<RoleRoute roles={['Farmer']}><CropsPage /></RoleRoute>} />
          <Route path="/tretiranja" element={<RoleRoute roles={['Farmer']}><SprayingPage /></RoleRoute>} />
          <Route path="/dnevnik" element={<RoleRoute roles={['Beekeeper']}><BeekeepingDiaryPage /></RoleRoute>} />
          <Route path="/podesavanja" element={<RoleRoute roles={['Beekeeper']}><SettingsPage /></RoleRoute>} />
          <Route path="/admin/korisnici" element={<RoleRoute roles={['Admin']}><AdminUsersPage /></RoleRoute>} />
          <Route path="*" element={<DefaultRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function ProtectedLayout() {
  return hasValidSession() ? <DashboardLayout /> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactElement }) {
  return hasValidSession()
    ? <Navigate to={getDefaultPathForRole(getCurrentUserRole() as UserRole | null)} replace />
    : children;
}

function hasValidSession() {
  return hasAuthToken() && Boolean(getCurrentUserRole());
}

function RoleRoute({ children, roles }: { children: ReactElement; roles: UserRole[] }) {
  const role = getCurrentUserRole() as UserRole | null;

  return role && roles.includes(role)
    ? children
    : <Navigate to={getDefaultPathForRole(role)} replace />;
}

function DefaultRoute() {
  return <Navigate to={getDefaultPathForRole(getCurrentUserRole() as UserRole | null)} replace />;
}

function getDefaultPathForRole(role: UserRole | null) {
  if (role === 'Admin') {
    return '/admin/korisnici';
  }

  if (role === 'Farmer') {
    return '/parcele';
  }

  return role === null ? '/login' : '/pregled';
}
