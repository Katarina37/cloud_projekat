import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import BeekeepingDiaryPage from '../pages/BeekeepingDiaryPage';
import DashboardLayout from '../layouts/DashboardLayout';
import AlertsPage from '../pages/AlertsPage';
import ApiariesPage from '../pages/ApiariesPage';
import CropsPage from '../pages/CropsPage';
import DashboardPage from '../pages/DashboardPage';
import DevicesPage from '../pages/DevicesPage';
import HivesPage from '../pages/HivesPage';
import ParcelsPage from '../pages/ParcelsPage';
import SettingsPage from '../pages/SettingsPage';
import SprayingPage from '../pages/SprayingPage';
import TelemetryPage from '../pages/TelemetryPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
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
          <Route path="*" element={<Navigate to="/pregled" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
