import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '~/lib/api/orders';
import { queryKeys } from '~/constants/queryKeys';
import type { CreateOrderData } from '~/types/models';

export function useOrders() {
  return useInfiniteQuery({
    queryKey: queryKeys.orders.all,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await ordersApi.list(pageParam, 20);
      return res;
    },
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 60 * 1000,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? ''),
    queryFn: () => ordersApi.show(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderData) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

export function usePayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, nativePaymentSheet }: { id: string; nativePaymentSheet?: boolean }) =>
      ordersApi.pay(id, { nativePaymentSheet }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
    },
  });
}

export function useConfirmDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersApi.confirmDelivery(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
    },
  });
}
