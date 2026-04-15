import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '~/lib/api/tickets';
import { queryKeys } from '~/constants/queryKeys';
import type { CreateTicketData } from '~/types/models';

export function useTickets(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: [...queryKeys.tickets.all, params ?? {}],
    queryFn: () => ticketsApi.list(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useTicket(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id ?? ''),
    queryFn: () => ticketsApi.show(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketData) => ticketsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
}
