import { useCallback, useEffect, useState } from 'react';
import { Leaf, Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteParcel, getApiErrorMessage, getParcels, type ParcelDto } from '../api/apiClient';
import PageHeader from '../components/PageHeader';
import ParcelFormModal from '../components/ParcelFormModal';

export default function ParcelsPage() {
  const [parcels, setParcels] = useState<ParcelDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<ParcelDto | null>(null);
  const [deletingParcelId, setDeletingParcelId] = useState<string | null>(null);

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const parcels = await getParcels();
      setParcels(parcels);
      return true;
    } catch {
      setParcels([]);
      setError('Greška pri učitavanju parcela.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchParcels();
  }, [fetchParcels]);

  const handleParcelCreated = async () => {
    const refreshed = await fetchParcels();

    if (refreshed) {
      setSuccessMessage('Parcela je uspešno dodata.');
    }
  };

  const handleParcelUpdated = async () => {
    const refreshed = await fetchParcels();

    if (refreshed) {
      setSuccessMessage('Parcela je uspešno izmenjena.');
    }
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedParcel(null);
  };

  const handleDeleteParcel = async (parcel: ParcelDto) => {
    const confirmed = window.confirm(`Da li želite da obrišete parcelu "${parcel.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingParcelId(parcel.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteParcel(parcel.id);
      const refreshed = await fetchParcels();

      if (refreshed) {
        setSuccessMessage('Parcela je uspešno obrisana.');
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Greška pri brisanju parcele.'));
    } finally {
      setDeletingParcelId(null);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Parcele"
        subtitle="Naziv, koordinate i kultura povezani sa okruženjem pčelinjaka"
        action={
          <button
            className="primary-button orange-button"
            onClick={() => {
              setError(null);
              setSuccessMessage(null);
              setCreateModalOpen(true);
            }}
            type="button"
          >
            <Plus size={18} />
            Dodaj parcelu
          </button>
        }
      />

      {loading ? <section className="section-card">Učitavanje parcela...</section> : null}

      {successMessage ? <section className="section-card message-card success">{successMessage}</section> : null}

      {error ? (
        <section className="section-card message-card error" role="alert">
          {error}
        </section>
      ) : null}

      {!loading && !error && parcels.length === 0 ? (
        <section className="section-card">Nema unetih parcela.</section>
      ) : null}

      {!loading && !error && parcels.length > 0 ? (
        <section className="card-grid three">
          {parcels.map((parcel) => (
            <article className="section-card parcel-card" key={parcel.id}>
              <div className="card-topline">
                <div className="section-icon">
                  <Leaf size={18} />
                </div>
              </div>
              <h2>{parcel.name}</h2>
              <div className="detail-grid">
                <div>
                  <span>Latitude</span>
                  <strong>{parcel.latitude}</strong>
                </div>
                <div>
                  <span>Longitude</span>
                  <strong>{parcel.longitude}</strong>
                </div>
                <div>
                  <span>CreatedAt</span>
                  <strong>{formatDate(parcel.createdAt)}</strong>
                </div>
              </div>

              <div className="card-action-row">
                <button
                  className="secondary-action-button orange-action-button"
                  disabled={deletingParcelId === parcel.id}
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setSelectedParcel(parcel);
                    setEditModalOpen(true);
                  }}
                  type="button"
                >
                  <Pencil size={16} />
                  Izmeni
                </button>
                <button
                  className="danger-action-button"
                  disabled={deletingParcelId === parcel.id}
                  onClick={() => void handleDeleteParcel(parcel)}
                  type="button"
                >
                  <Trash2 size={16} />
                  {deletingParcelId === parcel.id ? 'Brisanje...' : 'Obriši'}
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {createModalOpen ? (
        <ParcelFormModal onClose={() => setCreateModalOpen(false)} onSaved={handleParcelCreated} />
      ) : null}

      {editModalOpen && selectedParcel ? (
        <ParcelFormModal parcel={selectedParcel} onClose={handleEditModalClose} onSaved={handleParcelUpdated} />
      ) : null}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
