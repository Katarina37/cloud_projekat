import type { ResultResponse } from './apiResult';
import apiClient from './httpClient';

export type ParcelDto = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
};

export type CreateParcelRequest = {
  name: string;
  latitude: number;
  longitude: number;
};

export type UpdateParcelRequest = CreateParcelRequest;

export async function getParcels(): Promise<ParcelDto[]> {
  const response = await apiClient.get<ResultResponse<ParcelDto[]>>('/parcels');
  return response.data.value;
}

export async function createParcel(payload: CreateParcelRequest): Promise<string | undefined> {
  const response = await apiClient.post<ResultResponse<string>>('/parcels', payload);
  return response.data.value;
}

export async function updateParcel(parcelId: string, payload: UpdateParcelRequest): Promise<void> {
  await apiClient.put(`/parcels/${parcelId}`, payload);
}

export async function deleteParcel(parcelId: string): Promise<void> {
  await apiClient.delete(`/parcels/${parcelId}`);
}
