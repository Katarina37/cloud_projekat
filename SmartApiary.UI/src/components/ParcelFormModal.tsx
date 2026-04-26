import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import {
  createParcel,
  getApiErrorMessage,
  updateParcel,
  type ParcelDto,
  type UpdateParcelRequest,
} from '../api/apiClient';

type ParcelFormModalProps = {
  parcel?: ParcelDto;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

export default function ParcelFormModal({ parcel, onClose, onSaved }: ParcelFormModalProps) {
  const isEditMode = Boolean(parcel);
  const [name, setName] = useState(parcel?.name ?? '');
  const [latitude, setLatitude] = useState(parcel ? String(parcel.latitude) : '');
  const [longitude, setLongitude] = useState(parcel ? String(parcel.longitude) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): UpdateParcelRequest | null => {
    const trimmedName = name.trim();
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (!trimmedName) {
      setError('Name ne sme biti prazan.');
      return null;
    }

    if (latitude.trim() === '' || !Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
      setError('Latitude mora biti između -90 i 90.');
      return null;
    }

    if (
      longitude.trim() === ''
      || !Number.isFinite(parsedLongitude)
      || parsedLongitude < -180
      || parsedLongitude > 180
    ) {
      setError('Longitude mora biti između -180 i 180.');
      return null;
    }

    setError(null);

    return {
      name: trimmedName,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
    };
  };

  const resetForm = () => {
    setName('');
    setLatitude('');
    setLongitude('');
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
      if (parcel) {
        await updateParcel(parcel.id, payload);
      } else {
        await createParcel(payload);
        resetForm();
      }

      await onSaved();
      setLoading(false);
      onClose();
    } catch (error) {
      setError(
        getApiErrorMessage(error, isEditMode ? 'Greška pri izmeni parcele.' : 'Greška pri dodavanju parcele.'),
      );
      setLoading(false);
    }
  };

  const title = isEditMode ? 'Izmeni parcelu' : 'Dodaj parcelu';

  return (
    <div className="modal-overlay" onClick={handleClose} role="presentation">
      <section
        aria-labelledby="parcel-form-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="parcel-form-title">{title}</h2>
            <p>Unesi naziv i koordinate parcele.</p>
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
              placeholder="Bagremova parcela"
              type="text"
              value={name}
            />
          </label>

          <label>
            Latitude
            <input
              max="90"
              min="-90"
              onChange={(event) => setLatitude(event.target.value)}
              placeholder="44.5"
              step="any"
              type="number"
              value={latitude}
            />
          </label>

          <label>
            Longitude
            <input
              max="180"
              min="-180"
              onChange={(event) => setLongitude(event.target.value)}
              placeholder="19.2"
              step="any"
              type="number"
              value={longitude}
            />
          </label>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button orange-button" disabled={loading} type="submit">
            {loading ? 'Čuvanje...' : title}
          </button>
        </form>
      </section>
    </div>
  );
}
