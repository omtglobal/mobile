import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import { queryKeys } from '~/constants/queryKeys';
import type { VideoFeedItem } from '~/types/content';
import type { VideoFeedPage } from '~/lib/api/video';

export function patchVideoFeedItemInCache(
  queryClient: QueryClient,
  videoId: string,
  updater: (item: VideoFeedItem) => VideoFeedItem
): void {
  queryClient.setQueryData<InfiniteData<VideoFeedPage>>(queryKeys.video.feed, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((item) => (item.id === videoId ? updater(item) : item)),
      })),
    };
  });
}
