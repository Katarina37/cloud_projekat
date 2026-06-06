import type { ResultResponse } from './apiResult';
import apiClient from './httpClient';

export type CropDto = {
  id: string;
  parcelId: string;
  name: string;
  expectedBloomingStart: string;
  expectedBloomingEnd: string;
  area?: number | null;
  notes?: string | null;
};

export type CreateCropRequest = {
  parcelId: string;
  name: string;
  expectedBloomingStart: string;
  expectedBloomingEnd: string;
  area?: number | null;
  notes?: string | null;
};

export type UpdateCropRequest = {
  name: string;
  expectedBloomingStart: string;
  expectedBloomingEnd: string;
  area?: number | null;
  notes?: string | null;
};

export type MapParcelDto = {
  parcelId: string;
  parcelName: string;
  latitude: number;
  longitude: number;
  farmerName?: string | null;
  farmerPhone?: string | null;
  crops?: CropDto[];
};

export async function getCropsByParcel(parcelId: string): Promise<CropDto[]> {
  const response = await apiClient.get<ResultResponse<CropDto[]>>(`/crops/by-parcel/${parcelId}`);
  return response.data.value;
}

export async function getNearbyParcels(apiaryId: string): Promise<MapParcelDto[]> {
  const response = await apiClient.get<ResultResponse<MapParcelDto[]>>(
    `/map/apiaries/${apiaryId}/nearby-parcels`,
  );

  return response.data.value;
}

export async function createCrop(payload: CreateCropRequest): Promise<string | undefined> {
  const response = await apiClient.post<ResultResponse<string>>('/crops', payload);
  return response.data.value;
}

export async function updateCrop(cropId: string, payload: UpdateCropRequest): Promise<void> {
  await apiClient.put(`/crops/${cropId}`, payload);
}

export async function deleteCrop(cropId: string): Promise<void> {
  await apiClient.delete(`/crops/${cropId}`);
}
