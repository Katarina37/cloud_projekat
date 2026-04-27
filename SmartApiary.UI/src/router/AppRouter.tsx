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
          <Route index element={<Navigate to="/pregled" replace />} />
          <Route path="/pregled" element={<DashboardPage />} />
          <Route path="/pcelinjaci" element={<ApiariesPage />} />
          <Route path="/kosnice" element={<HivesPage />} />
          <Route path="/uredjaji" element={<DevicesPage />} />
          <Route path="/telemetrija" element={<TelemetryPage />} />
          <Route path="/upozorenja" element={<AlertsPage />} />
          <Route path="/parcele" element={<ParcelsPage />} />
          <Route path="/kulture" element={<CropsPage />} />
          <Route path="/tretiranja" element={<SprayingPage />} />
          <Route path="/dnevnik" element={<BeekeepingDiaryPage />} />
          <Route path="/podesavanja" element={<SettingsPage />} />
          <Route path="/admin/korisnici" element={<AdminRoute />} />
          <Route path="*" element={<Navigate to="/pregled" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function ProtectedLayout() {
  return hasAuthToken() ? <DashboardLayout /> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactElement }) {
  return hasAuthToken() ? <Navigate to="/pregled" replace /> : children;
}

function AdminRoute() {
  return getCurrentUserRole() === 'Admin' ? <AdminUsersPage /> : <Navigate to="/pregled" replace />;
}
