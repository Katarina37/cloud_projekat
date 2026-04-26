import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import { createApiary, getApiaries, type ApiaryDto, type CreateApiaryRequest } from '../api/apiClient';
import PageHeader from '../components/PageHeader';

type CreateApiaryModalProps = {
  onClose: () => void;
  onApiaryCreated: () => Promise<void>;
};

export default function ApiariesPage() {
  const [apiaries, setApiaries] = useState<ApiaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchApiaries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiaries = await getApiaries();
      setApiaries(apiaries);
    } catch {
      setError('Greška pri učitavanju pčelinjaka.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchApiaries();
  }, [fetchApiaries]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Pčelinjaci"
        subtitle="Lokacije i osnovni podaci pčelinjaka"
        action={
          <button className="primary-button apiary-add-button" type="button" onClick={() => setIsOpen(true)}>
            <Plus size={18} />
            Dodaj pčelinjak
          </button>
        }
      />

      {loading ? <section className="section-card">Učitavanje...</section> : null}

      {error ? (
        <section className="section-card" style={{ color: 'var(--danger)' }}>
          {error}
        </section>
      ) : null}

      {!loading && !error && apiaries.length === 0 ? (
        <section className="section-card">Nema pčelinjaka</section>
      ) : null}

      {!loading && !error && apiaries.length > 0 ? (
        <section className="card-grid three">
          {apiaries.map((apiary) => (
            <article className="section-card apiary-card" key={apiary.id}>
              <div className="card-topline">
                <div className="section-icon">
                  <MapPin size={18} />
                </div>
              </div>
              <div>
                <h2>{apiary.name}</h2>
              </div>
              <div className="detail-grid">
                <div>
                  <span>Latitude</span>
                  <strong>{apiary.latitude}</strong>
                </div>
                <div>
                  <span>Longitude</span>
                  <strong>{apiary.longitude}</strong>
                </div>
                <div>
                  <span>CreatedAt</span>
                  <strong>{new Date(apiary.createdAt).toLocaleString()}</strong>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {isOpen ? <CreateApiaryModal onClose={() => setIsOpen(false)} onApiaryCreated={fetchApiaries} /> : null}
    </div>
  );
}

function CreateApiaryModal({ onClose, onApiaryCreated }: CreateApiaryModalProps) {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setLatitude('');
    setLongitude('');
    setError(null);
  };

  const validateForm = (): CreateApiaryRequest | null => {
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

    if (longitude.trim() === '' || !Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = validateForm();

    if (!payload) {
      return;
    }

    setLoading(true);

    try {
      await createApiary(payload);
      await onApiaryCreated();
      resetForm();
      setLoading(false);
      onClose();
    } catch {
      setError('Greška pri dodavanju pčelinjaka.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <section
        aria-labelledby="create-apiary-title"
        aria-modal="true"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2 id="create-apiary-title">Dodaj pčelinjak</h2>
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

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button apiary-submit-button" disabled={loading} type="submit">
            {loading ? 'Dodavanje...' : 'Dodaj pčelinjak'}
          </button>
        </form>
      </section>
    </div>
  );
}
