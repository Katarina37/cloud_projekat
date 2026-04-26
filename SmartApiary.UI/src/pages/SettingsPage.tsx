import { useEffect, useState } from 'react';
import { Save, SlidersHorizontal } from 'lucide-react';
import {
  getAlertSettings,
  updateAlertSettings,
  type AlertSettingsDto,
} from '../api/apiClient';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';

const defaultWeightDropThresholdKg = 10;
const loadingMessage = 'Učitavanje podešavanja...';
const loadErrorMessage = 'Greška pri učitavanju podešavanja.';
const saveErrorMessage = 'Greška pri čuvanju podešavanja.';
const validationMessage = 'Prag pada težine mora biti veći od 0.';
const successText = 'Podešavanja su sačuvana.';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AlertSettingsDto | null>(null);
  const [weightDropThresholdKg, setWeightDropThresholdKg] = useState(defaultWeightDropThresholdKg);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const settings = await getAlertSettings();

        setSettings(settings);
        setWeightDropThresholdKg(settings?.weightDropThresholdKg ?? defaultWeightDropThresholdKg);
      } catch {
        setSettings(null);
        setWeightDropThresholdKg(defaultWeightDropThresholdKg);
        setError(loadErrorMessage);
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, []);

  const handleSave = async () => {
    setSuccessMessage(null);

    if (!Number.isFinite(weightDropThresholdKg) || weightDropThresholdKg <= 0) {
      setError(validationMessage);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateAlertSettings({ weightDropThresholdKg });
      setSettings((currentSettings) => ({
        userId: currentSettings?.userId ?? '',
        updatedAt: currentSettings?.updatedAt ?? '',
        weightDropThresholdKg,
      }));
      setSuccessMessage(successText);
    } catch {
      setError(saveErrorMessage);
    } finally {
      setSaving(false);
    }
  };

  const hasLoadError = error === loadErrorMessage;

  return (
    <div className="page-stack">
      <PageHeader
        title="Podešavanja"
        subtitle="Osnovna podešavanja korisnika i pragovi upozorenja"
        action={
          <button
            className="primary-button"
            type="button"
            onClick={handleSave}
            disabled={loading || saving || hasLoadError}
          >
            <Save size={18} />
            {saving ? 'Čuvanje...' : 'Sačuvaj podešavanja'}
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
            subtitle="Korisnička podešavanja za upozorenja"
            icon={<SlidersHorizontal size={18} />}
          >
            <div className="form-grid">
              <label>
                Prag pada težine u 24h (kg)
                <input
                  aria-invalid={!Number.isFinite(weightDropThresholdKg) || weightDropThresholdKg <= 0}
                  min="0.1"
                  step="0.1"
                  type="number"
                  value={weightDropThresholdKg}
                  onChange={(event) => {
                    setWeightDropThresholdKg(Number(event.target.value));
                    setSuccessMessage(null);
                    setError(null);
                  }}
                />
              </label>
            </div>
          </SectionCard>
        </section>
      ) : null}
    </div>
  );
}
