// Stranica za uredjaje.

import { type ChangeEvent, useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Cpu,
  Hash,
  MapPinned,
  PackageOpen,
  Plus,
  Power,
  RadioTower,
  Scale,
  Warehouse,
} from 'lucide-react';
import {
  getApiaries,
  getApiErrorMessage,
  getDeviceByHive,
  getHivesByApiary,
  type ApiaryDto,
  type DeviceDto,
  type HiveDto,
} from '../api/apiClient';
import devicesBanner from '../assets/banners/devices-banner.png';
import ActivateDeviceModal from '../components/ActivateDeviceModal';
import PageHeader from '../components/PageHeader';
import RegisterDeviceModal from '../components/RegisterDeviceModal';
import StatusBadge from '../components/StatusBadge';

export default function DevicesPage() {
  const [apiaries, setApiaries] = useState<ApiaryDto[]>([]);
  const [selectedApiaryId, setSelectedApiaryId] = useState('');
  const [hives, setHives] = useState<HiveDto[]>([]);
  const [selectedHiveId, setSelectedHiveId] = useState('');
  const [device, setDevice] = useState<DeviceDto | null>(null);
  const [apiariesLoading, setApiariesLoading] = useState(true);
  const [hivesLoading, setHivesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const selectedApiary = apiaries.find((apiary) => apiary.id === selectedApiaryId);
  const selectedHive = hives.find((hive) => hive.id === selectedHiveId);

  async function loadDeviceForHive(hiveId: string) {
    setLoading(true);
    setError(null);
    setDevice(null);

    try {
      const device = await getDeviceByHive(hiveId);
      setDevice(device);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greška pri učitavanju uređaja.'));
    } finally {
      setLoading(false);
    }
  }

  async function loadHivesForApiary(apiaryId: string) {
    setHivesLoading(true);
    setError(null);
    setHives([]);
    setSelectedHiveId('');
    setDevice(null);

    let nextHiveId = '';

    try {
      const hives = await getHivesByApiary(apiaryId);
      nextHiveId = hives.length > 0 ? hives[0].id : '';

      setHives(hives);
      setSelectedHiveId(nextHiveId);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greška pri učitavanju košnica.'));
    } finally {
      setHivesLoading(false);
    }

    if (nextHiveId) {
      await loadDeviceForHive(nextHiveId);
    }
  }

  async function fetchInitialData() {
    setApiariesLoading(true);
    setError(null);

    let nextApiaryId = '';

    try {
      const apiaries = await getApiaries();
      nextApiaryId = apiaries.length > 0 ? apiaries[0].id : '';

      setApiaries(apiaries);
      setSelectedApiaryId(nextApiaryId);
    } catch (error) {
      setApiaries([]);
      setSelectedApiaryId('');
      setHives([]);
      setSelectedHiveId('');
      setDevice(null);
      setError(getApiErrorMessage(error, 'Greška pri učitavanju pčelinjaka.'));
    } finally {
      setApiariesLoading(false);
    }

    if (nextApiaryId) {
      await loadHivesForApiary(nextApiaryId);
    }
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  const clearFeedback = () => {
    setSuccessMessage(null);
    setAccessToken(null);
  };

  const handleApiaryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextApiaryId = event.target.value;

    clearFeedback();
    setSelectedApiaryId(nextApiaryId);

    if (nextApiaryId) {
      loadHivesForApiary(nextApiaryId);
    } else {
      setHives([]);
      setSelectedHiveId('');
      setDevice(null);
    }
  };

  const handleHiveChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextHiveId = event.target.value;

    clearFeedback();
    setSelectedHiveId(nextHiveId);

    if (nextHiveId) {
      loadDeviceForHive(nextHiveId);
    } else {
      setDevice(null);
    }
  };

  async function reloadSelectedDevice() {
    if (selectedHiveId) {
      await loadDeviceForHive(selectedHiveId);
    }
  }

  const handleDeviceRegistered = async () => {
    setSuccessMessage('Uređaj je uspešno registrovan.');
    setAccessToken(null);
    await reloadSelectedDevice();
  };

  const handleDeviceActivated = async (token?: string) => {
    setSuccessMessage('Uređaj je uspešno aktiviran.');
    setAccessToken(token ? token : null);
    await reloadSelectedDevice();
  };

  const pageLoading = apiariesLoading || hivesLoading || loading;

  return (
    <div className="page-stack resource-page devices-page banner-page">
      <PageHeader
        bannerImage={devicesBanner}
        title="Uređaji"
        subtitle="Povežite pametne vage sa košnicama, proverite status uparivanja i upravljajte aktivacijom."
        action={
          <button
            aria-label="Registruj uređaj"
            className="primary-button apiary-add-button page-banner-action"
            disabled={!selectedHiveId}
            onClick={() => setRegisterModalOpen(true)}
            type="button"
          >
            <Plus aria-hidden="true" size={20} />
            <span className="page-banner-action-label">Registruj uređaj</span>
          </button>
        }
      />

      {!apiariesLoading && apiaries.length > 0 ? (
        <section className="resource-summary-grid" aria-label="Pregled uređaja">
          <article className="resource-summary-card resource-tone-device">
            <div className="resource-summary-icon">
              <Cpu size={22} />
            </div>
            <div>
              <span>Status uređaja</span>
              <strong className="resource-summary-name">
                {device ? getDeviceStatusLabel(device.status) : 'Nije registrovan'}
              </strong>
              <small>{selectedHive?.label ?? 'Izaberite košnicu'}</small>
            </div>
          </article>
          <article className="resource-summary-card resource-tone-apiary">
            <div className="resource-summary-icon">
              <MapPinned size={22} />
            </div>
            <div>
              <span>Pčelinjak</span>
              <strong className="resource-summary-name">{selectedApiary?.name ?? 'Nije izabran'}</strong>
              <small>{apiaries.length} dostupno</small>
            </div>
          </article>
          <article className="resource-summary-card resource-tone-hive">
            <div className="resource-summary-icon">
              <Warehouse size={22} />
            </div>
            <div>
              <span>Košnice</span>
              <strong>{hives.length}</strong>
              <small>u izabranom pčelinjaku</small>
            </div>
          </article>
        </section>
      ) : null}

      {apiaries.length > 0 ? (
        <section className="section-card resource-filter-card device-selector-card">
          <div className="resource-filter-heading">
            <div className="resource-filter-icon">
              <RadioTower size={19} />
            </div>
            <div>
              <h2>Pronađite uređaj</h2>
              <p>Izaberite pčelinjak, zatim košnicu čiji uređaj želite da pregledate.</p>
            </div>
          </div>
          <div className="device-filter-grid">
            <label className="resource-filter-step">
              <span><b>1</b> Pčelinjak</span>
              <select
                disabled={apiariesLoading || hivesLoading || loading}
                onChange={handleApiaryChange}
                value={selectedApiaryId}
              >
                {apiaries.map((apiary) => (
                  <option key={apiary.id} value={apiary.id}>
                    {apiary.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="resource-filter-step">
              <span><b>2</b> Košnica</span>
              <select
                disabled={hivesLoading || loading || hives.length === 0}
                onChange={handleHiveChange}
                value={selectedHiveId}
              >
                {hives.length === 0 ? <option value="">Nema dostupnih košnica</option> : null}
                {hives.map((hive) => (
                  <option key={hive.id} value={hive.id}>
                    {hive.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>
      ) : null}

      {pageLoading ? (
        <section className="section-card resource-loading" aria-busy="true" aria-live="polite">
          <span className="resource-spinner" />
          <div>
            <strong>Učitavanje uređaja</strong>
            <p>Proveravamo košnice i status povezanog uređaja.</p>
          </div>
        </section>
      ) : null}

      {successMessage ? (
        <section className="section-card message-card success resource-feedback resource-feedback-token" role="status">
          <CheckCircle2 size={20} />
          <div>
            <strong>{successMessage}</strong>
            {accessToken ? (
              <div className="access-token-box">
                <span>Pristupni token uređaja</span>
                <code>{accessToken}</code>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {error ? (
        <section className="section-card message-card error resource-feedback" role="alert">
          <AlertCircle size={20} />
          <strong>{error}</strong>
        </section>
      ) : null}

      {!apiariesLoading && !error && apiaries.length === 0 ? (
        <section className="section-card resource-empty-state">
          <div className="resource-empty-icon">
            <MapPinned size={28} />
          </div>
          <h2>Najpre dodajte pčelinjak</h2>
          <p>Uređaj se povezuje sa konkretnom košnicom unutar pčelinjaka.</p>
        </section>
      ) : null}

      {!apiariesLoading && !error && selectedApiaryId && !hivesLoading && hives.length === 0 ? (
        <section className="section-card resource-empty-state">
          <div className="resource-empty-icon">
            <PackageOpen size={28} />
          </div>
          <h2>Nema dostupnih košnica</h2>
          <p>Dodajte košnicu u pčelinjak „{selectedApiary?.name}“ pre registracije uređaja.</p>
        </section>
      ) : null}

      {!loading && !error && selectedHiveId && hives.length > 0 && device === null ? (
        <section className="section-card resource-empty-state device-empty-state">
          <div className="resource-empty-icon">
            <Cpu size={28} />
          </div>
          <h2>Uređaj još nije registrovan</h2>
          <p>
            Košnica „{selectedHive?.label}“ trenutno nema povezanu pametnu vagu. Registrujte uređaj
            da biste započeli praćenje.
          </p>
          <button className="primary-button" onClick={() => setRegisterModalOpen(true)} type="button">
            <Plus size={18} />
            Registruj uređaj
          </button>
        </section>
      ) : null}

      {!loading && !error && device ? (
        <article className="section-card device-card resource-device-card">
          <div className="device-card-main">
            <div className="device-identity">
              <div className="device-hero-icon">
                <Scale size={28} />
              </div>
              <div>
                <span className="resource-eyebrow">Pametna vaga</span>
                <h2>{selectedHive?.label ?? 'Povezani uređaj'}</h2>
                <p>Serijski broj: {device.serialNumber}</p>
              </div>
            </div>
            <div className="device-actions">
              <StatusBadge tone={getDeviceStatusTone(device.status)}>
                {getDeviceStatusLabel(device.status)}
              </StatusBadge>
              {isDeviceUnpaired(device) ? (
                <button
                  className="primary-button apiary-add-button"
                  onClick={() => setActivateModalOpen(true)}
                  type="button"
                >
                  <Power size={17} />
                  Aktiviraj uređaj
                </button>
              ) : null}
            </div>
          </div>

          <div className="detail-grid resource-device-details">
            <div>
              <span><Hash size={15} /> Serijski broj</span>
              <strong>{device.serialNumber}</strong>
            </div>
            <div>
              <span><RadioTower size={15} /> Identifikator</span>
              <strong>{device.deviceIdentifier || 'Dodeljuje se pri aktivaciji'}</strong>
            </div>
            <div>
              <span><Warehouse size={15} /> Košnica</span>
              <strong>{selectedHive?.label ?? '-'}</strong>
            </div>
            <div>
              <span><CalendarDays size={15} /> Registrovan</span>
              <strong>{formatDate(device.createdAt)}</strong>
            </div>
            <div>
              <span><Power size={15} /> Status veze</span>
              <strong>{getDeviceStatusLabel(device.status)}</strong>
            </div>
            <div>
              <span><CheckCircle2 size={15} /> Aktiviran</span>
              <strong>{device.pairedAt ? formatDate(device.pairedAt) : 'Čeka aktivaciju'}</strong>
            </div>
          </div>
        </article>
      ) : null}

      {registerModalOpen ? (
        <RegisterDeviceModal
          onClose={() => setRegisterModalOpen(false)}
          onDeviceRegistered={handleDeviceRegistered}
          selectedHiveId={selectedHiveId}
        />
      ) : null}

      {activateModalOpen && device ? (
        <ActivateDeviceModal
          initialSerialNumber={device.serialNumber}
          onClose={() => setActivateModalOpen(false)}
          onDeviceActivated={handleDeviceActivated}
        />
      ) : null}
    </div>
  );
}

function getDeviceStatusLabel(status: string) {
  if (status === 'Unpaired') {
    return 'Čeka aktivaciju';
  }

  if (status === 'Paired') {
    return 'Aktivan';
  }

  return status;
}

function getDeviceStatusTone(status: string): 'good' | 'muted' {
  return status === 'Paired' ? 'good' : 'muted';
}

function isDeviceUnpaired(device: DeviceDto) {
  return device.status === 'Unpaired';
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('sr-Latn-RS', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}
