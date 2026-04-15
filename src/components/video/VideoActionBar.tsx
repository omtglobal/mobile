import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { Text } from '~/components/ui/Text';
import { useToast } from '~/components/ui/Toast';
import { queryKeys } from '~/constants/queryKeys';
import { useAuth } from '~/lib/hooks/useAuth';
import { videoApi } from '~/lib/api/video';
import { useVideoFeedStore } from '~/lib/stores/videoFeed';
import { patchVideoFeedItemInCache } from '~/lib/utils/videoFeedQuery';
import type { VideoFeedItem, VideoSeller } from '~/types/content';

type Props = {
  item: VideoFeedItem;
  seller: VideoSeller;
  onOpenComments?: () => void;
  onOpenShare?: () => void;
  onSellerPress?: () => void;
};

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function VideoActionBar({ item, seller, onOpenComments, onOpenShare, onSellerPress }: Props) {
  const toast = useToast();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const toggleLikeLocal = useVideoFeedStore((s) => s.toggleLike);
  const toggleBookmarkLocal = useVideoFeedStore((s) => s.toggleBookmark);
  const isLikedLocal = useVideoFeedStore((s) => s.isLiked(item.id));
  const isBookmarkedLocal = useVideoFeedStore((s) => s.isBookmarked(item.id));

  const hasServerUser = item.user != null;
  const liked = hasServerUser ? item.user!.liked : isLikedLocal;
  const bookmarked = hasServerUser ? item.user!.bookmarked : isBookmarkedLocal;

  const likeDisplay = hasServerUser
    ? item.stats.likes
    : item.stats.likes + (isLikedLocal ? 1 : 0);

  const patchItem = useCallback(
    (updater: (prev: VideoFeedItem) => VideoFeedItem) => {
      patchVideoFeedItemInCache(queryClient, item.id, updater);
    },
    [queryClient, item.id]
  );

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (liked) {
        return videoApi.unlike(item.id);
      }
      return videoApi.like(item.id);
    },
    onMutate: async () => {
      if (!hasServerUser) return;
      const nextLiked = !liked;
      const delta = nextLiked ? 1 : -1;
      patchItem((prev) => ({
        ...prev,
        user: { ...prev.user!, liked: nextLiked },
        stats: { ...prev.stats, likes: Math.max(0, prev.stats.likes + delta) },
      }));
    },
    onError: () => {
      toast.show('Could not update like. Sign in and try again.', 'error');
      queryClient.invalidateQueries({ queryKey: queryKeys.video.feed });
    },
    onSuccess: (res) => {
      if (hasServerUser && res?.data) {
        patchItem((prev) => ({
          ...prev,
          user: { ...prev.user!, liked: res.data.liked },
          stats: { ...prev.stats, likes: res.data.likes_count },
        }));
      }
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (bookmarked) {
        return videoApi.unbookmark(item.id);
      }
      return videoApi.bookmark(item.id);
    },
    onMutate: async () => {
      if (!hasServerUser) return;
      const next = !bookmarked;
      const delta = next ? 1 : -1;
      patchItem((prev) => ({
        ...prev,
        user: { ...prev.user!, bookmarked: next },
        stats: { ...prev.stats, bookmarks: Math.max(0, prev.stats.bookmarks + delta) },
      }));
    },
    onError: () => {
      toast.show('Could not update bookmark.', 'error');
      queryClient.invalidateQueries({ queryKey: queryKeys.video.feed });
    },
    onSuccess: (res) => {
      if (hasServerUser && res?.data) {
        patchItem((prev) => ({
          ...prev,
          user: { ...prev.user!, bookmarked: res.data.bookmarked },
          stats: { ...prev.stats, bookmarks: res.data.bookmarks_count },
        }));
      }
    },
  });

  const onLike = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    if (!hasServerUser) {
      toggleLikeLocal(item.id);
      return;
    }
    likeMutation.mutate();
  }, [hasServerUser, isAuthenticated, item.id, likeMutation, router, toggleLikeLocal]);

  const onBookmark = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    if (!hasServerUser) {
      toggleBookmarkLocal(item.id);
      return;
    }
    bookmarkMutation.mutate();
  }, [bookmarkMutation, hasServerUser, isAuthenticated, item.id, router, toggleBookmarkLocal]);

  const onShare = useCallback(() => {
    onOpenShare?.();
  }, [onOpenShare]);

  const iconColor = '#FFFFFF';
  const dimmed = 'rgba(255,255,255,0.85)';

  return (
    <View style={{ alignItems: 'center', gap: 18 }}>
      {/* Seller avatar */}
      <Pressable
        onPress={onSellerPress}
        style={{ alignItems: 'center', marginBottom: 2 }}
        accessibilityRole="button"
        accessibilityLabel={`Seller ${seller.name}`}
      >
        {seller.avatarUrl ? (
          <Image
            source={{ uri: seller.avatarUrl }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.9)',
            }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(255,255,255,0.25)',
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.9)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="headingSm" style={{ color: '#FFFFFF' }}>
              {seller.name.trim().charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={onLike}
        style={{ alignItems: 'center' }}
        accessibilityRole="button"
        accessibilityLabel="Like"
      >
        <Heart
          size={32}
          color={liked ? '#FF3B5C' : iconColor}
          fill={liked ? '#FF3B5C' : 'transparent'}
          strokeWidth={2}
        />
        <Text variant="caption" style={{ color: dimmed, marginTop: 4 }}>
          {formatCompact(likeDisplay)}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onOpenComments?.()}
        style={{ alignItems: 'center' }}
        accessibilityRole="button"
        accessibilityLabel="Comments"
      >
        <MessageCircle size={30} color={iconColor} strokeWidth={2} />
        <Text variant="caption" style={{ color: dimmed, marginTop: 4 }}>
          {formatCompact(item.stats.comments)}
        </Text>
      </Pressable>

      <Pressable
        onPress={onShare}
        style={{ alignItems: 'center' }}
        accessibilityRole="button"
        accessibilityLabel="Share"
      >
        <Share2 size={28} color={iconColor} strokeWidth={2} />
        <Text variant="caption" style={{ color: dimmed, marginTop: 4 }}>
          {formatCompact(item.stats.shares)}
        </Text>
      </Pressable>

      <Pressable
        onPress={onBookmark}
        style={{ alignItems: 'center' }}
        accessibilityRole="button"
        accessibilityLabel="Bookmark"
      >
        <Bookmark
          size={30}
          color={iconColor}
          fill={bookmarked ? iconColor : 'transparent'}
          strokeWidth={2}
        />
      </Pressable>
    </View>
  );
}
