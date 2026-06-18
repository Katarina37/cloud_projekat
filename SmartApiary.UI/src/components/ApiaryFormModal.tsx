// Modal za unos i izmenu podataka (ApiaryFormModal).

import { type FormEvent, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import {
  createApiary,
  getApiErrorMessage,
  updateApiary,
  type ApiaryDto,
  type UpdateApiaryRequest,
} from '../api/apiClient';

const maxImageSizeBytes = 5 * 1024 * 1024;
const supportedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

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
      setError('Naziv ne sme biti prazan.');
      return null;
    }

    if (latitude.trim() === '' || !Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90) {
      setError('Geografska sirina mora biti izmedju -90 i 90.');
      return null;
    }

    if (longitude.trim() === '' || !Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
      setError('Geografska duzina mora biti izmedju -180 i 180.');
      return null;
    }

    if (image && image.size > maxImageSizeBytes) {
      setError('Slika ne sme biti veca od 5 MB.');
      return null;
    }

    if (image && !supportedImageTypes.has(image.type)) {
      setError('Podrzani formati slike su JPG, PNG i WEBP.');
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
      if (apiary) {
        await updateApiary(apiary.id, { ...payload, image });
      } else {
        await createApiary({ ...payload, image });
      }

      await onSaved();
      onClose();
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          isEditMode ? 'Greska pri izmeni pcelinjaka.' : 'Greska pri dodavanju pcelinjaka.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const title = isEditMode ? 'Izmeni pcelinjak' : 'Dodaj pcelinjak';

  return (
    <div className="modal-overlay" onClick={handleClose} role="presentation">
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
            Naziv
            <input
              autoFocus
              onChange={(event) => setName(event.target.value)}
              placeholder="Bagremova dolina"
              type="text"
              value={name}
            />
          </label>

          <label>
            Geografska sirina
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
            Geografska duzina
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
            Opis terena
            <textarea
              onChange={(event) => setTerrainDescription(event.target.value)}
              placeholder="Opis terena"
              rows={4}
              value={terrainDescription}
            />
          </label>

          <div className="modal-form-field">
            <span className="modal-form-label">
              {isEditMode ? 'Nova slika (opciono)' : 'Slika (opciono)'}
            </span>
            <input
              accept=".jpg,.jpeg,.png,.webp"
              className="visually-hidden"
              id="apiary-image"
              onChange={(event) => {
                const selectedFile = event.target.files && event.target.files.length > 0
                  ? event.target.files[0]
                  : null;
                setImage(selectedFile);
              }}
              type="file"
            />
            <label className="file-upload-control" htmlFor="apiary-image">
              <span className="file-upload-button">
                <ImagePlus aria-hidden="true" size={18} />
                Odaberi sliku
              </span>
              <span className="file-upload-name">
                {image ? image.name : 'JPG, PNG ili WEBP do 5 MB'}
              </span>
            </label>
          </div>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button apiary-submit-button" disabled={loading} type="submit">
            {loading ? 'Cuvanje...' : title}
          </button>
        </form>
      </section>
    </div>
  );
}
