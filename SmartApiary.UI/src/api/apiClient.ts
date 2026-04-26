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

export type HiveInspectionDto = {
  id: string;
  hiveId: string;
  date: string;
  framesWithHoney: number;
  broodFrames: number;
  queenPresent: boolean;
  notes?: string | null;
};

export type CreateHiveInspectionRequest = {
  hiveId: string;
  date: string;
  framesWithHoney: number;
  broodFrames: number;
  queenPresent: boolean;
  notes?: string | null;
};

export type UpdateHiveInspectionRequest = CreateHiveInspectionRequest;

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

export type UpdateCropRequest = Omit<CreateCropRequest, 'parcelId'>;

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

export type NotificationDto = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string | number;
  createdAt: string;
  isRead: boolean;
  readAt?: string | null;
};

export type AlertDto = NotificationDto;

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
  warning?: unknown;
  Warning?: unknown;
  weatherWarning?: unknown;
  WeatherWarning?: unknown;
  weatherWarningMessage?: unknown;
  WeatherWarningMessage?: unknown;
  message?: unknown;
  Message?: unknown;
};

export type SprayingActionResult<T = void> = {
  value: T | undefined;
  weatherWarning: string | null;
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

export async function getHiveInspectionsByHive(hiveId: string): Promise<HiveInspectionDto[]> {
  const response = await apiClient.get<HiveInspectionApiDto[] | ResultResponse<HiveInspectionApiDto[]>>(
    `/hive-inspections/by-hive/${hiveId}`,
  );

  return (unwrapResult(response.data, 'Failed to load hive inspections') ?? []).map(normalizeHiveInspection);
}

export async function createHiveInspection(
  payload: CreateHiveInspectionRequest,
): Promise<string | undefined> {
  const response = await apiClient.post<string | ResultResponse<string>>('/hive-inspections', payload);
  return unwrapResult(response.data, 'Failed to create hive inspection');
}

export async function updateHiveInspection(
  inspectionId: string,
  payload: UpdateHiveInspectionRequest,
): Promise<void> {
  const response = await apiClient.put<ResultResponse<void>>(`/hive-inspections/${inspectionId}`, payload);
  unwrapResult(response.data, 'Failed to update hive inspection');
}

export async function deleteHiveInspection(inspectionId: string): Promise<void> {
  const response = await apiClient.delete<ResultResponse<void>>(`/hive-inspections/${inspectionId}`);
  unwrapResult(response.data, 'Failed to delete hive inspection');
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

export async function getNotifications(): Promise<NotificationDto[]> {
  const response = await apiClient.get<NotificationApiDto[] | ResultResponse<NotificationApiDto[] | null>>(
    '/notifications',
  );
  const notifications = unwrapResult(response.data, 'Failed to load notifications');

  return (notifications ?? []).map(normalizeNotification);
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const response = await apiClient.put<ResultResponse<void>>(`/notifications/${notificationId}/read`);
  unwrapResult(response.data, 'Failed to mark notification as read');
}

export async function getAlerts(): Promise<AlertDto[]> {
  return getNotifications();
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

export async function createParcel(payload: CreateParcelRequest): Promise<string | undefined> {
  const response = await apiClient.post<string | ResultResponse<string>>('/parcels', payload);
  return unwrapResult(response.data, 'Failed to create parcel');
}

export async function updateParcel(parcelId: string, payload: UpdateParcelRequest): Promise<void> {
  const response = await apiClient.put<ResultResponse<void>>(`/parcels/${parcelId}`, payload);
  unwrapResult(response.data, 'Failed to update parcel');
}

export async function deleteParcel(parcelId: string): Promise<void> {
  const response = await apiClient.delete<ResultResponse<void>>(`/parcels/${parcelId}`);
  unwrapResult(response.data, 'Failed to delete parcel');
}

export async function getCropsByParcel(parcelId: string): Promise<CropDto[]> {
  const response = await apiClient.get<CropApiDto[] | ResultResponse<CropApiDto[]>>(`/crops/by-parcel/${parcelId}`);

  return (unwrapResult(response.data, 'Failed to load crops') ?? []).map(normalizeCrop);
}

export async function createCrop(payload: CreateCropRequest): Promise<string | undefined> {
  const response = await apiClient.post<string | ResultResponse<string>>('/crops', payload);
  return unwrapResult(response.data, 'Failed to create crop');
}

export async function updateCrop(cropId: string, payload: UpdateCropRequest): Promise<void> {
  const response = await apiClient.put<ResultResponse<void>>(`/crops/${cropId}`, payload);
  unwrapResult(response.data, 'Failed to update crop');
}

export async function deleteCrop(cropId: string): Promise<void> {
  const response = await apiClient.delete<ResultResponse<void>>(`/crops/${cropId}`);
  unwrapResult(response.data, 'Failed to delete crop');
}

export async function getSprayingByParcel(parcelId: string): Promise<SprayingAnnouncementDto[]> {
  const response = await apiClient.get<SprayingAnnouncementApiDto[] | ResultResponse<SprayingAnnouncementApiDto[]>>(
    `/spraying/by-parcel/${parcelId}`,
  );

  return (unwrapResult(response.data, 'Failed to load spraying announcements') ?? []).map(
    normalizeSprayingAnnouncement,
  );
}

export async function createSpraying(payload: CreateSprayingRequest): Promise<SprayingActionResult<string>> {
  const response = await apiClient.post<string | ResultResponse<string>>('/spraying', payload);
  return unwrapSprayingActionResult(response.data, 'Failed to schedule spraying announcement');
}

export async function rescheduleSpraying(
  sprayingId: string,
  payload: RescheduleSprayingRequest,
): Promise<SprayingActionResult> {
  const response = await apiClient.put<ResultResponse<void>>(`/spraying/${sprayingId}/reschedule`, payload);
  return unwrapSprayingActionResult(response.data, 'Failed to reschedule spraying announcement');
}

export async function cancelSpraying(sprayingId: string): Promise<void> {
  const response = await apiClient.put<ResultResponse<void>>(`/spraying/${sprayingId}/cancel`);
  unwrapResult(response.data, 'Failed to cancel spraying announcement');
}

export async function completeSpraying(sprayingId: string): Promise<void> {
  const response = await apiClient.put<ResultResponse<void>>(`/spraying/${sprayingId}/complete`);
  unwrapResult(response.data, 'Failed to complete spraying announcement');
}

export async function getSprayingNotificationStatus(sprayingId: string): Promise<number> {
  const response = await apiClient.get<number | ResultResponse<number>>(`/spraying/${sprayingId}/notifications`);
  return unwrapResult(response.data, 'Failed to load spraying notification status') ?? 0;
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

function unwrapSprayingActionResult<T>(
  data: T | ResultResponse<T>,
  fallbackError: string,
): SprayingActionResult<T> {
  return {
    value: unwrapResult(data, fallbackError),
    weatherWarning: getResponseWeatherWarning(data),
  };
}

const defaultWeatherWarningMessage = 'Upozorenje: loši vremenski uslovi – preporučuje se pomeranje termina.';

const weatherWarningResponseKeys = [
  'warning',
  'Warning',
  'weatherWarning',
  'WeatherWarning',
  'weatherWarningMessage',
  'WeatherWarningMessage',
  'message',
  'Message',
] as const;

function getResponseWeatherWarning(data: unknown): string | null {
  if (!isRecord(data)) {
    return null;
  }

  for (const key of weatherWarningResponseKeys) {
    if (!(key in data)) {
      continue;
    }

    const weatherWarning = getWeatherWarningText(data[key]);

    if (weatherWarning) {
      return weatherWarning;
    }
  }

  return null;
}

function getWeatherWarningText(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  if (typeof value === 'boolean') {
    return value ? defaultWeatherWarningMessage : null;
  }

  if (isRecord(value)) {
    return getResponseWeatherWarning(value) ?? (Object.keys(value).length > 0 ? defaultWeatherWarningMessage : null);
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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

type HiveInspectionApiDto = Partial<HiveInspectionDto> & {
  Id?: string;
  HiveId?: string;
  Date?: string;
  FramesWithHoney?: number;
  BroodFrames?: number;
  QueenPresent?: boolean;
  Notes?: string | null;
};

type NotificationApiDto = Partial<NotificationDto> & {
  Id?: string;
  UserId?: string;
  Title?: string;
  Message?: string;
  Type?: string | number;
  CreatedAt?: string;
  IsRead?: boolean;
  ReadAt?: string | null;
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

function normalizeHiveInspection(record: HiveInspectionApiDto): HiveInspectionDto {
  return {
    id: record.id ?? record.Id ?? '',
    hiveId: record.hiveId ?? record.HiveId ?? '',
    date: record.date ?? record.Date ?? '',
    framesWithHoney: record.framesWithHoney ?? record.FramesWithHoney ?? 0,
    broodFrames: record.broodFrames ?? record.BroodFrames ?? 0,
    queenPresent: record.queenPresent ?? record.QueenPresent ?? false,
    notes: record.notes ?? record.Notes ?? null,
  };
}

function normalizeNotification(notification: NotificationApiDto): NotificationDto {
  return {
    id: notification.id ?? notification.Id ?? '',
    userId: notification.userId ?? notification.UserId ?? '',
    title: notification.title ?? notification.Title ?? 'Upozorenje',
    message: notification.message ?? notification.Message ?? '',
    type: notification.type ?? notification.Type ?? 'Info',
    createdAt: notification.createdAt ?? notification.CreatedAt ?? '',
    isRead: notification.isRead ?? notification.IsRead ?? false,
    readAt: notification.readAt ?? notification.ReadAt ?? null,
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
