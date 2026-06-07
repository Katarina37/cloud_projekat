import { getApiErrorMessage, type ResultResponse } from './apiResult';
import apiClient from './httpClient';

export type TelemetryReadingDto = {
  id: string;
  hiveId: string;
  deviceId: string;
  timestamp: string;
  weightKg: number;
  humidityPercent: number;
  temperatureCelsius: number;
  batteryPercent: number;
};

export type LatestHiveStatusDto = {
  hiveId: string;
  weightKg: number;
  humidityPercent: number;
  temperatureCelsius: number;
  batteryPercent: number;
  timestamp: string;
};

export type DailyWeightDeltaDto = {
  date: string;
  deltaKg: number;
};

export type TelemetryUpdateDto = {
  apiaryId: string;
  hiveId: string;
  deviceId: string;
  timestamp: string;
  weight: number;
  temperature: number;
  humidity: number;
  batteryLevel: number;
};

export async function getTelemetryForHive(
  hiveId: string,
  from: string,
  to: string,
): Promise<TelemetryReadingDto[]> {
  const response = await apiClient.get<ResultResponse<TelemetryReadingDto[]>>(
    `/telemetry/${hiveId}`,
    { params: { from, to } },
  );

  return response.data.value;
}

export async function getLatestHiveStatus(hiveId: string): Promise<LatestHiveStatusDto | null> {
  try {
    const response = await apiClient.get<ResultResponse<LatestHiveStatusDto>>(
      `/telemetry/${hiveId}/latest`,
    );
    return response.data.value;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to load latest hive status');

    if (message === 'Telemetry reading was not found.') {
      return null;
    }

    throw error;
  }
}

export async function getDailyWeightDeltas(
  hiveId: string,
  from: string,
  to: string,
): Promise<DailyWeightDeltaDto[]> {
  const response = await apiClient.get<ResultResponse<DailyWeightDeltaDto[]>>(
    `/telemetry/${hiveId}/daily-delta`,
    { params: { from, to } },
  );

  return response.data.value;
}
