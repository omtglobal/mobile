import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '~/types/api';
import type { CreateAddressData, ShippingAddress, UpdateAddressData } from '~/types/models';
import { unwrapLaravelCollectionToArray } from '~/lib/utils/laravelCollection';

export const addressesApi = {
  list: () =>
    apiClient.get<ApiResponse<ShippingAddress[]>>('/addresses').then((r) => ({
      ...r.data,
      data: unwrapLaravelCollectionToArray<ShippingAddress>(r.data.data as ShippingAddress[] | { data: ShippingAddress[] }),
    })),

  show: (id: string) =>
    apiClient.get<ApiResponse<ShippingAddress>>(`/addresses/${id}`).then((r) => r.data),

  create: (data: CreateAddressData) =>
    apiClient.post<ApiResponse<ShippingAddress>>('/addresses', data).then((r) => r.data),

  update: (id: string, data: UpdateAddressData) =>
    apiClient.put<ApiResponse<ShippingAddress>>(`/addresses/${id}`, data).then((r) => r.data),

  destroy: (id: string) =>
    apiClient.delete<ApiResponse<unknown>>(`/addresses/${id}`).then((r) => r.data),
};
