import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { getApiErrorMessage, updateAlertSettings } from '../api/apiClient';

type SettingsModalProps = {
  initialWeightDropThresholdKg: number;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

const validationMessage = 'Prag pada težine mora biti veći od 0.';

export default function SettingsModal({
  initialWeightDropThresholdKg,
  onClose,
  onSaved,
}: SettingsModalProps) {
  const [weightDropThreshold, setWeightDropThreshold] = useState(String(initialWeightDropThresholdKg));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedWeightDropThreshold = Number(weightDropThreshold);

    if (
      weightDropThreshold.trim() === ''
      || !Number.isFinite(parsedWeightDropThreshold)
      || parsedWeightDropThreshold <= 0
    ) {
      setError(validationMessage);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateAlertSettings({ weightDropThresholdKg: parsedWeightDropThreshold });
      await onSaved();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Greška pri čuvanju podešavanja.'));
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose} role="presentation">
      <section
        aria-labelledby="settings-modal-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="settings-modal-title">Podešavanja upozorenja</h2>
            <p>Unesite prag pada težine za upozorenja.</p>
          </div>
          <button
            aria-label="Zatvori modal"
            className="modal-close-button"
            disabled={saving}
            onClick={handleClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            weightDropThreshold (kg)
            <input
              aria-invalid={Boolean(error)}
              autoFocus
              min="0.1"
              onChange={(event) => {
                setWeightDropThreshold(event.target.value);
                setError(null);
              }}
              step="0.1"
              type="number"
              value={weightDropThreshold}
            />
          </label>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button apiary-submit-button" disabled={saving} type="submit">
            {saving ? 'Čuvanje...' : 'Sačuvaj podešavanja'}
          </button>
        </form>
      </section>
    </div>
  );
}
