// Modal za unos i izmenu podataka (RescheduleSprayingModal).

import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import {
  getApiErrorMessage,
  rescheduleSpraying,
  type RescheduleSprayingRequest,
  type SprayingAnnouncementDto,
} from '../api/apiClient';

type RescheduleSprayingModalProps = {
  spraying: SprayingAnnouncementDto;
  onClose: () => void;
  onSaved: (weatherWarning: string | null) => Promise<void>;
};

export default function RescheduleSprayingModal({
  spraying,
  onClose,
  onSaved,
}: RescheduleSprayingModalProps) {
  const [newStartTime, setNewStartTime] = useState(toInputDateTime(spraying.startTime));
  const [newDurationHours, setNewDurationHours] = useState(String(spraying.durationHours || ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): RescheduleSprayingRequest | null => {
    const parsedDurationHours = Number(newDurationHours);

    if (!newStartTime) {
      setError('NewStartTime je obavezan.');
      return null;
    }

    if (
      newDurationHours.trim() === ''
      || !Number.isFinite(parsedDurationHours)
      || !Number.isInteger(parsedDurationHours)
      || parsedDurationHours <= 0
    ) {
      setError('NewDurationHours mora biti veći od 0.');
      return null;
    }

    setError(null);

    return {
      newStartTime,
      newDurationHours: parsedDurationHours,
    };
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
      const result = await rescheduleSpraying(spraying.id, payload);
      await onSaved(result.weatherWarning);
      onClose();
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greška pri pomeranju tretiranja.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose} role="presentation">
      <section
        aria-labelledby="reschedule-spraying-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="reschedule-spraying-title">Pomeri termin</h2>
            <p>Unesite novi termin i trajanje tretiranja.</p>
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
            NewStartTime
            <input
              autoFocus
              onChange={(event) => setNewStartTime(event.target.value)}
              type="datetime-local"
              value={newStartTime}
            />
          </label>

          <label>
            NewDurationHours
            <input
              min="1"
              onChange={(event) => setNewDurationHours(event.target.value)}
              placeholder="3"
              step="1"
              type="number"
              value={newDurationHours}
            />
          </label>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button orange-button" disabled={loading} type="submit">
            {loading ? 'Čuvanje...' : 'Pomeri termin'}
          </button>
        </form>
      </section>
    </div>
  );
}

function toInputDateTime(value: string) {
  if (!value) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 16);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join('-')
    + `T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0');
}
