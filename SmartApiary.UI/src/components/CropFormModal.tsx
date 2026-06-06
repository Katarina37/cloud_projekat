import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import {
  createCrop,
  getApiErrorMessage,
  updateCrop,
  type CropDto,
} from '../api/apiClient';

type CropFormModalProps = {
  selectedParcelId: string;
  crop?: CropDto;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

export default function CropFormModal({ selectedParcelId, crop, onClose, onSaved }: CropFormModalProps) {
  const isEditMode = crop !== undefined;
  const [name, setName] = useState(crop ? crop.name : '');
  const [expectedBloomingStart, setExpectedBloomingStart] = useState(
    toInputDate(crop ? crop.expectedBloomingStart : undefined),
  );
  const [expectedBloomingEnd, setExpectedBloomingEnd] = useState(
    toInputDate(crop ? crop.expectedBloomingEnd : undefined),
  );
  const [area, setArea] = useState(
    crop && crop.area !== null && crop.area !== undefined
      ? String(crop.area)
      : '',
  );
  const [notes, setNotes] = useState(crop && crop.notes ? crop.notes : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedArea = area.trim();
    const trimmedNotes = notes.trim();
    const parsedArea = trimmedArea ? Number(trimmedArea) : null;

    if (!selectedParcelId) {
      setError('Izaberite parcelu.');
      return;
    }

    if (!trimmedName) {
      setError('Name ne sme biti prazan.');
      return;
    }

    if (!expectedBloomingStart) {
      setError('ExpectedBloomingStart je obavezan.');
      return;
    }

    if (!expectedBloomingEnd) {
      setError('ExpectedBloomingEnd je obavezan.');
      return;
    }

    if (expectedBloomingEnd < expectedBloomingStart) {
      setError('ExpectedBloomingEnd ne sme biti pre ExpectedBloomingStart.');
      return;
    }

    if (parsedArea !== null && (!Number.isFinite(parsedArea) || parsedArea < 0)) {
      setError('Area ne sme biti negativna.');
      return;
    }

    const payload = {
      name: trimmedName,
      expectedBloomingStart,
      expectedBloomingEnd,
      area: parsedArea,
      notes: trimmedNotes.length > 0 ? trimmedNotes : null,
    };

    setError(null);
    setLoading(true);

    try {
      if (crop) {
        await updateCrop(crop.id, payload);
      } else {
        await createCrop({
          parcelId: selectedParcelId,
          ...payload,
        });
      }

      await onSaved();
      onClose();
    } catch (error) {
      setError(
        getApiErrorMessage(error, isEditMode ? 'Greška pri izmeni kulture.' : 'Greška pri dodavanju kulture.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
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
