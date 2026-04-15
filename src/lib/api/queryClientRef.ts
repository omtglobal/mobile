import type { QueryClient } from '@tanstack/react-query';

let queryClientRef: QueryClient | null = null;

export function setQueryClient(client: QueryClient): void {
  queryClientRef = client;
}

export function getQueryClient(): QueryClient | null {
  return queryClientRef;
}

export function clearQueryCacheOnLogout(): void {
  queryClientRef?.clear();
}
