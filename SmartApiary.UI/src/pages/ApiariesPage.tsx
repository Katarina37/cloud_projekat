import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  MapPinned,
  Mountain,
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
    if (refreshed) setSuccessMessage("Pčelinjak je uspešno dodat.");
  };

  const handleApiaryUpdated = async () => {
    const refreshed = await fetchApiaries();
    if (refreshed) setSuccessMessage("Pčelinjak je uspešno izmenjen.");
  };

  const handleDeleteApiary = async (apiary: ApiaryDto) => {
    const confirmed = window.confirm(
      `Da li želite da obrišete pčelinjak "${apiary.name}"?`,
    );
    if (!confirmed) return;

    setDeletingApiaryId(apiary.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await deleteApiary(apiary.id);
      const refreshed = await fetchApiaries();
      if (refreshed) setSuccessMessage("Pčelinjak je uspešno obrisan.");
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
    <div className="page-stack apiaries-page">
      <h1 className="visually-hidden">Pčelinjaci</h1>

      <section className="apiary-map-panel" aria-label="Mapa pčelinjaka">
        <MapView
          className="apiary-map-canvas"
          items={displayedMapItems}
          height="100%"
          zoom={10}
          onSelect={(it) =>
            alert(`${it.name} — ${it.latitude}, ${it.longitude}`)
          }
        />

        <button
          aria-label="Dodaj pčelinjak"
          className="apiary-map-add-button"
          type="button"
          onClick={() => {
            setSuccessMessage(null);
            setIsCreateModalOpen(true);
          }}
        >
          <Plus aria-hidden="true" size={20} />
          <span>Dodaj pčelinjak</span>
        </button>

        <div className="apiary-map-count" aria-live="polite">
          <MapPinned aria-hidden="true" size={15} />
          <span>
            {apiaries.length}{" "}
            {apiaries.length === 1 ? "pčelinjak" : "pčelinjaka"}
          </span>
        </div>
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
              {/* ── Hero zona (slika ili placeholder) ── */}
              <div className="apiary-hero">
                {apiary.imageUrl ? (
                  <a
                    href={apiary.imageUrl}
                    rel="noreferrer"
                    target="_blank"
                    title="Otvori originalnu sliku"
                    style={{ position: "absolute", inset: 0, display: "block" }}
                  >
                    <img
                      alt={`Pčelinjak ${apiary.name}`}
                      className="apiary-hero-image"
                      loading="lazy"
                      src={apiary.imageUrl}
                    />
                  </a>
                ) : (
                  <>
                    <MapPin
                      aria-hidden="true"
                      className="apiary-hero-placeholder-icon"
                      size={30}
                    />
                    <span className="apiary-hero-placeholder-label">
                      Fotografija nije dodata
                    </span>
                  </>
                )}

                {/* Datum badge — gore levo */}
                <time
                  className="apiary-date-badge"
                  dateTime={apiary.createdAt}
                  title={`Kreirano ${formatDate(apiary.createdAt)}`}
                >
                  <CalendarDays aria-hidden="true" size={11} />
                  {formatCompactDate(apiary.createdAt)}
                </time>

                {/* Akcije — gore desno, slide-down + fade-in */}
                <div className="apiary-card-actions">
                  <button
                    aria-label="Prikaži okolne parcele"
                    className="apiary-overlay-action"
                    disabled={
                      nearbyLoadingId === apiary.id ||
                      isApiaryOwnedByAnotherUser(apiary, currentUserId)
                    }
                    onClick={() => handleShowNearbyParcels(apiary)}
                    title={
                      isApiaryOwnedByAnotherUser(apiary, currentUserId)
                        ? "Nemate pravo da vidite okolne parcele za ovaj pčelinjak"
                        : "Prikaži okolne parcele"
                    }
                    type="button"
                  >
                    <MapPinned size={16} />
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
                    <Pencil size={15} />
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
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* ── Body zona ── */}
              <div className="apiary-body apiary-info-panel">
                <div className="apiary-title-row">
                  <h2>{apiary.name}</h2>
                </div>

                <p
                  className="apiary-terrain"
                  title={apiary.terrainDescription || "Teren nije opisan"}
                >
                  <Mountain
                    aria-hidden="true"
                    className="apiary-terrain-icon"
                    size={13}
                  />
                  {apiary.terrainDescription || "Teren nije opisan"}
                </p>

                <div className="apiary-divider" />

                <div className="apiary-coordinate-grid">
                  <div className="apiary-coord-cell">
                    <span className="apiary-coord-label">Latitude</span>
                    <strong className="apiary-coord-value">
                      {apiary.latitude}
                    </strong>
                  </div>
                  <div className="apiary-coord-cell">
                    <span className="apiary-coord-label">Longitude</span>
                    <strong className="apiary-coord-value">
                      {apiary.longitude}
                    </strong>
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
  if (!apiary.beekeeperId) return false;
  return apiary.beekeeperId !== currentUserId;
}
