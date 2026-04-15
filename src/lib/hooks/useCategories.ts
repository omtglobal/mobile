import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '~/lib/api/catalog';
import { queryKeys } from '~/constants/queryKeys';

export function useCategoriesTree() {
  return useQuery({
    queryKey: queryKeys.categories.tree,
    queryFn: () => catalogApi.getCategories(),
    staleTime: 60 * 60 * 1000,
  });
}

export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id ?? ''),
    queryFn: () => catalogApi.getCategory(id!),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  });
}
