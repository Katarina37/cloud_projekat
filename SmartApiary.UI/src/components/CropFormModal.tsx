import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import {
  createCrop,
  getApiErrorMessage,
  updateCrop,
  type CreateCropRequest,
  type CropDto,
  type UpdateCropRequest,
} from '../api/apiClient';

type CropFormModalProps = {
  selectedParcelId: string;
  crop?: CropDto;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

type ValidatedCropForm =
  | { operation: 'create'; payload: CreateCropRequest }
  | { operation: 'edit'; payload: UpdateCropRequest };

export default function CropFormModal({ selectedParcelId, crop, onClose, onSaved }: CropFormModalProps) {
  const isEditMode = Boolean(crop);
  const [name, setName] = useState(crop?.name ?? '');
  const [expectedBloomingStart, setExpectedBloomingStart] = useState(
    toInputDate(crop?.expectedBloomingStart),
  );
  const [expectedBloomingEnd, setExpectedBloomingEnd] = useState(toInputDate(crop?.expectedBloomingEnd));
  const [area, setArea] = useState(crop?.area !== null && crop?.area !== undefined ? String(crop.area) : '');
  const [notes, setNotes] = useState(crop?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): ValidatedCropForm | null => {
    const trimmedName = name.trim();
    const trimmedArea = area.trim();
    const trimmedNotes = notes.trim();
    const parsedArea = trimmedArea ? Number(trimmedArea) : null;

    if (!selectedParcelId) {
      setError('Izaberite parcelu.');
      return null;
    }

    if (!trimmedName) {
      setError('Name ne sme biti prazan.');
      return null;
    }

    if (!expectedBloomingStart) {
      setError('ExpectedBloomingStart je obavezan.');
      return null;
    }

    if (!expectedBloomingEnd) {
      setError('ExpectedBloomingEnd je obavezan.');
      return null;
    }

    if (expectedBloomingEnd < expectedBloomingStart) {
      setError('ExpectedBloomingEnd ne sme biti pre ExpectedBloomingStart.');
      return null;
    }

    if (parsedArea !== null && (!Number.isFinite(parsedArea) || parsedArea < 0)) {
      setError('Area ne sme biti negativna.');
      return null;
    }

    const payload = {
      name: trimmedName,
      expectedBloomingStart,
      expectedBloomingEnd,
      area: parsedArea,
      notes: trimmedNotes.length > 0 ? trimmedNotes : null,
    };

    setError(null);

    if (isEditMode) {
      return { operation: 'edit', payload };
    }

    return {
      operation: 'create',
      payload: {
        parcelId: selectedParcelId,
        ...payload,
      },
    };
  };

  const resetForm = () => {
    setName('');
    setExpectedBloomingStart('');
    setExpectedBloomingEnd('');
    setArea('');
    setNotes('');
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateForm();

    if (!result) {
      return;
    }

    setLoading(true);

    try {
      if (result.operation === 'edit' && crop) {
        await updateCrop(crop.id, result.payload);
      } else if (result.operation === 'create') {
        await createCrop(result.payload);
        resetForm();
      }

      await onSaved();
      setLoading(false);
      onClose();
    } catch (error) {
      setError(
        getApiErrorMessage(error, isEditMode ? 'Greška pri izmeni kulture.' : 'Greška pri dodavanju kulture.'),
      );
      setLoading(false);
    }
  };

  const title = isEditMode ? 'Izmeni kulturu' : 'Dodaj kulturu';

  return (
    <div className="modal-overlay" onClick={handleClose} role="presentation">
      <section
        aria-labelledby="crop-form-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="crop-form-title">{title}</h2>
            <p>Unesi podatke o kulturi za izabranu parcelu.</p>
          </div>
          <button
            aria-label="Zatvori modal"
            className="modal-close-button"
            disabled={loading}
            type="button"
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              autoFocus
              onChange={(event) => setName(event.target.value)}
              placeholder="Bagrem"
              type="text"
              value={name}
            />
          </label>

          <label>
            ExpectedBloomingStart
            <input
              onChange={(event) => setExpectedBloomingStart(event.target.value)}
              type="date"
              value={expectedBloomingStart}
            />
          </label>

          <label>
            ExpectedBloomingEnd
            <input
              onChange={(event) => setExpectedBloomingEnd(event.target.value)}
              type="date"
              value={expectedBloomingEnd}
            />
          </label>

          <label>
            Area
            <input
              min="0"
              onChange={(event) => setArea(event.target.value)}
              placeholder="10.5"
              step="any"
              type="number"
              value={area}
            />
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
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value.slice(0, 10) : date.toISOString().slice(0, 10);
}
