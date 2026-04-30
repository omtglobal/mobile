import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '~/lib/api/catalog';
import { queryKeys } from '~/constants/queryKeys';
import type { CreateReviewData } from '~/types/models';

const REVIEWS_PER_PAGE = 20;

export function useCreateReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewData) => catalogApi.createReview(productId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.productPages(productId) });
    },
  });
}

export function useProductReviews(productId: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: queryKeys.reviews.productPages(productId),
    queryFn: async ({ pageParam = 1 }) =>
      catalogApi.getProductReviews(productId, { page: pageParam, per_page: REVIEWS_PER_PAGE }),
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!productId && enabled,
    staleTime: 60 * 1000,
  });
}
