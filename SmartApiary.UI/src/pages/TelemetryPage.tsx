import { useCallback, useEffect, useState } from 'react';
import {
  getApiaries,
  getApiErrorMessage,
  getDailyWeightDeltas,
  getHivesByApiary,
  getLatestHiveStatus,
  getTelemetryForHive,
  type ApiaryDto,
  type DailyWeightDeltaDto,
  type HiveDto,
  type LatestHiveStatusDto,
  type TelemetryReadingDto,
} from '../api/apiClient';
import PageHeader from '../components/PageHeader';
import TelemetryCharts from '../components/TelemetryCharts';
import TelemetryFilters from '../components/TelemetryFilters';
import TelemetryStatusCards from '../components/TelemetryStatusCards';

const telemetryLoadErrorMessage = 'Greška pri učitavanju telemetrije.';

export default function TelemetryPage() {
  const [apiaries, setApiaries] = useState<ApiaryDto[]>([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState('');
  const [hives, setHives] = useState<HiveDto[]>([]);
  const [selectedHiveId, setSelectedHiveId] = useState('');
  const [telemetryReadings, setTelemetryReadings] = useState<TelemetryReadingDto[]>([]);
  const [latestStatus, setLatestStatus] = useState<LatestHiveStatusDto | null>(null);
  const [dailyDeltas, setDailyDeltas] = useState<DailyWeightDeltaDto[]>([]);
  const [fromDate] = useState(() => formatApiDateTime(addDays(new Date(), -7)));
  const [toDate] = useState(() => formatApiDateTime(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasTelemetryForSelectedPeriod = telemetryReadings.length > 0;
  const hasAnyTelemetry = hasTelemetryForSelectedPeriod || latestStatus !== null || dailyDeltas.length > 0;

  const clearHiveTelemetry = () => {
    setTelemetryReadings([]);
    setLatestStatus(null);
    setDailyDeltas([]);
  };

  const loadTelemetryForHive = useCallback(
    async (hiveId: string) => {
      const [telemetryReadings, latestStatus, dailyDeltas] = await Promise.all([
        getTelemetryForHive(hiveId, fromDate, toDate),
        getLatestHiveStatus(hiveId),
        getDailyWeightDeltas(hiveId, fromDate, toDate),
      ]);

      setTelemetryReadings(telemetryReadings);
      setLatestStatus(latestStatus);
      setDailyDeltas(dailyDeltas);
    },
    [fromDate, toDate],
  );

  const loadHivesForApiary = useCallback(
    async (apiaryId: string) => {
      const hives = await getHivesByApiary(apiaryId);
      const nextHiveId = hives[0]?.id ?? '';

      setHives(hives);
      setSelectedHiveId(nextHiveId);
      clearHiveTelemetry();

      if (nextHiveId) {
        await loadTelemetryForHive(nextHiveId);
      }
    },
    [loadTelemetryForHive],
  );

  const loadInitialData = useCallback(async () => {
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
        clearHiveTelemetry();
      }
    } catch (error) {
      setApiaries([]);
      setSelectedApiaryId('');
      setHives([]);
      setSelectedHiveId('');
      clearHiveTelemetry();
      setError(getApiErrorMessage(error, telemetryLoadErrorMessage));
    } finally {
      setLoading(false);
    }
  }, [loadHivesForApiary]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const handleApiaryChange = async (apiaryId: string) => {
    setSelectedApiaryId(apiaryId);
    setSelectedHiveId('');
    setHives([]);
    clearHiveTelemetry();

    if (!apiaryId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loadHivesForApiary(apiaryId);
    } catch (error) {
      setHives([]);
      setSelectedHiveId('');
      clearHiveTelemetry();
      setError(getApiErrorMessage(error, telemetryLoadErrorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleHiveChange = async (hiveId: string) => {
    setSelectedHiveId(hiveId);
    clearHiveTelemetry();

    if (!hiveId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loadTelemetryForHive(hiveId);
    } catch (error) {
      clearHiveTelemetry();
      setError(getApiErrorMessage(error, telemetryLoadErrorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Telemetrija"
        subtitle="Grafici težine, temperature, vlažnosti i poslednje merenje"
      />

      {apiaries.length > 0 ? (
        <TelemetryFilters
          apiaries={apiaries}
          disabled={loading}
          hives={hives}
          onApiaryChange={(apiaryId) => void handleApiaryChange(apiaryId)}
          onHiveChange={(hiveId) => void handleHiveChange(hiveId)}
          selectedApiaryId={selectedApiaryId}
          selectedHiveId={selectedHiveId}
        />
      ) : null}

      {loading ? <section className="section-card">Učitavanje telemetrije...</section> : null}

      {error ? (
        <section className="section-card message-card error" role="alert">
          <strong>{telemetryLoadErrorMessage}</strong>
          {error !== telemetryLoadErrorMessage ? <span>{error}</span> : null}
        </section>
      ) : null}

      {!loading && !error && apiaries.length === 0 ? (
        <section className="section-card">Prvo dodajte pčelinjak.</section>
      ) : null}

      {!loading && !error && selectedApiaryId && hives.length === 0 ? (
        <section className="section-card">Prvo dodajte košnicu za izabrani pčelinjak.</section>
      ) : null}

      {!loading && !error && selectedHiveId && !hasAnyTelemetry ? (
        <>
          <TelemetryStatusCards latestStatus={latestStatus} />
          <section className="section-card">Za ovu košnicu još nema telemetrijskih podataka.</section>
        </>
      ) : null}

      {!loading && !error && selectedHiveId && hasAnyTelemetry && !hasTelemetryForSelectedPeriod ? (
        <>
          <TelemetryStatusCards latestStatus={latestStatus} />
          <section className="section-card">Za izabrani period nema telemetrijskih podataka za grafike.</section>
        </>
      ) : null}

      {!loading && !error && selectedHiveId && hasTelemetryForSelectedPeriod ? (
        <>
          <TelemetryStatusCards latestStatus={latestStatus} />
          <TelemetryCharts telemetryReadings={telemetryReadings} dailyDeltas={dailyDeltas} />
        </>
      ) : null}
    </div>
  );
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function formatApiDateTime(date: Date) {
  return date.toISOString();
}
