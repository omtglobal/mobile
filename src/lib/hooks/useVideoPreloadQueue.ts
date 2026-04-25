import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import type { VideoFeedItem } from '~/types/content';
import { getProgressiveUrlForFileCache, getRemotePlaybackSource, isLikelyHlsUrl } from '~/lib/video/playbackSource';
import { ensureVideoCached, getCachedLocalUri, touchCacheEntry } from '~/lib/video/videoCache';
import { analytics } from '~/lib/analytics/analyticsService';

type NetBucket = { isWifi: boolean; isCellular: boolean; expensive: boolean };

function useNetBucket(): NetBucket {
  const [bucket, setBucket] = useState<NetBucket>({
    isWifi: true,
    isCellular: false,
    expensive: false,
  });

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const t = state.type;
      const isWifi = t === 'wifi' || t === 'ethernet';
      const isCellular = t === 'cellular';
      const expensive =
        (state as { details?: { isConnectionExpensive?: boolean } }).details?.isConnectionExpensive ?? false;
      setBucket({ isWifi, isCellular, expensive });
    });
    return () => unsub();
  }, []);

  return bucket;
}

function useAppInForeground(): boolean {
  const [s, setS] = useState<AppStateStatus>(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', setS);
    return () => sub.remove();
  }, []);
  return s === 'active';
}

/**
 * Resolves `file://` for cached progressive video or remote HLS/MP4 URI.
 * Preloads adjacent items' progressive files based on network + tab state.
 */
export function useVideoPreloadQueue(
  items: VideoFeedItem[],
  activeIndex: number,
  isTabActive: boolean
) {
  const net = useNetBucket();
  const foreground = useAppInForeground();
  const canWork = isTabActive && foreground;
  const lastLoggedCache = useRef<Set<string>>(new Set());
  const [cacheVersion, setCacheVersion] = useState(0);

  const getRemoteUri = useCallback((item: VideoFeedItem) => getRemotePlaybackSource(item.video).uri, []);

  const getPlayableUri = useCallback(
    (item: VideoFeedItem) => {
      const progressive = getProgressiveUrlForFileCache(item.video, {
        preferLowerQuality: !net.isWifi,
      });
      if (progressive) {
        const local = getCachedLocalUri(item.id, progressive);
        if (local) {
          touchCacheEntry(item.id);
          if (!lastLoggedCache.current.has(`hit-${item.id}`)) {
            lastLoggedCache.current.add(`hit-${item.id}`);
            analytics.track('VideoCacheHit', { video_id: item.id });
          }
          return local;
        }
        if (!lastLoggedCache.current.has(`miss-${item.id}`)) {
          lastLoggedCache.current.add(`miss-${item.id}`);
          analytics.track('VideoCacheMiss', { video_id: item.id });
        }
      }
      return getRemoteUri(item);
    },
    [getRemoteUri, net.isWifi, cacheVersion]
  );

  const getPosterUrl = useCallback((item: VideoFeedItem) => item.video.posterUrl ?? item.video.thumbnailUrl, []);

  const formatLogged = useRef<Set<string>>(new Set());

  const preloadConfig = useMemo(() => {
    if (net.isWifi) {
      return { nextDepth: 3, prevDepth: 1, maxConcurrent: 2 };
    }
    if (net.isCellular || net.expensive) {
      return { nextDepth: 1, prevDepth: 0, maxConcurrent: 1 };
    }
    return { nextDepth: 2, prevDepth: 1, maxConcurrent: 1 };
  }, [net.isWifi, net.isCellular, net.expensive]);

  const targetIds = useMemo(() => {
    const n = items.length;
    if (n === 0) return new Set<string>();
    const s = new Set<string>();
    const addAt = (i: number) => {
      if (i < 0 || i >= n) return;
      s.add(items[i]!.id);
    };
    addAt(activeIndex);
    for (let d = 1; d <= preloadConfig.nextDepth; d++) {
      addAt(activeIndex + d);
    }
    for (let d = 1; d <= preloadConfig.prevDepth; d++) {
      addAt(activeIndex - d);
    }
    return s;
  }, [items, activeIndex, preloadConfig.nextDepth, preloadConfig.prevDepth]);

  useEffect(() => {
    if (!canWork) return;
    const jobs: { id: string; url: string; priority: number }[] = [];
    const n = items.length;
    for (let i = 0; i < n; i++) {
      if (!targetIds.has(items[i]!.id)) continue;
      const it = items[i]!;
      const dist = i - activeIndex;
      const priority =
        dist === 0
          ? 0
          : dist === 1
            ? 1
            : dist === -1
              ? 2
              : dist === 2
                ? 3
                : dist === -2
                  ? 4
                  : 5 + Math.abs(dist);
      if (i === activeIndex && !formatLogged.current.has(it.id)) {
        formatLogged.current.add(it.id);
        const r = getRemotePlaybackSource(it.video);
        analytics.track('VideoFormatDetected', {
          video_id: it.id,
          format: isLikelyHlsUrl(r.uri) ? 'hls' : 'progressive',
          playback: 'remote',
        });
      }
      const progressive = getProgressiveUrlForFileCache(it.video, { preferLowerQuality: !net.isWifi });
      if (!progressive || isLikelyHlsUrl(progressive)) {
        continue;
      }
      if (getCachedLocalUri(it.id, progressive)) {
        continue;
      }
      jobs.push({ id: it.id, url: progressive, priority });
    }
    jobs.sort((a, b) => a.priority - b.priority);

    let cancelled = false;
    const run = async () => {
      const maxC = Math.min(preloadConfig.maxConcurrent, 2);
      for (let b = 0; b < jobs.length; b += maxC) {
        if (cancelled) return;
        const batch = jobs.slice(b, b + maxC);
        await Promise.all(
          batch.map(async (j) => {
            if (cancelled) return;
            if (getCachedLocalUri(j.id, j.url)) return;
            const uri = await ensureVideoCached(j.id, j.url);
            if (uri) {
              setCacheVersion((v) => v + 1);
            }
          })
        );
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [canWork, items, activeIndex, targetIds, net.isWifi, getRemoteUri, preloadConfig.maxConcurrent]);

  return {
    getPlayableUri,
    getPosterUrl,
    getRemoteUri,
    isPreloadEnabled: canWork,
  };
}

/**
 * When near end of loaded pages, request more items so preloader has work.
 */
export function usePrefetchVideoFeedWindow(
  items: VideoFeedItem[],
  activeIndex: number,
  hasMore: boolean,
  isFetchingNextPage: boolean,
  loadMore: () => void
) {
  const lastTrigger = useRef(-1);
  useEffect(() => {
    if (!hasMore || isFetchingNextPage) return;
    if (activeIndex < 0) return;
    if (items.length - activeIndex < 5) {
      if (lastTrigger.current !== items.length) {
        lastTrigger.current = items.length;
        loadMore();
      }
    }
  }, [activeIndex, hasMore, isFetchingNextPage, items.length, loadMore]);
}
