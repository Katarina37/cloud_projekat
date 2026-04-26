import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import {
  createHiveInspection,
  getApiErrorMessage,
  updateHiveInspection,
  type CreateHiveInspectionRequest,
  type HiveInspectionDto,
  type UpdateHiveInspectionRequest,
} from '../api/apiClient';

type HiveInspectionFormModalProps = {
  selectedHiveId: string;
  inspection?: HiveInspectionDto;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

type ValidatedHiveInspectionForm =
  | { operation: 'create'; payload: CreateHiveInspectionRequest }
  | { operation: 'edit'; payload: UpdateHiveInspectionRequest };

export default function HiveInspectionFormModal({
  selectedHiveId,
  inspection,
  onClose,
  onSaved,
}: HiveInspectionFormModalProps) {
  const isEditMode = Boolean(inspection);
  const [date, setDate] = useState(toInputDate(inspection?.date));
  const [framesWithHoney, setFramesWithHoney] = useState(
    inspection ? String(inspection.framesWithHoney) : '0',
  );
  const [broodFrames, setBroodFrames] = useState(inspection ? String(inspection.broodFrames) : '0');
  const [queenPresent, setQueenPresent] = useState(inspection?.queenPresent ?? true);
  const [notes, setNotes] = useState(inspection?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): ValidatedHiveInspectionForm | null => {
    const parsedFramesWithHoney = Number(framesWithHoney);
    const parsedBroodFrames = Number(broodFrames);
    const hiveId = selectedHiveId || inspection?.hiveId || '';
    const trimmedNotes = notes.trim();

    if (!hiveId) {
      setError('Izaberite košnicu.');
      return null;
    }

    if (!date) {
      setError('Datum je obavezan.');
      return null;
    }

    if (
      framesWithHoney.trim() === ''
      || !Number.isFinite(parsedFramesWithHoney)
      || parsedFramesWithHoney < 0
    ) {
      setError('Broj ramova sa medom ne sme biti negativan.');
      return null;
    }

    if (broodFrames.trim() === '' || !Number.isFinite(parsedBroodFrames) || parsedBroodFrames < 0) {
      setError('Broj ramova legla ne sme biti negativan.');
      return null;
    }

    const payload = {
      hiveId,
      date,
      framesWithHoney: parsedFramesWithHoney,
      broodFrames: parsedBroodFrames,
      queenPresent,
      notes: trimmedNotes.length > 0 ? trimmedNotes : null,
    };

    setError(null);

    return isEditMode ? { operation: 'edit', payload } : { operation: 'create', payload };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateForm();

    if (!result) {
      return;
    }

    setLoading(true);

    try {
      if (result.operation === 'edit' && inspection) {
        await updateHiveInspection(inspection.id, result.payload);
      } else if (result.operation === 'create') {
        await createHiveInspection(result.payload);
      }

      await onSaved();
      setLoading(false);
      onClose();
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          isEditMode ? 'Greška pri izmeni zapisa.' : 'Greška pri dodavanju zapisa.',
        ),
      );
      setLoading(false);
    }
  };

  const title = isEditMode ? 'Izmeni zapis' : 'Dodaj zapis';

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <section
        aria-labelledby="hive-inspection-form-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="hive-inspection-form-title">{title}</h2>
            <p>Pregled košnice</p>
          </div>
          <button aria-label="Zatvori modal" className="modal-close-button" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Date
            <input autoFocus onChange={(event) => setDate(event.target.value)} type="date" value={date} />
          </label>

          <label>
            FramesWithHoney
            <input
              min="0"
              onChange={(event) => setFramesWithHoney(event.target.value)}
              step="1"
              type="number"
              value={framesWithHoney}
            />
          </label>

          <label>
            BroodFrames
            <input
              min="0"
              onChange={(event) => setBroodFrames(event.target.value)}
              step="1"
              type="number"
              value={broodFrames}
            />
          </label>

          <label className="checkbox-label">
            <input
              checked={queenPresent}
              onChange={(event) => setQueenPresent(event.target.checked)}
              type="checkbox"
            />
            QueenPresent
          </label>

          <label>
            Notes
            <textarea
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Napomena"
              rows={4}
              value={notes}
            />
          </label>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button apiary-submit-button" disabled={loading} type="submit">
            {loading ? 'Čuvanje...' : title}
          </button>
        </form>
      </section>
    </div>
  );
}

function toInputDate(value?: string) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value.slice(0, 10) : date.toISOString().slice(0, 10);
}
