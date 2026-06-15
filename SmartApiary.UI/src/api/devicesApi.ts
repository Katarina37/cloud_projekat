// API pozivi koje koristi devicesApi.

import { getApiErrorMessage, type ResultResponse } from './apiResult';
import apiClient from './httpClient';

export type DeviceDto = {
  id: string;
  hiveId: string;
  serialNumber: string;
  deviceIdentifier?: string | null;
  status: string;
  createdAt: string;
  pairedAt?: string | null;
};

export type RegisterDeviceRequest = {
  hiveId: string;
  serialNumber: string;
};

export type ActivateDeviceRequest = {
  serialNumber: string;
  deviceIdentifier: string;
};

type DeviceActivationResponse = {
  deviceAccessToken: string;
  warning?: string | null;
};

const functionsApiBaseUrl = (
  import.meta.env.VITE_FUNCTIONS_API_URL || 'http://localhost:7271/api'
).replace(/\/$/, '');

export async function getDeviceByHive(hiveId: string): Promise<DeviceDto | null> {
  try {
    const response = await apiClient.get<ResultResponse<DeviceDto>>(`/devices/by-hive/${hiveId}`);
    return response.data.value;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to load device');

    if (message === 'Device was not found.') {
      return null;
    }

    throw error;
  }
}

export async function registerDevice(payload: RegisterDeviceRequest): Promise<string | undefined> {
  const response = await apiClient.post<ResultResponse<string>>('/devices/register', payload);
  return response.data.value;
}

export async function activateDevice(payload: ActivateDeviceRequest): Promise<string | undefined> {
  const response = await apiClient.post<DeviceActivationResponse>(
    `${functionsApiBaseUrl}/devices/activate`,
    payload,
  );
  return response.data.deviceAccessToken;
}
