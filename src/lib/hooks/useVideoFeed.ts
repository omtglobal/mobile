import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { queryKeys } from '~/constants/queryKeys';
import { videoApi } from '~/lib/api/video';
import type { VideoFeedItem } from '~/types/content';

const API_PAGE_LIMIT = 10;

/**
 * Video feed backed by `/api/v1/client/video/feed` (cursor pagination).
 * Videos are served via pre-signed S3/MinIO URLs returned by the backend.
 */
export function useVideoFeed() {
  const infinite = useInfiniteQuery({
    queryKey: queryKeys.video.feed,
    queryFn: ({ pageParam }) =>
      videoApi.getFeed({ cursor: pageParam as string | undefined, limit: API_PAGE_LIMIT }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    retry: 1,
  });

  const items: VideoFeedItem[] = useMemo(
    () => infinite.data?.pages.flatMap((p) => p.items) ?? [],
    [infinite.data]
  );

  const loadMore = useCallback(() => {
    if (infinite.hasNextPage && !infinite.isFetchingNextPage) {
      infinite.fetchNextPage();
    }
  }, [infinite]);

  const refetch = useCallback(async () => {
    await infinite.refetch();
  }, [infinite]);

  const isLoading = infinite.isPending && items.length === 0;

  return {
    items,
    isLoading,
    isError: infinite.isError,
    refetch,
    loadMore,
    hasMore: Boolean(infinite.hasNextPage),
    isFetchingNextPage: infinite.isFetchingNextPage,
  };
}
