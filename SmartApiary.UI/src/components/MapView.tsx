import { Fragment, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

export type MapItem = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  subtitle?: string;
  type?: 'apiary' | 'parcel';
  crops?: string[];
  radiusMeters?: number;
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

function makeParcelIcon() {
  return makeIcon(`
    <div style="
      width: 30px;
      height: 30px;
      border-radius: 999px;
      background: linear-gradient(180deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #b45309;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(180, 83, 9, 0.28);
      font-size: 16px;
      line-height: 1;
    ">🌾</div>
  `);
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
  const mapKey = items.map((item) => `${item.type || 'item'}:${item.id}:${item.latitude}:${item.longitude}`).join('|');

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
              icon = makeParcelIcon();
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
                    <div>
                      <strong>{it.name}</strong>
                      {it.subtitle ? <div>{it.subtitle}</div> : null}
                    </div>
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
