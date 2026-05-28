import { useCallback, useEffect, useState } from 'react';
import { Leaf, Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteParcel, getApiErrorMessage, getParcels, getCropsByParcel, type ParcelDto, type CropDto } from '../api/apiClient';
import PageHeader from '../components/PageHeader';
import ParcelFormModal from '../components/ParcelFormModal';
import MapView from '../components/MapView';

export default function ParcelsPage() {
  const [parcels, setParcels] = useState<ParcelDto[]>([]);
  const [parcelsWithCrops, setParcelsWithCrops] = useState<{ parcel: ParcelDto; crops: CropDto[] }[]>([]);
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

      // load crops per parcel for map icons
      const cropsByParcel = await Promise.all(parcels.map((p) => getCropsByParcel(p.id)));
      setParcelsWithCrops(parcels.map((p, i) => ({ parcel: p, crops: cropsByParcel[i] })));
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
          <>
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
            <button
              className="secondary-action-button"
              onClick={async () => {
                setError(null);
                try {
                  // export map to PDF
                  const { default: html2canvas } = await import('html2canvas');
                  const { jsPDF } = await import('jspdf');

                  const el = document.querySelector('.section-card .leaflet-container') as HTMLElement | null;
                  if (!el) {
                    window.alert('Mapa nije pronađena za export.');
                    return;
                  }

                  const canvas = await html2canvas(el, { useCORS: true, logging: false });
                  const imgData = canvas.toDataURL('image/png');
                  const pdf = new jsPDF({ orientation: 'landscape' });
                  const imgProps = pdf.getImageProperties(imgData);
                  const pdfWidth = pdf.internal.pageSize.getWidth();
                  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                  pdf.save('parcels-map.pdf');
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.error(err);
                  window.alert('Greška pri generisanju PDF-a.');
                }
              }}
              type="button"
            >
              Export map to PDF
            </button>
          </>
        }
      />

      <section className="section-card">
        <MapView
          items={
            parcelsWithCrops.length > 0
              ? parcelsWithCrops.map(({ parcel, crops }) => ({ id: parcel.id, name: parcel.name, latitude: parcel.latitude, longitude: parcel.longitude, type: 'parcel' as const, crops: crops.map((c) => c.name) }))
              : parcels.map((parcel) => ({ id: parcel.id, name: parcel.name, latitude: parcel.latitude, longitude: parcel.longitude, type: 'parcel' as const }))
          }
          height={360}
          zoom={11}
          onSelect={(it) => {
            const found = parcels.find((p) => p.id === it.id) || null;
            if (found) {
              setSelectedParcel(found);
              setEditModalOpen(true);
            }
          }}
        />
      </section>

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
        <ParcelFormModal
          parcel={selectedParcel}
          onClose={handleEditModalClose}
          onSaved={handleParcelUpdated}
          crops={parcelsWithCrops.find((p) => p.parcel.id === selectedParcel.id)?.crops ?? []}
        />
      ) : null}
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
