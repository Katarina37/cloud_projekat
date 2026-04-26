import { useCallback, useEffect, useState } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteApiary, getApiaries, getApiErrorMessage, type ApiaryDto } from '../api/apiClient';
import ApiaryFormModal from '../components/ApiaryFormModal';
import PageHeader from '../components/PageHeader';

export default function ApiariesPage() {
  const [apiaries, setApiaries] = useState<ApiaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingApiary, setEditingApiary] = useState<ApiaryDto | null>(null);
  const [deletingApiaryId, setDeletingApiaryId] = useState<string | null>(null);

  const fetchApiaries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiaries = await getApiaries();
      setApiaries(apiaries);
      return true;
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greška pri učitavanju pčelinjaka.'));
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchApiaries();
  }, [fetchApiaries]);

  const handleApiaryCreated = async () => {
    const refreshed = await fetchApiaries();

    if (refreshed) {
      setSuccessMessage('Pčelinjak je uspešno dodat.');
    }
  };

  const handleApiaryUpdated = async () => {
    const refreshed = await fetchApiaries();

    if (refreshed) {
      setSuccessMessage('Pčelinjak je uspešno izmenjen.');
    }
  };

  const handleDeleteApiary = async (apiary: ApiaryDto) => {
    const confirmed = window.confirm(`Da li želite da obrišete pčelinjak "${apiary.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingApiaryId(apiary.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteApiary(apiary.id);
      const refreshed = await fetchApiaries();

      if (refreshed) {
        setSuccessMessage('Pčelinjak je uspešno obrisan.');
      }
    } catch (error) {
      setError(getApiErrorMessage(error, 'Greška pri brisanju pčelinjaka.'));
    } finally {
      setDeletingApiaryId(null);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Pčelinjaci"
        subtitle="Lokacije i osnovni podaci pčelinjaka"
        action={
          <button
            className="primary-button apiary-add-button"
            type="button"
            onClick={() => {
              setSuccessMessage(null);
              setIsCreateModalOpen(true);
            }}
          >
            <Plus size={18} />
            Dodaj pčelinjak
          </button>
        }
      />

      {loading ? <section className="section-card">Učitavanje...</section> : null}

      {successMessage ? <section className="section-card message-card success">{successMessage}</section> : null}

      {error ? (
        <section className="section-card message-card error" role="alert">
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
                {apiary.terrainDescription ? <p>{apiary.terrainDescription}</p> : null}
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
                  <strong>{formatDate(apiary.createdAt)}</strong>
                </div>
              </div>

              <div className="card-action-row">
                <button
                  className="secondary-action-button"
                  disabled={deletingApiaryId === apiary.id}
                  onClick={() => {
                    setSuccessMessage(null);
                    setEditingApiary(apiary);
                  }}
                  type="button"
                >
                  <Pencil size={16} />
                  Izmeni
                </button>
                <button
                  className="danger-action-button"
                  disabled={deletingApiaryId === apiary.id}
                  onClick={() => void handleDeleteApiary(apiary)}
                  type="button"
                >
                  <Trash2 size={16} />
                  {deletingApiaryId === apiary.id ? 'Brisanje...' : 'Obriši'}
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {isCreateModalOpen ? (
        <ApiaryFormModal onClose={() => setIsCreateModalOpen(false)} onSaved={handleApiaryCreated} />
      ) : null}

      {editingApiary ? (
        <ApiaryFormModal
          apiary={editingApiary}
          onClose={() => setEditingApiary(null)}
          onSaved={handleApiaryUpdated}
        />
      ) : null}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
