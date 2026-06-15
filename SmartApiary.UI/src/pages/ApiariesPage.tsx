// Stranica za pcelinjake.

import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  MapPinned,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  deleteApiary,
  getApiaries,
  getApiErrorMessage,
  getNearbyParcels,
  type ApiaryDto,
} from "../api/apiClient";
import { getCurrentUserId } from "../auth/authStorage";
import ApiaryFormModal from "../components/ApiaryFormModal";
import MapView, { type MapItem } from "../components/MapView";
import PageHeader from "../components/PageHeader";

export default function ApiariesPage() {
  const [apiaries, setApiaries] = useState<ApiaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingApiary, setEditingApiary] = useState<ApiaryDto | null>(null);
  const [deletingApiaryId, setDeletingApiaryId] = useState<string | null>(null);
  const [mapItems, setMapItems] = useState<MapItem[]>([]);
  const [nearbyLoadingId, setNearbyLoadingId] = useState<string | null>(null);
  const currentUserId = getCurrentUserId();

  async function fetchApiaries() {
    setLoading(true);
    setError(null);

    try {
      const apiaries = await getApiaries();
      setApiaries(apiaries);
      return true;
    } catch (error) {
      setError(getApiErrorMessage(error, "Greška pri učitavanju pčelinjaka."));
      return false;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApiaries();
  }, []);

  const handleApiaryCreated = async () => {
    const refreshed = await fetchApiaries();

    if (refreshed) {
      setSuccessMessage("Pčelinjak je uspešno dodat.");
    }
  };

  const handleApiaryUpdated = async () => {
    const refreshed = await fetchApiaries();

    if (refreshed) {
      setSuccessMessage("Pčelinjak je uspešno izmenjen.");
    }
  };

  const handleDeleteApiary = async (apiary: ApiaryDto) => {
    const confirmed = window.confirm(
      `Da li želite da obrišete pčelinjak "${apiary.name}"?`,
    );

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
        setSuccessMessage("Pčelinjak je uspešno obrisan.");
      }
    } catch (error) {
      setError(getApiErrorMessage(error, "Greška pri brisanju pčelinjaka."));
    } finally {
      setDeletingApiaryId(null);
    }
  };

  const handleShowNearbyParcels = async (apiary: ApiaryDto) => {
    setNearbyLoadingId(apiary.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const nearby = await getNearbyParcels(apiary.id);

      const apiaryItem: MapItem = {
        id: apiary.id,
        name: apiary.name,
        latitude: apiary.latitude,
        longitude: apiary.longitude,
        subtitle: apiary.terrainDescription || undefined,
        type: "apiary",
        thumbnailUrl: apiary.thumbnailUrl,
      };

      const nearbyItems: MapItem[] = nearby.map((parcel) => ({
        id: parcel.parcelId,
        name: parcel.parcelName,
        latitude: parcel.latitude,
        longitude: parcel.longitude,
        type: "parcel",
        farmerName: parcel.farmerName,
        farmerPhone: parcel.farmerPhone,
        crops: (parcel.crops || []).map((crop) => ({
          name: crop.name,
          expectedBloomingStart: crop.expectedBloomingStart,
          expectedBloomingEnd: crop.expectedBloomingEnd,
          area: crop.area,
          notes: crop.notes,
        })),
      }));

      setMapItems([apiaryItem, ...nearbyItems]);
      if (nearbyItems.length === 0) {
        setSuccessMessage("Nema okolnih parcela u blizini.");
      } else {
        setSuccessMessage(`${nearbyItems.length} okolnih parcela učitano.`);
      }
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Greška pri učitavanju okolnih parcela."),
      );
    } finally {
      setNearbyLoadingId(null);
    }
  };

  let displayedMapItems = mapItems;

  if (displayedMapItems.length === 0) {
    displayedMapItems = apiaries.map((apiary) => ({
      id: apiary.id,
      name: apiary.name,
      latitude: apiary.latitude,
      longitude: apiary.longitude,
      subtitle: apiary.terrainDescription || undefined,
      type: "apiary",
      thumbnailUrl: apiary.thumbnailUrl,
    }));
  }

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

      <section className="section-card">
        <MapView
          items={displayedMapItems}
          height={360}
          zoom={10}
          onSelect={(it) =>
            alert(`${it.name} — ${it.latitude}, ${it.longitude}`)
          }
        />
      </section>

      {loading ? (
        <section className="section-card">Učitavanje...</section>
      ) : null}

      {successMessage ? (
        <section className="section-card message-card success">
          {successMessage}
        </section>
      ) : null}

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
            <article
              aria-label={`Pčelinjak ${apiary.name}`}
              className="apiary-card"
              key={apiary.id}
              tabIndex={0}
            >
              <div className="apiary-media">
                {apiary.imageUrl ? (
                  <a
                    className="apiary-image-link"
                    href={apiary.imageUrl}
                    rel="noreferrer"
                    target="_blank"
                    title="Otvori originalnu sliku"
                  >
                    <img
                      alt={`Pčelinjak ${apiary.name}`}
                      className="apiary-image"
                      loading="lazy"
                      src={apiary.imageUrl}
                    />
                  </a>
                ) : (
                  <div className="apiary-image apiary-image-placeholder">
                    <MapPin aria-hidden="true" size={30} />
                    <span>Fotografija nije dodata</span>
                  </div>
                )}

                <div aria-hidden="true" className="apiary-image-shade" />

                <div className="apiary-card-actions">
                  <button
                    aria-label="Prikaži okolne parcele"
                    className="apiary-overlay-action"
                    disabled={
                      nearbyLoadingId === apiary.id ||
                      isApiaryOwnedByAnotherUser(apiary, currentUserId)
                    }
                    onClick={() => handleShowNearbyParcels(apiary)}
                    type="button"
                    title={
                      isApiaryOwnedByAnotherUser(apiary, currentUserId)
                        ? "Nemate pravo da vidite okolne parcele za ovaj pčelinjak"
                        : "Prikaži okolne parcele"
                    }
                  >
                    <MapPinned size={18} />
                  </button>
                  <button
                    aria-label="Izmeni pčelinjak"
                    className="apiary-overlay-action"
                    disabled={deletingApiaryId === apiary.id}
                    onClick={() => {
                      setSuccessMessage(null);
                      setEditingApiary(apiary);
                    }}
                    title="Izmeni pčelinjak"
                    type="button"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    aria-label={
                      deletingApiaryId === apiary.id
                        ? "Brisanje pčelinjaka"
                        : "Obriši pčelinjak"
                    }
                    className="apiary-overlay-action apiary-overlay-action-danger"
                    disabled={deletingApiaryId === apiary.id}
                    onClick={() => handleDeleteApiary(apiary)}
                    title={
                      deletingApiaryId === apiary.id
                        ? "Brisanje pčelinjaka"
                        : "Obriši pčelinjak"
                    }
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="apiary-info-panel">
                  <div className="apiary-title-row">
                    <h2>{apiary.name}</h2>
                    <time
                      className="apiary-created-info"
                      dateTime={apiary.createdAt}
                      title={`Kreirano ${formatDate(apiary.createdAt)}`}
                    >
                      <CalendarDays aria-hidden="true" size={13} />
                      {formatCompactDate(apiary.createdAt)}
                    </time>
                  </div>

                  <p
                    className="apiary-terrain"
                    title={apiary.terrainDescription || "Teren nije opisan"}
                  >
                    {apiary.terrainDescription || "Teren nije opisan"}
                  </p>

                  <div className="apiary-coordinate-grid">
                    <div>
                      <span>Latitude</span>
                      <strong>{apiary.latitude}</strong>
                    </div>
                    <div>
                      <span>Longitude</span>
                      <strong>{apiary.longitude}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {isCreateModalOpen ? (
        <ApiaryFormModal
          onClose={() => setIsCreateModalOpen(false)}
          onSaved={handleApiaryCreated}
        />
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

function formatCompactDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("sr-Latn", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
}

function isApiaryOwnedByAnotherUser(
  apiary: ApiaryDto,
  currentUserId: string | null,
) {
  if (!apiary.beekeeperId) {
    return false;
  }

  return apiary.beekeeperId !== currentUserId;
}
