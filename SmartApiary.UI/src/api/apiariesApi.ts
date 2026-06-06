import type { ResultResponse } from './apiResult';
import apiClient from './httpClient';

export type ApiaryDto = {
  id: string;
  beekeeperId?: string;
  name: string;
  latitude: number;
  longitude: number;
  terrainDescription?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  createdAt: string;
};

export type CreateApiaryRequest = {
  name: string;
  latitude: number;
  longitude: number;
  terrainDescription?: string | null;
};

export type UpdateApiaryRequest = CreateApiaryRequest;

export async function getApiaries(): Promise<ApiaryDto[]> {
  const response = await apiClient.get<ResultResponse<ApiaryDto[]>>('/apiaries');
  return response.data.value;
}

export async function createApiary(payload: CreateApiaryRequest): Promise<string | undefined> {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('latitude', String(payload.latitude));
  formData.append('longitude', String(payload.longitude));

  if (payload.terrainDescription) {
    formData.append('terrainDescription', payload.terrainDescription);
  }

  const response = await apiClient.post<ResultResponse<string>>('/apiaries', formData);
  return response.data.value;
}

export async function updateApiary(apiaryId: string, payload: UpdateApiaryRequest): Promise<void> {
  await apiClient.put(`/apiaries/${apiaryId}`, payload);
}

export async function deleteApiary(apiaryId: string): Promise<void> {
  await apiClient.delete(`/apiaries/${apiaryId}`);
}
