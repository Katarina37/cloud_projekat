// Stranica sa telemetrijom uzivo.
// Vezbe 6 - React klijent za SignalR.

import { useEffect, useState } from 'react';
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
  type TelemetryUpdateDto,
} from '../api/apiClient';
import PageHeader from '../components/PageHeader';
import TelemetryCharts from '../components/TelemetryCharts';
import TelemetryFilters from '../components/TelemetryFilters';
import TelemetryStatusCards from '../components/TelemetryStatusCards';
import useTelemetrySignalR from '../hooks/useTelemetrySignalR';

const telemetryLoadErrorMessage = 'Greška pri učitavanju telemetrije.';
const dailyDeltaRefreshDelayMilliseconds = 500;

export default function TelemetryPage() {
  // Stanje stranice: izabrani pcelinjak/kosnica, merenja i SignalR veza.
  const [apiaries, setApiaries] = useState<ApiaryDto[]>([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState('');
  const [hives, setHives] = useState<HiveDto[]>([]);
  const [selectedHiveId, setSelectedHiveId] = useState('');
  const [telemetryReadings, setTelemetryReadings] = useState<TelemetryReadingDto[]>([]);
  const [latestStatus, setLatestStatus] = useState<LatestHiveStatusDto | null>(null);
  const [dailyDeltas, setDailyDeltas] = useState<DailyWeightDeltaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyDeltaRefreshVersion, setDailyDeltaRefreshVersion] = useState(0);
  const hasTelemetryForSelectedPeriod = telemetryReadings.length > 0;
  const hasAnyTelemetry = hasTelemetryForSelectedPeriod || latestStatus !== null || dailyDeltas.length > 0;

  const clearHiveTelemetry = () => {
    setTelemetryReadings([]);
    setLatestStatus(null);
    setDailyDeltas([]);
    setDailyDeltaRefreshVersion(0);
  };

  async function loadTelemetryForHive(hiveId: string) {
    // Ucitamo sve sto treba za izabranu kosnicu.
    const { from, to } = getTelemetryDateRange();
    const telemetryReadings = await getTelemetryForHive(
      hiveId,
      from,
      to,
    );
    const latestStatus = await getLatestHiveStatus(hiveId);
    const dailyDeltas = await getDailyWeightDeltas(
      hiveId,
      from,
      to,
    );

    setTelemetryReadings(telemetryReadings);
    setLatestStatus(latestStatus);
    setDailyDeltas(dailyDeltas);
  }

  async function loadHivesForApiary(apiaryId: string) {
    const hives = await getHivesByApiary(apiaryId);
    const nextHiveId = hives.length > 0 ? hives[0].id : '';

    setHives(hives);
    setSelectedHiveId(nextHiveId);
    clearHiveTelemetry();

    if (nextHiveId) {
      await loadTelemetryForHive(nextHiveId);
    }
  }

  async function loadInitialData() {
    setLoading(true);
    setError(null);

    try {
      const apiaries = await getApiaries();
      const nextApiaryId = apiaries.length > 0 ? apiaries[0].id : '';

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
  }

  useEffect(() => {
    // Ucitavanje telemetrije pri prvom otvaranju stranice.
    loadInitialData();
  }, []);

  const receiveTelemetryUpdate = (update: TelemetryUpdateDto) => {
    if (update.apiaryId !== selectedApiaryId || update.hiveId !== selectedHiveId) {
      return;
    }

    setLatestStatus({
      hiveId: update.hiveId,
      timestamp: update.timestamp,
      weightKg: update.weight,
      temperatureCelsius: update.temperature,
      humidityPercent: update.humidity,
      batteryPercent: update.batteryLevel,
    });

    // Linijski grafici odmah dobijaju novu tacku.
    setTelemetryReadings((currentReadings) => {
      const nextReading: TelemetryReadingDto = {
        id: `${update.deviceId}-${update.timestamp}`,
        hiveId: update.hiveId,
        deviceId: update.deviceId,
        timestamp: update.timestamp,
        weightKg: update.weight,
        temperatureCelsius: update.temperature,
        humidityPercent: update.humidity,
        batteryPercent: update.batteryLevel,
      };

      return currentReadings
        .filter((reading) => reading.id !== nextReading.id)
        .concat(nextReading)
        .sort((left, right) => (
          new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()
        ));
    });

    // Poslovni obracun stubica ostaje na backend-u.
    setDailyDeltaRefreshVersion((currentVersion) => currentVersion + 1);
  };

  useTelemetrySignalR(selectedApiaryId, receiveTelemetryUpdate);

  useEffect(() => {
    if (!selectedHiveId || dailyDeltaRefreshVersion === 0) {
      return;
    }

    let isActive = true;
    const timeoutId = window.setTimeout(async () => {
      try {
        const { from, to } = getTelemetryDateRange();
        const refreshedDeltas = await getDailyWeightDeltas(selectedHiveId, from, to);

        if (isActive) {
          setDailyDeltas(refreshedDeltas);
        }
      } catch (requestError) {
        console.error('Failed to refresh daily weight deltas.', requestError);
      }
    }, dailyDeltaRefreshDelayMilliseconds);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [selectedHiveId, dailyDeltaRefreshVersion]);

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
          onApiaryChange={handleApiaryChange}
          onHiveChange={handleHiveChange}
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

function getTelemetryDateRange() {
  return {
    from: formatApiDateTime(addDays(new Date(), -7)),
    to: formatApiDateTime(new Date()),
  };
}

function formatApiDateTime(date: Date) {
  return date.toISOString();
}
