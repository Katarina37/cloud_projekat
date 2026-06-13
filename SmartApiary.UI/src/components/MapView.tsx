import { Fragment, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { getCropMarkerIcon } from '../utils/cropMarkerIcons';

export type MapCropItem = {
  name: string;
  expectedBloomingStart: string;
  expectedBloomingEnd: string;
  area?: number | null;
  notes?: string | null;
};

export type MapItem = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  subtitle?: string;
  type?: 'apiary' | 'parcel';
  farmerName?: string | null;
  farmerPhone?: string | null;
  crops?: MapCropItem[];
  radiusMeters?: number;
  thumbnailUrl?: string | null;
};

type Props = {
  items: MapItem[];
  height?: number;
  zoom?: number;
  onSelect?: (item: MapItem) => void;
};

function makeIcon(html: string) {
  return L.divIcon({
    className: 'custom-div-icon',
    html,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });
}

function FitBoundsToItems({ items }: { items: MapItem[] }) {
  const map = useMap();

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const points: [number, number][] = [];

    for (const item of items) {
      points.push([item.latitude, item.longitude]);
    }

    // Mapa se prilagodjava tako da svi markeri budu vidljivi.
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, items]);

  return null;
}

export default function MapView({ items, height = 380, zoom = 10, onSelect }: Props) {
  const center: [number, number] = items.length > 0 ? [items[0].latitude, items[0].longitude] : [45.2671, 19.8335];
  // Promena kljuca ponovo iscrta mapu kada se promene markeri.
  const mapKey = items
    .map((item) => `${item.type || 'item'}:${item.id}:${item.latitude}:${item.longitude}:${item.crops?.[0]?.name || ''}:${item.thumbnailUrl || ''}`)
    .join('|');

  return (
    <div style={{ height }}>
      <MapContainer key={mapKey} center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBoundsToItems items={items} />
        <MarkerClusterGroup>
          {items.map((it) => {
            let icon;

            if (it.type === 'apiary') {
              icon = makeIcon(`<div style="font-size:20px">🐝</div>`);
            } else {
              icon = getCropMarkerIcon(it.crops?.[0]?.name);
            }

            return (
              <Fragment key={`${it.type || 'item'}-${it.id}`}>
                <Marker
                  position={[it.latitude, it.longitude]}
                  icon={icon}
                  eventHandlers={{
                    click: () => {
                      if (onSelect) {
                        onSelect(it);
                      }
                    },
                  }}
                >
                  <Popup>
                    {it.type === 'parcel' ? (
                      <ParcelPopup item={it} />
                    ) : (
                      <ApiaryPopup item={it} />
                    )}
                  </Popup>
                </Marker>
                {it.radiusMeters ? <Circle center={[it.latitude, it.longitude]} radius={it.radiusMeters} pathOptions={{ color: '#3388ff', fillOpacity: 0.1 }} /> : null}
              </Fragment>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

function ApiaryPopup({ item }: { item: MapItem }) {
  return (
    <div className="map-popup">
      {item.thumbnailUrl ? (
        <img
          alt={`Pčelinjak ${item.name}`}
          className="map-popup-thumbnail"
          loading="lazy"
          src={item.thumbnailUrl}
        />
      ) : null}
      <h3>{item.name}</h3>
      {item.subtitle ? <div>{item.subtitle}</div> : null}
    </div>
  );
}

function ParcelPopup({ item }: { item: MapItem }) {
  const crops = item.crops || [];

  return (
    <div className="map-popup">
      <h3>{item.name}</h3>

      {item.farmerName || item.farmerPhone ? (
        <div className="map-popup-contact">
          {item.farmerName ? (
            <div>
              <span>Farmer:</span> {item.farmerName}
            </div>
          ) : null}
          {item.farmerPhone ? (
            <div>
              <span>Telefon:</span> {item.farmerPhone}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="map-popup-section">
        <strong>Kulture</strong>
        {crops.length > 0 ? (
          <ul className="map-popup-crops">
            {crops.map((crop, index) => (
              <li key={`${crop.name}-${index}`}>
                <strong>{crop.name}</strong>
                <span>Cvetanje: {formatBloomingPeriod(crop)}</span>
                {crop.area !== null && crop.area !== undefined ? (
                  <span>Površina: {crop.area}</span>
                ) : null}
                {crop.notes ? <span>Beleška: {crop.notes}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <span className="map-popup-empty">Nema unetih kultura.</span>
        )}
      </div>
    </div>
  );
}

function formatBloomingPeriod(crop: MapCropItem) {
  return `${formatDate(crop.expectedBloomingStart)} - ${formatDate(crop.expectedBloomingEnd)}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || '-';
  }

  return date.toLocaleDateString('sr-Latn-RS');
}
