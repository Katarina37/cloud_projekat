// Modal za unos i izmenu podataka (SprayingFormModal).

import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { createSpraying, getApiErrorMessage, type CreateSprayingRequest } from '../api/apiClient';

type SprayingFormModalProps = {
  selectedParcelId: string;
  onClose: () => void;
  onSaved: (weatherWarning: string | null) => Promise<void>;
};

export default function SprayingFormModal({ selectedParcelId, onClose, onSaved }: SprayingFormModalProps) {
  const [startTime, setStartTime] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [preparationType, setPreparationType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): CreateSprayingRequest | null => {
    const parsedDurationHours = Number(durationHours);
    const trimmedPreparationType = preparationType.trim();

    if (!selectedParcelId) {
      setError('Izaberite parcelu.');
      return null;
    }

    if (!startTime) {
      setError('StartTime je obavezan.');
      return null;
    }

    if (
      durationHours.trim() === ''
      || !Number.isFinite(parsedDurationHours)
      || !Number.isInteger(parsedDurationHours)
      || parsedDurationHours <= 0
    ) {
      setError('DurationHours mora biti veći od 0.');
      return null;
    }

    setError(null);

    return {
      parcelId: selectedParcelId,
      startTime,
      durationHours: parsedDurationHours,
      preparationType: trimmedPreparationType.length > 0 ? trimmedPreparationType : null,
    };
  };

  const resetForm = () => {
    setStartTime('');
    setDurationHours('');
    setPreparationType('');
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = validateForm();

    if (!payload) {
      return;
    }

    setLoading(true);

    try {
      const result = await createSpraying(payload);
      resetForm();
      await onSaved(result.weatherWarning);
      onClose();
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greška pri zakazivanju tretiranja.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose} role="presentation">
      <section
        aria-labelledby="spraying-form-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="spraying-form-title">Zakaži tretiranje</h2>
            <p>Unesite termin i trajanje tretiranja za izabranu parcelu.</p>
          </div>
          <button
            aria-label="Zatvori modal"
            className="modal-close-button"
            disabled={loading}
            onClick={handleClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            StartTime
            <input
              autoFocus
              onChange={(event) => setStartTime(event.target.value)}
              type="datetime-local"
              value={startTime}
            />
          </label>

          <label>
            DurationHours
            <input
              min="1"
              onChange={(event) => setDurationHours(event.target.value)}
              placeholder="3"
              step="1"
              type="number"
              value={durationHours}
            />
          </label>

          <label>
            PreparationType
            <input
              onChange={(event) => setPreparationType(event.target.value)}
              placeholder="Naziv preparata"
              type="text"
              value={preparationType}
            />
          </label>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button orange-button" disabled={loading} type="submit">
            {loading ? 'Čuvanje...' : 'Zakaži tretiranje'}
          </button>
        </form>
      </section>
    </div>
  );
}
