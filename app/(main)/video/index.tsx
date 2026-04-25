import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { VideoFeedItem } from '~/components/video/VideoFeedItem';
import { VideoCommentsModal } from '~/components/video/VideoCommentsModal';
import { VideoShareSheet } from '~/components/video/VideoShareSheet';
import { useVideoFeed } from '~/lib/hooks/useVideoFeed';
import { usePrefetchVideoFeedWindow, useVideoPreloadQueue } from '~/lib/hooks/useVideoPreloadQueue';
import { videoApi } from '~/lib/api/video';
import { patchVideoFeedItemInCache } from '~/lib/utils/videoFeedQuery';
import { useQueryClient } from '@tanstack/react-query';
import type { VideoFeedItem as VideoFeedItemType } from '~/types/content';

type Props = {
  /** When false (e.g. user on Sales/Messenger tab), feed must not autoplay. */
  isTabActive: boolean;
};

export default function VideoFeedScreen({ isTabActive }: Props) {
  const { t } = useTranslation();
  const {
    items,
    loadMore,
    isLoading,
    refetch,
    isFetchingNextPage,
    hasMore,
  } = useVideoFeed();
  const [pageHeight, setPageHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentsVideoId, setCommentsVideoId] = useState<string | null>(null);
  const [shareVideoId, setShareVideoId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { getPlayableUri, getPosterUrl } = useVideoPreloadQueue(items, activeIndex, isTabActive);
  usePrefetchVideoFeedWindow(items, activeIndex, hasMore, isFetchingNextPage, loadMore);

  const shareItem = useMemo(
    () => (shareVideoId ? items.find((i) => i.id === shareVideoId) : null),
    [items, shareVideoId]
  );

  const handleShareRecorded = useCallback(() => {
    if (!shareVideoId) return;
    videoApi.recordShare(shareVideoId).then((res) => {
      if (res?.data?.shares_count != null) {
        patchVideoFeedItemInCache(queryClient, shareVideoId, (prev: VideoFeedItemType) => ({
          ...prev,
          stats: { ...prev.stats, shares: res.data.shares_count },
        }));
      }
    }).catch(() => {});
  }, [shareVideoId, queryClient]);

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 50 },
      onViewableItemsChanged: ({ viewableItems }: { viewableItems: ViewToken<VideoFeedItemType>[] }) => {
        const first = viewableItems[0];
        if (first?.index != null) {
          setActiveIndex(first.index);
        }
      },
    },
  ]).current;

  const handleEndReached = useCallback(() => {
    if (hasMore) {
      loadMore();
    }
  }, [hasMore, loadMore]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const shouldMountPlayer = useCallback(
    (index: number) => {
      if (!isTabActive) return false;
      const d = index - activeIndex;
      return d >= -1 && d <= 2;
    },
    [activeIndex, isTabActive]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: VideoFeedItemType; index: number }) => {
      return (
        <VideoFeedItem
          item={item}
          isActive={isTabActive && index === activeIndex}
          shouldPreload={shouldMountPlayer(index)}
          playableUri={getPlayableUri(item)}
          posterUrl={getPosterUrl(item)}
          height={pageHeight}
          onOpenComments={setCommentsVideoId}
          onOpenShare={setShareVideoId}
        />
      );
    },
    [activeIndex, getPlayableUri, getPosterUrl, isTabActive, pageHeight, shouldMountPlayer]
  );

  const keyExtractor = useCallback((i: VideoFeedItemType) => i.id, []);

  const listFooter = useMemo(
    () =>
      isFetchingNextPage ? (
        <View style={{ height: 56, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : null,
    [isFetchingNextPage]
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: '#000' }}
      onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}
    >
      {pageHeight > 0 ? (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={pageHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: pageHeight,
            offset: pageHeight * index,
            index,
          })}
          viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          initialNumToRender={3}
          maxToRenderPerBatch={2}
          windowSize={5}
          removeClippedSubviews
          ListFooterComponent={listFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" titleColor="#fff" />
          }
          ListEmptyComponent={
            isLoading ? (
              <View style={{ height: pageHeight, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="#fff" size="large" />
              </View>
            ) : (
              <View style={{ height: pageHeight, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                  {t('video.empty_feed')}
                </Text>
              </View>
            )
          }
        />
      ) : null}

      <VideoCommentsModal
        videoId={commentsVideoId}
        onClose={() => setCommentsVideoId(null)}
      />

      <VideoShareSheet
        visible={shareVideoId != null}
        onClose={() => setShareVideoId(null)}
        videoId={shareItem?.id ?? ''}
        videoFilename={shareItem?.video.filename ?? ''}
        sellerName={shareItem?.seller.name ?? ''}
        onShareRecorded={handleShareRecorded}
      />
    </View>
  );
}
