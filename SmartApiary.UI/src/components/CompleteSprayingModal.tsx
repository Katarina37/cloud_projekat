// Modal za unos stvarnih podataka o zavrsenom tretiranju.

import { type FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  completeSpraying,
  getApiErrorMessage,
  getCropsByParcel,
  type CompleteSprayingRequest,
  type CropDto,
  type SprayingAnnouncementDto,
} from '../api/apiClient';

type CompleteSprayingModalProps = {
  spraying: SprayingAnnouncementDto;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

export default function CompleteSprayingModal({
  spraying,
  onClose,
  onSaved,
}: CompleteSprayingModalProps) {
  const [actualStartTime, setActualStartTime] = useState('');
  const [actualEndTime, setActualEndTime] = useState('');
  const [cropId, setCropId] = useState('');
  const [note, setNote] = useState('');
  const [crops, setCrops] = useState<CropDto[]>([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getCropsByParcel(spraying.parcelId)
      .then((loadedCrops) => {
        if (active) {
          setCrops(loadedCrops);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(getApiErrorMessage(requestError, 'Greska pri ucitavanju kultura sa parcele.'));
        }
      })
      .finally(() => {
        if (active) {
          setLoadingCrops(false);
        }
      });

    return () => {
      active = false;
    };
  }, [spraying.parcelId]);

  const validateForm = (): CompleteSprayingRequest | null => {
    if (!actualStartTime) {
      setError('Stvarni pocetak je obavezan.');
      return null;
    }

    if (!actualEndTime) {
      setError('Stvarni kraj je obavezan.');
      return null;
    }

    const start = new Date(actualStartTime);
    const end = new Date(actualEndTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setError('Stvarni kraj mora biti posle stvarnog pocetka.');
      return null;
    }

    if (!cropId) {
      setError('Izaberite kulturu koja je tretirana.');
      return null;
    }

    const trimmedNote = note.trim();

    if (trimmedNote.length > 1000) {
      setError('Napomena moze imati najvise 1000 karaktera.');
      return null;
    }

    setError(null);

    return {
      actualStartTime: start.toISOString(),
      actualEndTime: end.toISOString(),
      cropId,
      note: trimmedNote || null,
    };
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = validateForm();

    if (!payload) {
      return;
    }

    setSaving(true);

    try {
      await completeSpraying(spraying.id, payload);
      await onSaved();
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Greska pri zavrsavanju tretiranja.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose} role="presentation">
      <section
        aria-labelledby="complete-spraying-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="complete-spraying-title">Zavrsi tretiranje</h2>
            <p>Unesite stvarne podatke koji ulaze u digitalni karton prskanja.</p>
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
            Stvarni pocetak
            <input
              autoFocus
              disabled={saving}
              onChange={(event) => setActualStartTime(event.target.value)}
              type="datetime-local"
              value={actualStartTime}
            />
          </label>

          <label>
            Stvarni kraj
            <input
              disabled={saving}
              onChange={(event) => setActualEndTime(event.target.value)}
              type="datetime-local"
              value={actualEndTime}
            />
          </label>

          <label>
            Tretirana kultura
            <select
              disabled={loadingCrops || saving}
              onChange={(event) => setCropId(event.target.value)}
              value={cropId}
            >
              <option value="">
                {loadingCrops ? 'Ucitavanje kultura...' : 'Izaberite kulturu'}
              </option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </label>

          {!loadingCrops && crops.length === 0 ? (
            <p className="form-error" role="alert">
              Parcela nema evidentiranu kulturu. Prvo dodajte kulturu na parcelu.
            </p>
          ) : null}

          <label>
            Napomena
            <textarea
              disabled={saving}
              maxLength={1000}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Opcionalna napomena o tretmanu"
              rows={3}
              value={note}
            />
          </label>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            className="primary-button orange-button"
            disabled={saving || loadingCrops || crops.length === 0}
            type="submit"
          >
            {saving ? 'Cuvanje...' : 'Sacuvaj digitalni karton'}
          </button>
        </form>
      </section>
    </div>
  );
}
