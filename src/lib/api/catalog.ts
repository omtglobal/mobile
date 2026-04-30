import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '~/types/api';
import type {
  Category,
  CreateReviewData,
  HomeData,
  Product,
  ProductFilters,
  ProductPageData,
  CategoryPageData,
  Review,
  SellerProfile,
} from '~/types/models';

export const catalogApi = {
  getHome: () =>
    apiClient.get<ApiResponse<HomeData>>('/catalog/home').then((r) => r.data),

  getCategories: () =>
    apiClient.get<ApiResponse<Category[]>>('/catalog/categories').then((r) => r.data),

  getCategoriesAll: () =>
    apiClient.get<ApiResponse<Category[]>>('/catalog/categories/all').then((r) => r.data),

  getCategory: (id: string) =>
    apiClient.get<ApiResponse<Category>>(`/catalog/categories/${id}`).then((r) => r.data),

  getCategoryPage: (id: string, params?: ProductFilters) =>
    apiClient
      .get<ApiResponse<CategoryPageData>>(`/catalog/categories/${id}/page`, { params })
      .then((r) => r.data),

  getCategoryProducts: (id: string, params?: ProductFilters) =>
    apiClient
      .get<PaginatedResponse<Product>>(`/catalog/categories/${id}/products`, { params })
      .then((r) => r.data),

  getProducts: (params?: ProductFilters) =>
    apiClient.get<PaginatedResponse<Product>>('/catalog/products', { params }).then((r) => r.data),

  getFeatured: () =>
    apiClient.get<ApiResponse<Product[]>>('/catalog/products/featured').then((r) => r.data),

  searchProducts: (q: string, params?: Omit<ProductFilters, 'q'>) =>
    apiClient
      .get<PaginatedResponse<Product>>('/catalog/products', { params: { search: q, ...params } })
      .then((r) => r.data),

  getProduct: (id: string) =>
    apiClient.get<ApiResponse<Product>>(`/catalog/products/${id}`).then((r) => r.data),

  getProductPage: (id: string) =>
    apiClient.get<ApiResponse<ProductPageData>>(`/catalog/products/${id}/page`).then((r) => r.data),

  createReview: (productId: string, data: CreateReviewData) =>
    apiClient
      .post<ApiResponse<Review>>(`/catalog/products/${productId}/reviews`, data)
      .then((r) => r.data),

  getProductReviews: (productId: string, params?: { page?: number; per_page?: number }) =>
    apiClient
      .get<PaginatedResponse<Review>>(`/catalog/products/${productId}/reviews`, { params })
      .then((r) => r.data),

  getCompany: (id: string) =>
    apiClient.get<ApiResponse<SellerProfile>>(`/catalog/companies/${id}`).then((r) => r.data),
};
