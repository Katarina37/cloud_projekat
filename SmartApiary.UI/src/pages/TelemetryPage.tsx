// Stranica sa telemetrijom uzivo.
// Vezbe 6 - React klijent za SignalR.

import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  BarChart3,
  MapPinned,
  Radio,
  Warehouse,
} from 'lucide-react';
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
import telemetryBanner from '../assets/banners/telemetry-banner.png';
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
  const selectedApiary = apiaries.find((apiary) => apiary.id === selectedApiaryId);
  const selectedHive = hives.find((hive) => hive.id === selectedHiveId);

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
    <div className="page-stack resource-page telemetry-page banner-page">
      <PageHeader
        bannerImage={telemetryBanner}
        title="Telemetrija"
        subtitle="Pratite težinu, temperaturu, vlažnost i bateriju košnice kroz istorijska i nova merenja."
        action={
          <div className="page-banner-live-status" aria-label="Telemetrija se osvježava uživo">
            <Radio aria-hidden="true" size={18} />
            <span>Podaci uživo</span>
          </div>
        }
      />

      {!loading && apiaries.length > 0 ? (
        <section className="resource-summary-grid" aria-label="Pregled telemetrije">
          <article className="resource-summary-card telemetry-tone-readings">
            <div className="resource-summary-icon">
              <Activity size={22} />
            </div>
            <div>
              <span>Merenja u periodu</span>
              <strong>{telemetryReadings.length}</strong>
              <small>poslednjih 7 dana</small>
            </div>
          </article>
          <article className="resource-summary-card resource-tone-apiary">
            <div className="resource-summary-icon">
              <MapPinned size={22} />
            </div>
            <div>
              <span>Aktivni pčelinjak</span>
              <strong className="resource-summary-name">{selectedApiary?.name ?? 'Nije izabran'}</strong>
              <small>{apiaries.length} dostupno</small>
            </div>
          </article>
          <article className="resource-summary-card telemetry-tone-hive">
            <div className="resource-summary-icon">
              <Warehouse size={22} />
            </div>
            <div>
              <span>Košnica na vezi</span>
              <strong className="resource-summary-name">{selectedHive?.label ?? 'Nije izabrana'}</strong>
              <small>{latestStatus ? 'poslednje merenje dostupno' : 'čeka prvo merenje'}</small>
            </div>
          </article>
        </section>
      ) : null}

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

      {loading ? (
        <section className="section-card resource-loading" aria-busy="true" aria-live="polite">
          <span className="resource-spinner" />
          <div>
            <strong>Učitavanje telemetrije</strong>
            <p>Pripremamo poslednja merenja i grafikone košnice.</p>
          </div>
        </section>
      ) : null}

      {error ? (
        <section className="section-card message-card error resource-feedback" role="alert">
          <AlertCircle size={20} />
          <div>
            <strong>{telemetryLoadErrorMessage}</strong>
            {error !== telemetryLoadErrorMessage ? <p>{error}</p> : null}
          </div>
        </section>
      ) : null}

      {!loading && !error && apiaries.length === 0 ? (
        <section className="section-card resource-empty-state">
          <div className="resource-empty-icon">
            <MapPinned size={28} />
          </div>
          <h2>Najpre dodajte pčelinjak</h2>
          <p>Telemetrija se prikazuje za košnice koje pripadaju vašim pčelinjacima.</p>
        </section>
      ) : null}

      {!loading && !error && selectedApiaryId && hives.length === 0 ? (
        <section className="section-card resource-empty-state">
          <div className="resource-empty-icon">
            <Warehouse size={28} />
          </div>
          <h2>Još nema košnica</h2>
          <p>Dodajte košnicu u pčelinjak „{selectedApiary?.name}“ da biste pratili njena merenja.</p>
        </section>
      ) : null}

      {!loading && !error && selectedHiveId && !hasAnyTelemetry ? (
        <>
          <section className="telemetry-section-heading">
            <div>
              <span className="resource-eyebrow">Status košnice</span>
              <h2>Poslednje merenje</h2>
            </div>
          </section>
          <TelemetryStatusCards latestStatus={latestStatus} />
          <section className="section-card resource-empty-state">
            <div className="resource-empty-icon">
              <Activity size={28} />
            </div>
            <h2>Još nema telemetrijskih podataka</h2>
            <p>Pokrenite simulator ili povezani uređaj da biste dobili prvo merenje.</p>
          </section>
        </>
      ) : null}

      {!loading && !error && selectedHiveId && hasAnyTelemetry && !hasTelemetryForSelectedPeriod ? (
        <>
          <section className="telemetry-section-heading">
            <div>
              <span className="resource-eyebrow">Status košnice</span>
              <h2>Poslednje merenje</h2>
            </div>
          </section>
          <TelemetryStatusCards latestStatus={latestStatus} />
          <section className="section-card resource-empty-state">
            <div className="resource-empty-icon">
              <BarChart3 size={28} />
            </div>
            <h2>Nema podataka za izabrani period</h2>
            <p>Poslednji status postoji, ali nema merenja u poslednjih sedam dana.</p>
          </section>
        </>
      ) : null}

      {!loading && !error && selectedHiveId && hasTelemetryForSelectedPeriod ? (
        <>
          <section className="telemetry-section-heading">
            <div>
              <span className="resource-eyebrow">Status košnice</span>
              <h2>Poslednje merenje</h2>
            </div>
            <p>Vrednosti se osvežavaju kada novo merenje stigne preko SignalR veze.</p>
          </section>
          <TelemetryStatusCards latestStatus={latestStatus} />
          <section className="telemetry-section-heading telemetry-chart-heading">
            <div>
              <span className="resource-eyebrow">Istorija merenja</span>
              <h2>Kretanje podataka kroz vrijeme</h2>
            </div>
            <p>Grafikoni obuhvataju poslednjih sedam dana za izabranu košnicu.</p>
          </section>
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
