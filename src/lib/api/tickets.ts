import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '~/types/api';
import type { CreateTicketData, TicketResource } from '~/types/models';

export const ticketsApi = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<TicketResource>>('/tickets', { params }).then((r) => r.data),

  show: (id: string) =>
    apiClient.get<ApiResponse<TicketResource>>(`/tickets/${id}`).then((r) => r.data),

  create: (data: CreateTicketData) =>
    apiClient.post<ApiResponse<TicketResource>>('/tickets', data).then((r) => r.data),
};
