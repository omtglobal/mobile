import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '~/types/api';
import type { CreateOrderData, Order, OrderPayResult } from '~/types/models';

export const ordersApi = {
  list: (page = 1, perPage = 20) =>
    apiClient
      .get<PaginatedResponse<Order>>('/orders', { params: { page, per_page: perPage } })
      .then((r) => r.data),

  show: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/orders/${id}`).then((r) => r.data),

  create: (data: CreateOrderData) =>
    apiClient.post<ApiResponse<Order>>('/orders', data).then((r) => r.data),

  pay: (id: string, options?: { nativePaymentSheet?: boolean }) =>
    apiClient
      .post<ApiResponse<OrderPayResult>>(`/orders/${id}/pay`, undefined, {
        headers:
          options?.nativePaymentSheet === true
            ? { 'X-Stripe-Payment-Surface': 'native' }
            : {},
      })
      .then((r) => r.data),

  confirmDelivery: (id: string) =>
    apiClient.post<ApiResponse<Order>>(`/orders/${id}/confirm-delivery`).then((r) => r.data),
};
