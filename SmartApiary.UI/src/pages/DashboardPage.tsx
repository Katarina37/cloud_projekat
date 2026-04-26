import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import {
  getAlerts,
  getApiaries,
  getApiErrorMessage,
  getDailyWeightDeltas,
  getDeviceByHive,
  getHivesByApiary,
  getLatestHiveStatus,
  type AlertDto,
  type ApiaryDto,
  type DailyWeightDeltaDto,
  type DeviceDto,
  type HiveDto,
  type LatestHiveStatusDto,
} from '../api/apiClient';
import DashboardCharts from '../components/DashboardCharts';
import DashboardStats from '../components/DashboardStats';
import DashboardStatus from '../components/DashboardStatus';
import PageHeader from '../components/PageHeader';

const dashboardErrorMessage = 'Greška pri učitavanju podataka';

export default function DashboardPage() {
  const [apiaries, setApiaries] = useState<ApiaryDto[]>([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState('');
  const [hives, setHives] = useState<HiveDto[]>([]);
  const [selectedHiveId, setSelectedHiveId] = useState('');
  const [latestStatus, setLatestStatus] = useState<LatestHiveStatusDto | null>(null);
  const [dailyDeltas, setDailyDeltas] = useState<DailyWeightDeltaDto[]>([]);
  const [alerts, setAlerts] = useState<AlertDto[]>([]);
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearHiveData = () => {
    setLatestStatus(null);
    setDailyDeltas([]);
    setDevices([]);
  };

  const loadHiveData = useCallback(async (hiveId: string) => {
    const { from, to } = getDashboardDateRange();
    const [latestStatus, dailyDeltas, device] = await Promise.all([
      getLatestHiveStatus(hiveId),
      getDailyWeightDeltas(hiveId, from, to),
      getDeviceByHive(hiveId),
    ]);

    setLatestStatus(latestStatus);
    setDailyDeltas(dailyDeltas);
    setDevices(device ? [device] : []);
  }, []);

  const loadHivesForApiary = useCallback(
    async (apiaryId: string) => {
      const hives = await getHivesByApiary(apiaryId);
      const nextHiveId = hives[0]?.id ?? '';

      setHives(hives);
      setSelectedHiveId(nextHiveId);
      clearHiveData();

      if (nextHiveId) {
        await loadHiveData(nextHiveId);
      }
    },
    [loadHiveData],
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiaries = await getApiaries();
      const nextApiaryId = apiaries[0]?.id ?? '';

      setApiaries(apiaries);
      setSelectedApiaryId(nextApiaryId);

      if (nextApiaryId) {
        await loadHivesForApiary(nextApiaryId);
      } else {
        setHives([]);
        setSelectedHiveId('');
        clearHiveData();
      }

      const alerts = await getAlerts();
      setAlerts(alerts);
    } catch (requestError) {
      setApiaries([]);
      setSelectedApiaryId('');
      setHives([]);
      setSelectedHiveId('');
      setAlerts([]);
      clearHiveData();
      setError(getApiErrorMessage(requestError, dashboardErrorMessage));
    } finally {
      setLoading(false);
    }
  }, [loadHivesForApiary]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleApiaryChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextApiaryId = event.target.value;

    setSelectedApiaryId(nextApiaryId);
    setHives([]);
    setSelectedHiveId('');
    clearHiveData();

    if (!nextApiaryId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loadHivesForApiary(nextApiaryId);
    } catch (requestError) {
      setHives([]);
      setSelectedHiveId('');
      clearHiveData();
      setError(getApiErrorMessage(requestError, dashboardErrorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleHiveChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextHiveId = event.target.value;

    setSelectedHiveId(nextHiveId);
    clearHiveData();

    if (!nextHiveId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loadHiveData(nextHiveId);
    } catch (requestError) {
      clearHiveData();
      setError(getApiErrorMessage(requestError, dashboardErrorMessage));
    } finally {
      setLoading(false);
    }
  };

  const hasApiaryData = apiaries.length > 0;
  const hasHiveData = Boolean(selectedApiaryId) && hives.length > 0;
  const hasDashboardData = hasApiaryData || hasHiveData || latestStatus !== null || dailyDeltas.length > 0 || alerts.length > 0;

  return (
    <div className="page-stack">
      <PageHeader
        title="Pregled sistema"
        subtitle="Pregled pčelinjaka, košnica, uređaja, telemetrije i upozorenja"
      />

      {apiaries.length > 0 ? (
        <section className="section-card">
          <div className="device-filter-grid">
            <label>
              Pčelinjak
              <select disabled={loading} onChange={handleApiaryChange} value={selectedApiaryId}>
                {apiaries.map((apiary) => (
                  <option key={apiary.id} value={apiary.id}>
                    {apiary.name}
                  </option>
                ))}
              </select>
            </label>

            {hives.length > 0 ? (
              <label>
                Košnica
                <select disabled={loading} onChange={handleHiveChange} value={selectedHiveId}>
                  {hives.map((hive) => (
                    <option key={hive.id} value={hive.id}>
                      {hive.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        </section>
      ) : null}

      {loading ? <section className="section-card">Učitavanje dashboard-a...</section> : null}

      {!loading && error ? (
        <section className="section-card message-card error" role="alert">
          {dashboardErrorMessage}
        </section>
      ) : null}

      {!loading && !error && !hasDashboardData ? (
        <section className="section-card">Nema podataka za prikaz</section>
      ) : null}

      {!loading && !error && hasDashboardData ? (
        <>
          <DashboardStats
            alerts={alerts}
            apiaries={apiaries}
            deviceCount={devices.length}
            hives={hives}
          />

          {hasApiaryData && !hasHiveData ? (
            <section className="section-card">Nema podataka za prikaz</section>
          ) : null}

          {latestStatus ? <DashboardStatus latestStatus={latestStatus} /> : null}

          {selectedHiveId ? <DashboardCharts dailyDeltas={dailyDeltas} /> : null}
        </>
      ) : null}
    </div>
  );
}

function getDashboardDateRange() {
  return {
    from: formatApiDate(addDays(new Date(), -7)),
    to: formatApiDate(new Date()),
  };
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function formatApiDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
