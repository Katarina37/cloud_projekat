// Ovde povezujemo URL adrese sa stranicama i proveravamo uloge.

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
import SprayingPage from '../pages/SprayingPage';
import TelemetryPage from '../pages/TelemetryPage';
import {
  getCurrentUserRole,
  hasAuthToken,
  type UserRole,
} from '../auth/authStorage';

export default function AppRouter() {
  // Svaka adresa otvara svoju stranicu.
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
          <Route path="/admin/korisnici" element={<RoleRoute roles={['Admin']}><AdminUsersPage /></RoleRoute>} />
          <Route path="*" element={<DefaultRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function ProtectedLayout() {
  // Bez tokena vracamo korisnika na login.
  if (hasValidSession()) {
    return <DashboardLayout />;
  }

  return <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactElement }) {
  if (hasValidSession()) {
    return <Navigate to={getDefaultPathForRole(getCurrentUserRole())} replace />;
  }

  return children;
}

function hasValidSession() {
  return hasAuthToken() && getCurrentUserRole() !== null;
}

function RoleRoute({ children, roles }: { children: ReactElement; roles: UserRole[] }) {
  // Front proveri ulogu zbog navigacije, backend je svakako proverava opet.
  const role = getCurrentUserRole();

  if (role && roles.includes(role)) {
    return children;
  }

  return <Navigate to={getDefaultPathForRole(role)} replace />;
}

function DefaultRoute() {
  return <Navigate to={getDefaultPathForRole(getCurrentUserRole())} replace />;
}

function getDefaultPathForRole(role: UserRole | null) {
  if (role === 'Admin') {
    return '/admin/korisnici';
  }

  if (role === 'Farmer') {
    return '/parcele';
  }

  if (role === null) {
    return '/login';
  }

  return '/pregled';
}
