// API pozivi koje koristi hivesApi.

import type { ResultResponse } from './apiResult';
import apiClient from './httpClient';

export type HiveTypeValue = 0 | 1 | 2 | 3;

export type HiveType = HiveTypeValue | 'LR' | 'DB' | 'Poloska' | 'Other';

export type HiveDto = {
  id: string;
  apiaryId: string;
  label: string;
  type: HiveType;
  boxColor: string;
  queenAgeYears: number;
  notes?: string | null;
  createdAt: string;
};

export type CreateHiveRequest = {
  apiaryId: string;
  label: string;
  type: HiveTypeValue;
  boxColor: string;
  queenAgeYears: number;
  notes?: string | null;
};

export type UpdateHiveRequest = {
  label: string;
  type: HiveTypeValue;
  boxColor: string;
  queenAgeYears: number;
  notes?: string | null;
};

export async function getHivesByApiary(apiaryId: string): Promise<HiveDto[]> {
  const response = await apiClient.get<ResultResponse<HiveDto[]>>(`/hives/by-apiary/${apiaryId}`);
  return response.data.value;
}

export async function createHive(payload: CreateHiveRequest): Promise<string | undefined> {
  const response = await apiClient.post<ResultResponse<string>>('/hives', payload);
  return response.data.value;
}

export async function updateHive(hiveId: string, payload: UpdateHiveRequest): Promise<void> {
  await apiClient.put(`/hives/${hiveId}`, payload);
}

export async function deleteHive(hiveId: string): Promise<void> {
  await apiClient.delete(`/hives/${hiveId}`);
}
