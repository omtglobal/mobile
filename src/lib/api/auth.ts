import { apiClient } from './client';
import type { ApiResponse } from '~/types/api';
import type { AuthResponse, LoginData, RegisterData, User } from '~/types/models';

export const authApi = {
  register: (data: RegisterData) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data).then((r) => r.data),

  login: (data: LoginData) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data).then((r) => r.data),

  logout: () => apiClient.post<ApiResponse<unknown>>('/auth/logout').then((r) => r.data),

  refresh: () =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh').then((r) => r.data),

  me: () => apiClient.get<ApiResponse<User>>('/auth/me').then((r) => r.data),

  updateProfile: (data: { name?: string; preferred_locale?: string; messenger_searchable?: boolean }) =>
    apiClient.patch<ApiResponse<User>>('/auth/profile', data).then((r) => r.data),
};
