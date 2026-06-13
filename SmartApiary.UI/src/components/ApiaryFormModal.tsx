import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import {
  createApiary,
  getApiErrorMessage,
  updateApiary,
  type ApiaryDto,
  type UpdateApiaryRequest,
} from '../api/apiClient';

type ApiaryFormModalProps = {
  apiary?: ApiaryDto;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

export default function ApiaryFormModal({ apiary, onClose, onSaved }: ApiaryFormModalProps) {
  const isEditMode = apiary !== undefined;
  const [name, setName] = useState(apiary ? apiary.name : '');
  const [latitude, setLatitude] = useState(apiary ? String(apiary.latitude) : '');
  const [longitude, setLongitude] = useState(apiary ? String(apiary.longitude) : '');
  const [terrainDescription, setTerrainDescription] = useState(
    apiary && apiary.terrainDescription ? apiary.terrainDescription : '',
  );
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): UpdateApiaryRequest | null => {
    const trimmedName = name.trim();
    const trimmedTerrainDescription = terrainDescription.trim();
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

    if (longitude.trim() === '' || !Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
      setError('Longitude mora biti između -180 i 180.');
      return null;
    }

    setError(null);
    return {
      name: trimmedName,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      terrainDescription: trimmedTerrainDescription.length > 0 ? trimmedTerrainDescription : null,
    };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = validateForm();

    if (!payload) {
      return;
    }

    setLoading(true);

    try {
      if (apiary) {
        await updateApiary(apiary.id, payload);
      } else {
        await createApiary({ ...payload, image });
      }

      await onSaved();
      onClose();
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          isEditMode ? 'Greška pri izmeni pčelinjaka.' : 'Greška pri dodavanju pčelinjaka.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const title = isEditMode ? 'Izmeni pčelinjak' : 'Dodaj pčelinjak';

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <section
        aria-labelledby="apiary-form-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="apiary-form-title">{title}</h2>
            <p>Unesi osnovne podatke o lokaciji.</p>
          </div>
          <button aria-label="Zatvori modal" className="modal-close-button" type="button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              autoFocus
              onChange={(event) => setName(event.target.value)}
              placeholder="Bagremova dolina"
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

          <label>
            TerrainDescription
            <textarea
              onChange={(event) => setTerrainDescription(event.target.value)}
              placeholder="Opis terena"
              rows={4}
              value={terrainDescription}
            />
          </label>

          {!isEditMode ? (
            <label>
              Slika
              <input
                accept="image/*"
                onChange={(event) => {
                  const selectedFile = event.target.files && event.target.files.length > 0
                    ? event.target.files[0]
                    : null;
                  setImage(selectedFile);
                }}
                type="file"
              />
            </label>
          ) : null}

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
