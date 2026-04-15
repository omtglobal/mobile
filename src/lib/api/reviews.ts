import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '~/types/api';
import type { CreateReviewData, Review } from '~/types/models';

export const reviewsApi = {
  list: (productId: string, page = 1, perPage = 20) =>
    apiClient
      .get<PaginatedResponse<Review>>(`/catalog/products/${productId}/reviews`, {
        params: { page, per_page: perPage },
      })
      .then((r) => r.data),

  create: (productId: string, data: CreateReviewData) =>
    apiClient
      .post<ApiResponse<Review>>(`/catalog/products/${productId}/reviews`, data)
      .then((r) => r.data),

  update: (productId: string, reviewId: string, data: CreateReviewData) =>
    apiClient
      .put<ApiResponse<Review>>(`/catalog/products/${productId}/reviews/${reviewId}`, data)
      .then((r) => r.data),

  destroy: (productId: string, reviewId: string) =>
    apiClient
      .delete<ApiResponse<unknown>>(`/catalog/products/${productId}/reviews/${reviewId}`)
      .then((r) => r.data),
};
