import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Cpu, Plus, Power } from 'lucide-react';
import {
  getApiaries,
  getApiErrorMessage,
  getDeviceByHive,
  getHivesByApiary,
  type ApiaryDto,
  type DeviceDto,
  type HiveDto,
} from '../api/apiClient';
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

  const loadDeviceForHive = useCallback(async (hiveId: string) => {
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
  }, []);

  const loadHivesForApiary = useCallback(
    async (apiaryId: string) => {
      setHivesLoading(true);
      setError(null);
      setHives([]);
      setSelectedHiveId('');
      setDevice(null);

      let nextHiveId = '';

      try {
        const hives = await getHivesByApiary(apiaryId);
        nextHiveId = hives[0]?.id ?? '';

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
    },
    [loadDeviceForHive],
  );

  const fetchInitialData = useCallback(async () => {
    setApiariesLoading(true);
    setError(null);

    let nextApiaryId = '';

    try {
      const apiaries = await getApiaries();
      nextApiaryId = apiaries[0]?.id ?? '';

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
  }, [loadHivesForApiary]);

  useEffect(() => {
    void fetchInitialData();
  }, [fetchInitialData]);

  const clearFeedback = () => {
    setSuccessMessage(null);
    setAccessToken(null);
  };

  const handleApiaryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextApiaryId = event.target.value;

    clearFeedback();
    setSelectedApiaryId(nextApiaryId);

    if (nextApiaryId) {
      void loadHivesForApiary(nextApiaryId);
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
      void loadDeviceForHive(nextHiveId);
    } else {
      setDevice(null);
    }
  };

  const reloadSelectedDevice = useCallback(async () => {
    if (selectedHiveId) {
      await loadDeviceForHive(selectedHiveId);
    }
  }, [loadDeviceForHive, selectedHiveId]);

  const handleDeviceRegistered = async () => {
    setSuccessMessage('Uređaj je uspešno registrovan.');
    setAccessToken(null);
    await reloadSelectedDevice();
  };

  const handleDeviceActivated = async (token?: string) => {
    setSuccessMessage('Uređaj je uspešno aktiviran.');
    setAccessToken(token ?? null);
    await reloadSelectedDevice();
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Uređaji"
        subtitle="Pametne vage, status uparivanja i aktivacija uređaja"
        action={
          <button
            className="primary-button apiary-add-button"
            disabled={!selectedHiveId}
            onClick={() => setRegisterModalOpen(true)}
            type="button"
          >
            <Plus size={18} />
            Registruj uređaj
          </button>
        }
      />

      {apiaries.length > 0 ? (
        <section className="section-card">
          <div className="device-filter-grid">
            <label>
              Pčelinjak
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

            {hives.length > 0 ? (
              <label>
                Košnica
                <select disabled={hivesLoading || loading} onChange={handleHiveChange} value={selectedHiveId}>
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

      {apiariesLoading ? <section className="section-card">Učitavanje pčelinjaka...</section> : null}

      {hivesLoading ? <section className="section-card">Učitavanje košnica...</section> : null}

      {successMessage ? (
        <section className="section-card message-card success">
          <strong>{successMessage}</strong>
          {accessToken ? (
            <div className="access-token-box">
              <span>Access token</span>
              <code>{accessToken}</code>
            </div>
          ) : null}
        </section>
      ) : null}

      {error ? (
        <section className="section-card message-card error" role="alert">
          {error}
        </section>
      ) : null}

      {!apiariesLoading && !error && apiaries.length === 0 ? (
        <section className="section-card">Prvo dodajte pčelinjak.</section>
      ) : null}

      {!apiariesLoading && !error && selectedApiaryId && !hivesLoading && hives.length === 0 ? (
        <section className="section-card">Prvo dodajte košnicu za izabrani pčelinjak.</section>
      ) : null}

      {loading ? <section className="section-card">Učitavanje uređaja...</section> : null}

      {!loading && !error && selectedHiveId && hives.length > 0 && device === null ? (
        <section className="section-card">Za ovu košnicu još nije registrovan uređaj.</section>
      ) : null}

      {!loading && !error && device ? (
        <article className="section-card device-card">
          <div className="device-card-main">
            <div className="section-icon">
              <Cpu size={20} />
            </div>
            <div>
              <h2>Pametna vaga</h2>
              <p>{device.serialNumber}</p>
            </div>
            <div className="device-actions">
              <StatusBadge tone={getDeviceStatusTone(device.status)}>{getDeviceStatusLabel(device.status)}</StatusBadge>
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

          <div className="detail-grid">
            <div>
              <span>SerialNumber</span>
              <strong>{device.serialNumber}</strong>
            </div>
            {device.deviceIdentifier ? (
              <div>
                <span>DeviceIdentifier</span>
                <strong>{device.deviceIdentifier}</strong>
              </div>
            ) : null}
            <div>
              <span>Status</span>
              <strong>{getDeviceStatusLabel(device.status)}</strong>
            </div>
            <div>
              <span>CreatedAt</span>
              <strong>{formatDate(device.createdAt)}</strong>
            </div>
            {device.pairedAt ? (
              <div>
                <span>PairedAt</span>
                <strong>{formatDate(device.pairedAt)}</strong>
              </div>
            ) : null}
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
    return 'Neuparen';
  }

  if (status === 'Paired') {
    return 'Uparen';
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

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
