import type { ResultResponse } from './apiResult';
import type { UserRole } from './authApi';
import apiClient from './httpClient';

export type AdminUserDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

export type CreateAdminUserRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
};

export async function getAdminUsers(): Promise<AdminUserDto[]> {
  const response = await apiClient.get<ResultResponse<AdminUserDto[]>>('/admin/users');
  return response.data.value;
}

export async function createAdminUser(payload: CreateAdminUserRequest): Promise<string | undefined> {
  const response = await apiClient.post<ResultResponse<string>>('/admin/users', payload);
  return response.data.value;
}

export async function deactivateAdminUser(userId: string): Promise<void> {
  await apiClient.put(`/admin/users/${userId}/deactivate`);
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await apiClient.delete(`/admin/users/${userId}`);
}
