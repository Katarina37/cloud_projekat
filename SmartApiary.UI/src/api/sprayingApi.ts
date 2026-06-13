import type { ResultResponse } from './apiResult';
import type { PagedResult } from './hiveInspectionsApi';
import apiClient from './httpClient';

export type WeatherInfoDto = {
  windSpeed: number;
  hasRain: boolean;
  description?: string | null;
};

export type SprayingAnnouncementDto = {
  id: string;
  parcelId: string;
  parcelName: string;
  startTime: string;
  durationHours: number;
  preparationType?: string | null;
  status: string;
  notifiedBeekeepersCount: number;
  createdAt: string;
  cancelledAt?: string | null;
  endTime?: string | null;
  cropName?: string | null;
  weatherSnapshot?: WeatherInfoDto | null;
};

export type CreateSprayingRequest = {
  parcelId: string;
  startTime: string;
  durationHours: number;
  preparationType?: string | null;
};

export type RescheduleSprayingRequest = {
  newStartTime: string;
  newDurationHours: number;
};

export type SprayingActionResult<T = void> = {
  value: T | undefined;
  weatherWarning: string | null;
};

export async function getSprayingByParcel(
  parcelId: string,
  fromDate?: string,
  toDate?: string,
  pageNumber = 1,
  pageSize = 10,
): Promise<PagedResult<SprayingAnnouncementDto>> {
  const response = await apiClient.get<ResultResponse<PagedResult<SprayingAnnouncementDto>>>(
    `/spraying/by-parcel/${parcelId}`,
    {
      params: {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        pageNumber,
        pageSize,
      },
    },
  );

  return response.data.value;
}

export async function createSpraying(payload: CreateSprayingRequest): Promise<SprayingActionResult<string>> {
  const response = await apiClient.post<ResultResponse<string>>('/spraying', payload);

  return {
    value: response.data.value,
    weatherWarning: response.data.warning || null,
  };
}

export async function rescheduleSpraying(
  sprayingId: string,
  payload: RescheduleSprayingRequest,
): Promise<SprayingActionResult> {
  const response = await apiClient.put<ResultResponse<void>>(`/spraying/${sprayingId}/reschedule`, payload);

  return {
    value: response.data.value,
    weatherWarning: response.data.warning || null,
  };
}

export async function cancelSpraying(sprayingId: string): Promise<void> {
  await apiClient.put(`/spraying/${sprayingId}/cancel`);
}

export async function completeSpraying(sprayingId: string): Promise<void> {
  await apiClient.put(`/spraying/${sprayingId}/complete`);
}

export async function getSprayingNotificationStatus(sprayingId: string): Promise<number> {
  const response = await apiClient.get<ResultResponse<number>>(`/spraying/${sprayingId}/notifications`);
  return response.data.value;
}
