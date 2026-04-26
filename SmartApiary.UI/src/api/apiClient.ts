import axios from 'axios';

const apiBaseUrl = 'https://localhost:7035/api';
const developmentUserId = '11111111-1111-1111-1111-111111111111';

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

export type UpdateHiveRequest = Omit<CreateHiveRequest, 'apiaryId'>;

export type ParcelDto = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
};

export type CropDto = {
  id: string;
  parcelId: string;
  name: string;
  expectedBloomingStart: string;
  expectedBloomingEnd: string;
  area?: number | null;
  notes?: string | null;
};

export type SprayingAnnouncementDto = {
  id: string;
  parcelId: string;
  startTime: string;
  durationHours: number;
  preparationType?: string | null;
  status: string;
  notifiedBeekeepersCount: number;
  createdAt: string;
  cancelledAt?: string | null;
};

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

export type AlertDto = {
  id: string;
  title: string;
  message: string;
  type: string | number;
  createdAt: string;
  isRead: boolean;
};

export type AlertSettingsDto = {
  userId: string;
  weightDropThresholdKg: number;
  updatedAt: string;
};

export type UpdateAlertSettingsRequest = {
  weightDropThresholdKg: number;
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

export async function updateApiary(apiaryId: string, payload: UpdateApiaryRequest): Promise<void> {
  const response = await apiClient.put<ResultResponse<void>>(`/apiaries/${apiaryId}`, payload);
  unwrapResult(response.data, 'Failed to update apiary');
}

export async function deleteApiary(apiaryId: string): Promise<void> {
  const response = await apiClient.delete<ResultResponse<void>>(`/apiaries/${apiaryId}`);
  unwrapResult(response.data, 'Failed to delete apiary');
}

export async function getHivesByApiary(apiaryId: string): Promise<HiveDto[]> {
  const response = await apiClient.get<HiveDto[] | ResultResponse<HiveDto[]>>(`/hives/by-apiary/${apiaryId}`);
  return unwrapResult(response.data, 'Failed to load hives') ?? [];
}

export async function createHive(payload: CreateHiveRequest): Promise<string | undefined> {
  const response = await apiClient.post<string | ResultResponse<string>>('/hives', payload);
  return unwrapResult(response.data, 'Failed to create hive');
}

export async function updateHive(hiveId: string, payload: UpdateHiveRequest): Promise<void> {
  const response = await apiClient.put<ResultResponse<void>>(`/hives/${hiveId}`, payload);
  unwrapResult(response.data, 'Failed to update hive');
}

export async function deleteHive(hiveId: string): Promise<void> {
  const response = await apiClient.delete<ResultResponse<void>>(`/hives/${hiveId}`);
  unwrapResult(response.data, 'Failed to delete hive');
}

export async function getDeviceByHive(hiveId: string): Promise<DeviceDto | null> {
  try {
    const response = await apiClient.get<DeviceDto | ResultResponse<DeviceDto>>(`/devices/by-hive/${hiveId}`);
    return unwrapResult(response.data, 'Failed to load device') ?? null;
  } catch (error) {
    const message = getApiErrorMessage(error, 'Failed to load device');

    if (message === 'Device was not found.') {
      return null;
    }

    throw error;
  }
}

export async function registerDevice(payload: RegisterDeviceRequest): Promise<string | undefined> {
  const response = await apiClient.post<string | ResultResponse<string>>('/devices/register', payload);
  return unwrapResult(response.data, 'Failed to register device');
}

export async function activateDevice(payload: ActivateDeviceRequest): Promise<string | undefined> {
  const response = await apiClient.post<string | ResultResponse<string>>('/devices/activate', payload);
  return unwrapResult(response.data, 'Failed to activate device');
}

export async function getTelemetryForHive(
  hiveId: string,
  from: string,
  to: string,
): Promise<TelemetryReadingDto[]> {
  const response = await apiClient.get<TelemetryReadingApiDto[] | ResultResponse<TelemetryReadingApiDto[]>>(
    `/telemetry/${hiveId}`,
    { params: { from, to } },
  );

  return (unwrapResult(response.data, 'Failed to load telemetry') ?? []).map(normalizeTelemetryReading);
}

export async function getLatestHiveStatus(hiveId: string): Promise<LatestHiveStatusDto | null> {
  try {
    const response = await apiClient.get<LatestHiveStatusApiDto | ResultResponse<LatestHiveStatusApiDto>>(
      `/telemetry/${hiveId}/latest`,
    );
    const latestStatus = unwrapResult(response.data, 'Failed to load latest hive status');

    return latestStatus ? normalizeLatestHiveStatus(latestStatus) : null;
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
  const response = await apiClient.get<DailyWeightDeltaApiDto[] | ResultResponse<DailyWeightDeltaApiDto[]>>(
    `/telemetry/${hiveId}/daily-delta`,
    { params: { from, to } },
  );

  return (unwrapResult(response.data, 'Failed to load daily weight delta') ?? []).map(normalizeDailyWeightDelta);
}

export async function getAlerts(): Promise<AlertDto[]> {
  const response = await apiClient.get<AlertApiDto[] | AlertApiDto | ResultResponse<AlertApiDto[] | AlertApiDto | null>>(
    '/alerts',
  );
  const alerts = unwrapResult(response.data, 'Failed to load alerts');

  if (Array.isArray(alerts)) {
    return alerts.map(normalizeAlert);
  }

  return isAlertApiDto(alerts) ? [normalizeAlert(alerts)] : [];
}

export async function getAlertSettings(): Promise<AlertSettingsDto | null> {
  const response = await apiClient.get<AlertSettingsApiDto | ResultResponse<AlertSettingsApiDto | null>>('/alerts');
  const settings = unwrapResult(response.data, 'Failed to load alert settings');

  return settings ? normalizeAlertSettings(settings) : null;
}

export async function updateAlertSettings(payload: UpdateAlertSettingsRequest): Promise<void> {
  await apiClient.put('/alerts', payload);
}

export async function getParcels(): Promise<ParcelDto[]> {
  const response = await apiClient.get<ParcelDto[] | ResultResponse<ParcelDto[]>>('/parcels');
  return unwrapResult(response.data, 'Failed to load parcels') ?? [];
}

export async function getCropsByParcel(parcelId: string): Promise<CropDto[]> {
  const response = await apiClient.get<CropApiDto[] | ResultResponse<CropApiDto[]>>(`/crops/by-parcel/${parcelId}`);

  return (unwrapResult(response.data, 'Failed to load crops') ?? []).map(normalizeCrop);
}

export async function getSprayingByParcel(parcelId: string): Promise<SprayingAnnouncementDto[]> {
  const response = await apiClient.get<SprayingAnnouncementApiDto[] | ResultResponse<SprayingAnnouncementApiDto[]>>(
    `/spraying/by-parcel/${parcelId}`,
  );

  return (unwrapResult(response.data, 'Failed to load spraying announcements') ?? []).map(
    normalizeSprayingAnnouncement,
  );
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

type TelemetryReadingApiDto = Partial<TelemetryReadingDto> & {
  Id?: string;
  HiveId?: string;
  DeviceId?: string;
  Timestamp?: string;
  WeightKg?: number;
  HumidityPercent?: number;
  TemperatureCelsius?: number;
  BatteryPercent?: number;
};

type LatestHiveStatusApiDto = Partial<LatestHiveStatusDto> & {
  HiveId?: string;
  WeightKg?: number;
  HumidityPercent?: number;
  TemperatureCelsius?: number;
  BatteryPercent?: number;
  Timestamp?: string;
};

type DailyWeightDeltaApiDto = Partial<DailyWeightDeltaDto> & {
  Date?: string;
  DeltaKg?: number;
};

type AlertApiDto = Partial<AlertDto> & {
  Id?: string;
  Title?: string;
  Message?: string;
  Type?: string | number;
  CreatedAt?: string;
  IsRead?: boolean;
};

type AlertSettingsApiDto = Partial<AlertSettingsDto> & {
  UserId?: string;
  WeightDropThresholdKg?: number;
  UpdatedAt?: string;
};

type CropApiDto = Partial<CropDto> & {
  Id?: string;
  ParcelId?: string;
  Name?: string;
  ExpectedBloomingStart?: string;
  ExpectedBloomingEnd?: string;
  Area?: number | null;
  Notes?: string | null;
};

type SprayingAnnouncementApiDto = Partial<SprayingAnnouncementDto> & {
  Id?: string;
  ParcelId?: string;
  StartTime?: string;
  DurationHours?: number;
  PreparationType?: string | null;
  Status?: string;
  NotifiedBeekeepersCount?: number;
  CreatedAt?: string;
  CancelledAt?: string | null;
};

function normalizeTelemetryReading(reading: TelemetryReadingApiDto): TelemetryReadingDto {
  return {
    id: reading.id ?? reading.Id ?? '',
    hiveId: reading.hiveId ?? reading.HiveId ?? '',
    deviceId: reading.deviceId ?? reading.DeviceId ?? '',
    timestamp: reading.timestamp ?? reading.Timestamp ?? '',
    weightKg: reading.weightKg ?? reading.WeightKg ?? 0,
    humidityPercent: reading.humidityPercent ?? reading.HumidityPercent ?? 0,
    temperatureCelsius: reading.temperatureCelsius ?? reading.TemperatureCelsius ?? 0,
    batteryPercent: reading.batteryPercent ?? reading.BatteryPercent ?? 0,
  };
}

function normalizeLatestHiveStatus(status: LatestHiveStatusApiDto): LatestHiveStatusDto {
  return {
    hiveId: status.hiveId ?? status.HiveId ?? '',
    weightKg: status.weightKg ?? status.WeightKg ?? 0,
    humidityPercent: status.humidityPercent ?? status.HumidityPercent ?? 0,
    temperatureCelsius: status.temperatureCelsius ?? status.TemperatureCelsius ?? 0,
    batteryPercent: status.batteryPercent ?? status.BatteryPercent ?? 0,
    timestamp: status.timestamp ?? status.Timestamp ?? '',
  };
}

function normalizeDailyWeightDelta(delta: DailyWeightDeltaApiDto): DailyWeightDeltaDto {
  return {
    date: delta.date ?? delta.Date ?? '',
    deltaKg: delta.deltaKg ?? delta.DeltaKg ?? 0,
  };
}

function normalizeAlert(alert: AlertApiDto): AlertDto {
  return {
    id: alert.id ?? alert.Id ?? '',
    title: alert.title ?? alert.Title ?? 'Upozorenje',
    message: alert.message ?? alert.Message ?? '',
    type: alert.type ?? alert.Type ?? 'Info',
    createdAt: alert.createdAt ?? alert.CreatedAt ?? '',
    isRead: alert.isRead ?? alert.IsRead ?? false,
  };
}

function normalizeAlertSettings(settings: AlertSettingsApiDto): AlertSettingsDto {
  return {
    userId: settings.userId ?? settings.UserId ?? '',
    weightDropThresholdKg: settings.weightDropThresholdKg ?? settings.WeightDropThresholdKg ?? 0,
    updatedAt: settings.updatedAt ?? settings.UpdatedAt ?? '',
  };
}

function normalizeCrop(crop: CropApiDto): CropDto {
  return {
    id: crop.id ?? crop.Id ?? '',
    parcelId: crop.parcelId ?? crop.ParcelId ?? '',
    name: crop.name ?? crop.Name ?? '',
    expectedBloomingStart: crop.expectedBloomingStart ?? crop.ExpectedBloomingStart ?? '',
    expectedBloomingEnd: crop.expectedBloomingEnd ?? crop.ExpectedBloomingEnd ?? '',
    area: crop.area ?? crop.Area ?? null,
    notes: crop.notes ?? crop.Notes ?? null,
  };
}

function normalizeSprayingAnnouncement(announcement: SprayingAnnouncementApiDto): SprayingAnnouncementDto {
  return {
    id: announcement.id ?? announcement.Id ?? '',
    parcelId: announcement.parcelId ?? announcement.ParcelId ?? '',
    startTime: announcement.startTime ?? announcement.StartTime ?? '',
    durationHours: announcement.durationHours ?? announcement.DurationHours ?? 0,
    preparationType: announcement.preparationType ?? announcement.PreparationType ?? null,
    status: announcement.status ?? announcement.Status ?? '',
    notifiedBeekeepersCount: announcement.notifiedBeekeepersCount ?? announcement.NotifiedBeekeepersCount ?? 0,
    createdAt: announcement.createdAt ?? announcement.CreatedAt ?? '',
    cancelledAt: announcement.cancelledAt ?? announcement.CancelledAt ?? null,
  };
}

function isAlertApiDto(value: unknown): value is AlertApiDto {
  return typeof value === 'object'
    && value !== null
    && (
      'title' in value
      || 'Title' in value
      || 'message' in value
      || 'Message' in value
      || 'isRead' in value
      || 'IsRead' in value
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
