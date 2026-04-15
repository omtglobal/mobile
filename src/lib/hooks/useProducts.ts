import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { catalogApi } from '~/lib/api/catalog';
import { queryKeys } from '~/constants/queryKeys';
import type { ProductFilters } from '~/types/models';

export function useProducts(params?: ProductFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list(params ?? {}),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await catalogApi.getProducts({ ...params, page: pageParam });
      return res;
    },
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: () => catalogApi.getProductPage(id!),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  });
}

export function useHome() {
  return useQuery({
    queryKey: queryKeys.home,
    queryFn: () => catalogApi.getHome(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchProducts(query: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.search(query),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await catalogApi.searchProducts(query, { page: pageParam, per_page: 20 });
      return res;
    },
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryProducts(categoryId: string | undefined, filters?: ProductFilters) {
  return useInfiniteQuery({
    queryKey: queryKeys.categories.products(categoryId ?? '', filters),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await catalogApi.getCategoryProducts(categoryId!, {
        ...filters,
        page: pageParam,
      });
      return res;
    },
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!categoryId,
    staleTime: 3 * 60 * 1000,
  });
}
