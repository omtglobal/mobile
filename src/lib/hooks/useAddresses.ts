import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressesApi } from '~/lib/api/addresses';
import { queryKeys } from '~/constants/queryKeys';
import type { CreateAddressData, UpdateAddressData } from '~/types/models';

export function useAddresses() {
  return useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: () => addressesApi.list(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddress(id: string | undefined) {
  return useQuery({
    queryKey: [...queryKeys.addresses.all, id],
    queryFn: () => addressesApi.show(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressData) => addressesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}

export function useUpdateAddress(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAddressData) => addressesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => addressesApi.destroy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}
