// API pozivi koje koristi hiveInspectionsApi.

import type { ResultResponse } from './apiResult';
import apiClient from './httpClient';

export type HiveInspectionDto = {
  id: string;
  hiveId: string;
  date: string;
  framesWithHoney: number;
  broodFrames: number;
  queenPresent: boolean;
  bottomBoardColor: string;
  honeyQuantityKg: number;
  notes?: string | null;
};

export type CreateHiveInspectionRequest = {
  hiveId: string;
  date: string;
  framesWithHoney: number;
  broodFrames: number;
  queenPresent: boolean;
  bottomBoardColor: string;
  honeyQuantityKg: number;
  notes?: string | null;
};

export type UpdateHiveInspectionRequest = {
  hiveId: string;
  date: string;
  framesWithHoney: number;
  broodFrames: number;
  queenPresent: boolean;
  bottomBoardColor: string;
  honeyQuantityKg: number;
  notes?: string | null;
};

export type PagedResult<T> = {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
};

export async function getHiveInspectionsByHive(
  hiveId: string,
  pageNumber = 1,
  pageSize = 10,
): Promise<PagedResult<HiveInspectionDto>> {
  const response = await apiClient.get<ResultResponse<PagedResult<HiveInspectionDto>>>(
    `/hive-inspections/by-hive/${hiveId}`,
    { params: { pageNumber, pageSize } },
  );

  return response.data.value;
}

export async function createHiveInspection(
  payload: CreateHiveInspectionRequest,
): Promise<string | undefined> {
  const response = await apiClient.post<ResultResponse<string>>('/hive-inspections', payload);
  return response.data.value;
}

export async function updateHiveInspection(
  inspectionId: string,
  payload: UpdateHiveInspectionRequest,
): Promise<void> {
  await apiClient.put(`/hive-inspections/${inspectionId}`, payload);
}

export async function deleteHiveInspection(inspectionId: string): Promise<void> {
  await apiClient.delete(`/hive-inspections/${inspectionId}`);
}
