import { HubConnectionBuilder, HubConnectionState, type HubConnection } from '@microsoft/signalr';
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
import { getAuthToken } from '../auth/authStorage';
import PageHeader from '../components/PageHeader';
import TelemetryCharts from '../components/TelemetryCharts';
import TelemetryFilters from '../components/TelemetryFilters';
import TelemetryStatusCards from '../components/TelemetryStatusCards';

const telemetryLoadErrorMessage = 'Greška pri učitavanju telemetrije.';
const telemetryHubUrl = 'https://localhost:7035/hubs/telemetry';
const telemetryUpdateEvent = 'ReceiveTelemetryUpdate';
const telemetryToDate = formatApiDateTime(new Date());
const telemetryFromDate = formatApiDateTime(addDays(new Date(), -7));

export default function TelemetryPage() {
  const [apiaries, setApiaries] = useState<ApiaryDto[]>([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState('');
  const [hives, setHives] = useState<HiveDto[]>([]);
  const [selectedHiveId, setSelectedHiveId] = useState('');
  const [telemetryReadings, setTelemetryReadings] = useState<TelemetryReadingDto[]>([]);
  const [latestStatus, setLatestStatus] = useState<LatestHiveStatusDto | null>(null);
  const [dailyDeltas, setDailyDeltas] = useState<DailyWeightDeltaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signalRConnection, setSignalRConnection] = useState<HubConnection | null>(null);
  const [signalRConnected, setSignalRConnected] = useState(false);
  const hasTelemetryForSelectedPeriod = telemetryReadings.length > 0;
  const hasAnyTelemetry = hasTelemetryForSelectedPeriod || latestStatus !== null || dailyDeltas.length > 0;

  const clearHiveTelemetry = () => {
    setTelemetryReadings([]);
    setLatestStatus(null);
    setDailyDeltas([]);
  };

  async function loadTelemetryForHive(hiveId: string) {
    const telemetryReadings = await getTelemetryForHive(
      hiveId,
      telemetryFromDate,
      telemetryToDate,
    );
    const latestStatus = await getLatestHiveStatus(hiveId);
    const dailyDeltas = await getDailyWeightDeltas(
      hiveId,
      telemetryFromDate,
      telemetryToDate,
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

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(telemetryHubUrl, {
        accessTokenFactory: () => getAuthToken() ?? '',
      })
      .withAutomaticReconnect()
      .build();
    let isActive = true;

    connection.onreconnecting(() => {
      if (isActive) {
        setSignalRConnected(false);
      }
    });

    connection.onreconnected(() => {
      if (isActive) {
        setSignalRConnected(true);
      }
    });

    connection.onclose(() => {
      if (isActive) {
        setSignalRConnected(false);
      }
    });

    async function startConnection() {
      try {
        await connection.start();

        if (isActive) {
          setSignalRConnection(connection);
          setSignalRConnected(true);
        }
      } catch (connectionError) {
        console.error('SignalR connection failed.', connectionError);
      }
    }

    startConnection();

    return () => {
      isActive = false;
      connection.stop();
    };
  }, []);

  useEffect(() => {
    if (!signalRConnection || !signalRConnected || !selectedApiaryId) {
      return;
    }

    signalRConnection
      .invoke('JoinApiaryGroup', selectedApiaryId)
      .catch((connectionError) => {
        console.error('Failed to join apiary SignalR group.', connectionError);
      });

    return () => {
      if (signalRConnection.state === HubConnectionState.Connected) {
        signalRConnection
          .invoke('LeaveApiaryGroup', selectedApiaryId)
          .catch((connectionError) => {
            console.error('Failed to leave apiary SignalR group.', connectionError);
          });
      }
    };
  }, [signalRConnection, signalRConnected, selectedApiaryId]);

  useEffect(() => {
    if (!signalRConnection) {
      return;
    }

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
    };

    signalRConnection.on(telemetryUpdateEvent, receiveTelemetryUpdate);

    return () => {
      signalRConnection.off(telemetryUpdateEvent, receiveTelemetryUpdate);
    };
  }, [signalRConnection, selectedApiaryId, selectedHiveId]);

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

function formatApiDateTime(date: Date) {
  return date.toISOString();
}
