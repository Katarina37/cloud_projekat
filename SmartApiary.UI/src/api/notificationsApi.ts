import type { ResultResponse } from './apiResult';
import apiClient from './httpClient';

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

export async function getNotifications(): Promise<NotificationDto[]> {
  const response = await apiClient.get<ResultResponse<NotificationDto[]>>('/notifications');
  return response.data.value;
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await apiClient.put(`/notifications/${notificationId}/read`);
}

export async function getAlerts(): Promise<AlertDto[]> {
  return getNotifications();
}

export async function getAlertSettings(): Promise<AlertSettingsDto | null> {
  const response = await apiClient.get<ResultResponse<AlertSettingsDto>>('/alerts');
  return response.data.value;
}

export async function updateAlertSettings(payload: UpdateAlertSettingsRequest): Promise<void> {
  await apiClient.put('/alerts', payload);
}
