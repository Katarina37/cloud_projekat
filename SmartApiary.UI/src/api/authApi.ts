// API pozivi koje koristi authApi.

import type { ResultResponse } from './apiResult';
import type { UserRole } from '../auth/authStorage';
import apiClient from './httpClient';

export type { UserRole } from '../auth/authStorage';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  token: string;
  userId: string;
  email: string;
  role: UserRole;
};

export type ActivateAccountRequest = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
  confirmPassword: string;
};

export async function login(payload: LoginRequest): Promise<LoginResponseDto> {
  const response = await apiClient.post<ResultResponse<LoginResponseDto>>('/auth/login', payload);
  return response.data.value;
}

export async function activateAccount(payload: ActivateAccountRequest): Promise<void> {
  await apiClient.post('/auth/activate', payload);
}

export async function forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
  await apiClient.post('/auth/forgot-password', payload);
}

export async function resetPassword(payload: ResetPasswordRequest): Promise<void> {
  await apiClient.post('/auth/reset-password', payload);
}
