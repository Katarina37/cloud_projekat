import { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { getAlertSettings, type AlertSettingsDto } from '../api/apiClient';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import SettingsModal from '../components/SettingsModal';

const defaultWeightDropThresholdKg = 10;
const loadingMessage = 'Učitavanje podešavanja...';
const loadErrorMessage = 'Greška pri učitavanju podešavanja.';
const successText = 'Podešavanja su sačuvana.';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AlertSettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  async function loadSettings(clearSuccessMessage = true) {
    setLoading(true);
    setError(null);

    if (clearSuccessMessage) {
      setSuccessMessage(null);
    }

    try {
      const nextSettings = await getAlertSettings();
      setSettings(nextSettings);
      return true;
    } catch {
      setSettings(null);
      setError(loadErrorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSettingsSaved = async () => {
    setIsSettingsModalOpen(false);

    const refreshed = await loadSettings(false);

    if (refreshed) {
      setSuccessMessage(successText);
    }
  };

  const hasLoadError = error === loadErrorMessage;
  const weightDropThresholdKg = settings
    ? settings.weightDropThresholdKg
    : defaultWeightDropThresholdKg;

  return (
    <div className="page-stack">
      <PageHeader
        title="Podešavanja"
        subtitle="Osnovna podešavanja korisnika i pragovi upozorenja"
        action={
          <button
            className="primary-button"
            disabled={loading || hasLoadError}
            onClick={() => {
              setSuccessMessage(null);
              setError(null);
              setIsSettingsModalOpen(true);
            }}
            type="button"
          >
            <SlidersHorizontal size={18} />
            Podešavanja upozorenja
          </button>
        }
      />

      {loading ? <section className="section-card">{loadingMessage}</section> : null}

      {!loading && error ? (
        <section className="section-card message-card error" role="alert">
          {error}
        </section>
      ) : null}

      {!loading && successMessage ? (
        <section className="section-card message-card success">
          {successMessage}
        </section>
      ) : null}

      {!loading && !hasLoadError ? (
        <section className="settings-grid">
          <SectionCard
            title="Pragovi upozorenja"
            subtitle="Trenutna podešavanja za upozorenja"
            icon={<SlidersHorizontal size={18} />}
          >
            <div className="detail-grid">
              <div>
                <span>weightDropThreshold</span>
                <strong>{weightDropThresholdKg} kg</strong>
              </div>
              <div>
                <span>Poslednja izmena</span>
                <strong>{settings && settings.updatedAt ? formatDateTime(settings.updatedAt) : '-'}</strong>
              </div>
            </div>
          </SectionCard>
        </section>
      ) : null}

      {isSettingsModalOpen ? (
        <SettingsModal
          initialWeightDropThresholdKg={weightDropThresholdKg}
          onClose={() => setIsSettingsModalOpen(false)}
          onSaved={handleSettingsSaved}
        />
      ) : null}
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || '-';
  }

  return date.toLocaleString('sr-Latn-RS', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
