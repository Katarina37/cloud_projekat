import axios from 'axios';

const apiBaseUrl = 'https://localhost:7035/api';
const developmentUserId = '11111111-1111-1111-1111-111111111111';

export type ApiaryDto = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
};

export type CreateApiaryRequest = {
  name: string;
  latitude: number;
  longitude: number;
};

export type HiveType = 0 | 1 | 2 | 3 | 'LR' | 'DB' | 'Poloska' | 'Other';

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
  type: 0 | 1 | 2 | 3;
  boxColor: string;
  queenAgeYears: number;
  notes?: string | null;
};

export type ParcelDto = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
};

export type ResultResponse<T> = {
  isSuccess?: boolean;
  IsSuccess?: boolean;
  isFailure?: boolean;
  IsFailure?: boolean;
  error?: unknown;
  Error?: unknown;
  value?: T;
  Value?: T;
};

const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  config.headers['X-User-Id'] = developmentUserId;

  return config;
});

export function unwrapResult<T>(data: T | ResultResponse<T>, fallbackError: string): T {
  if (!isResultResponse<T>(data)) {
    return data;
  }

  if (data.isFailure || data.IsFailure) {
    throw new Error(getErrorMessage(data.error ?? data.Error, fallbackError));
  }

  return (data.value ?? data.Value) as T;
}

export async function getApiaries(): Promise<ApiaryDto[]> {
  const response = await apiClient.get<ApiaryDto[] | ResultResponse<ApiaryDto[]>>('/apiaries');
  return unwrapResult(response.data, 'Failed to load apiaries') ?? [];
}

export async function createApiary(payload: CreateApiaryRequest): Promise<string | undefined> {
  const response = await apiClient.post<string | ResultResponse<string>>('/apiaries', payload);
  return unwrapResult(response.data, 'Failed to create apiary');
}

export async function getHivesByApiary(apiaryId: string): Promise<HiveDto[]> {
  const response = await apiClient.get<HiveDto[] | ResultResponse<HiveDto[]>>(`/hives/by-apiary/${apiaryId}`);
  return unwrapResult(response.data, 'Failed to load hives') ?? [];
}

export async function createHive(payload: CreateHiveRequest): Promise<string | undefined> {
  const response = await apiClient.post<string | ResultResponse<string>>('/hives', payload);
  return unwrapResult(response.data, 'Failed to create hive');
}

export async function getParcels(): Promise<ParcelDto[]> {
  const response = await apiClient.get<ParcelDto[] | ResultResponse<ParcelDto[]>>('/parcels');
  return unwrapResult(response.data, 'Failed to load parcels') ?? [];
}

export function getApiErrorMessage(error: unknown, fallbackError: string) {
  if (axios.isAxiosError(error)) {
    return getErrorMessage(error.response?.data ?? error.message, fallbackError);
  }

  if (error instanceof Error) {
    return getErrorMessage(error.message, fallbackError);
  }

  return getErrorMessage(error, fallbackError);
}

function isResultResponse<T>(data: T | ResultResponse<T>): data is ResultResponse<T> {
  return typeof data === 'object'
    && data !== null
    && !Array.isArray(data)
    && (
      'isSuccess' in data
      || 'IsSuccess' in data
      || 'isFailure' in data
      || 'IsFailure' in data
      || 'value' in data
      || 'Value' in data
      || 'error' in data
      || 'Error' in data
    );
}

function getErrorMessage(error: unknown, fallbackError: string) {
  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  if (isResultResponse<unknown>(error)) {
    return getErrorMessage(error.error ?? error.Error, fallbackError);
  }

  return fallbackError;
}

export default apiClient;
