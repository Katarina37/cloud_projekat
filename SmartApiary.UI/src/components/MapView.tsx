import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import sunflowerIcon from '../assets/crops/sunflower.svg';
import rapeseedIcon from '../assets/crops/rapeseed.svg';
import lavenderIcon from '../assets/crops/lavender.svg';
import defaultCropIcon from '../assets/crops/default.svg';

type MapItem = {
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

function makeImageIcon(url: string) {
  return L.icon({
    iconUrl: url,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function FitBoundsToItems({ items }: { items: MapItem[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || items.length === 0) return;

    const bounds = L.latLngBounds(items.map((i) => [i.latitude, i.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, items]);

  return null;
}

export default function MapView({ items, height = 380, zoom = 10, onSelect }: Props) {
  const center: [number, number] = items.length > 0 ? [items[0].latitude, items[0].longitude] : [45.2671, 19.8335];
  const mapKey = items.map((item) => `${item.type ?? 'item'}:${item.id}:${item.latitude}:${item.longitude}`).join('|');

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
              <React.Fragment key={`${it.type ?? 'item'}-${it.id}`}>
                <Marker
                  position={[it.latitude, it.longitude]}
                  icon={icon}
                  eventHandlers={{
                    click: () => onSelect?.(it),
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
              </React.Fragment>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}

function cropEmoji(name?: string) {
  if (!name) return '🌾';
  const n = name.toLowerCase();

  if (n.includes('sun') || n.includes('suncokret') || n.includes('sunflower')) return '🌻';
  if (n.includes('rap') || n.includes('repica') || n.includes('rapeseed')) return '🌼';
  if (n.includes('lav') || n.includes('lavanda') || n.includes('lavender')) return '🌸';
  if (n.includes('wheat') || n.includes('pšen') || n.includes('psen')) return '🌾';

  return '🌱';
}
