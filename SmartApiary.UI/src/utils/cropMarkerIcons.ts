// Pomocna UI funkcija: cropMarkerIcons.

import L from 'leaflet';
import defaultCropIconUrl from '../assets/crops/default.svg';
import lavenderIconUrl from '../assets/crops/lavender.svg';
import rapeseedIconUrl from '../assets/crops/rapeseed.svg';
import sunflowerIconUrl from '../assets/crops/sunflower.svg';

function makeCropMarkerIcon(iconUrl: string) {
  return L.icon({
    iconUrl,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -38],
    className: 'crop-marker-icon',
  });
}

const sunflowerIcon = makeCropMarkerIcon(sunflowerIconUrl);
const rapeseedIcon = makeCropMarkerIcon(rapeseedIconUrl);
const lavenderIcon = makeCropMarkerIcon(lavenderIconUrl);
const defaultCropIcon = makeCropMarkerIcon(defaultCropIconUrl);

export function getCropMarkerIcon(cropName?: string) {
  switch (cropName?.trim().toLowerCase()) {
    case 'suncokret':
    case 'sunflower':
      return sunflowerIcon;
    case 'uljana repica':
    case 'rapeseed':
      return rapeseedIcon;
    case 'lavanda':
    case 'lavender':
      return lavenderIcon;
    default:
      return defaultCropIcon;
  }
}
