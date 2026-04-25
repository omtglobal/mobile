import * as FileSystem from 'expo-file-system/legacy';
import { mmkv } from '~/lib/utils/storage';
import { analytics } from '~/lib/analytics/analyticsService';

const MANIFEST_KEY = 'video_feed_cache_v1';
const CACHE_DIR_NAME = 'video-feed';

/** Default ~400MB or 12 entries, 36h TTL */
const MAX_BYTES = 400 * 1024 * 1024;
const MAX_ITEMS = 12;
const TTL_MS = 36 * 60 * 60 * 1000;

export interface VideoCacheEntry {
  videoId: string;
  sourceUrl: string;
  localUri: string;
  bytes: number;
  createdAt: number;
  lastAccessedAt: number;
  expiresAt: number;
}

interface Manifest {
  entries: Record<string, VideoCacheEntry>;
}

function loadManifest(): Manifest {
  try {
    const raw = mmkv.getString(MANIFEST_KEY);
    if (!raw) return { entries: {} };
    const p = JSON.parse(raw) as Manifest;
    return p?.entries ? p : { entries: {} };
  } catch {
    return { entries: {} };
  }
}

function saveManifest(m: Manifest): void {
  mmkv.set(MANIFEST_KEY, JSON.stringify(m));
}

function cacheDir(): string {
  const base = FileSystem.cacheDirectory;
  if (!base) return '';
  return `${base}${CACHE_DIR_NAME}/`;
}

function urlHash(url: string): string {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

export async function ensureVideoCacheDir(): Promise<string> {
  const dir = cacheDir();
  if (!dir) return '';
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

export function getCachedLocalUri(videoId: string, sourceUrl: string): string | null {
  if (!videoId || !sourceUrl) return null;
  const m = loadManifest();
  const e = m.entries[videoId];
  if (!e || e.sourceUrl !== sourceUrl) return null;
  if (Date.now() > e.expiresAt) return null;
  return e.localUri;
}

export function touchCacheEntry(videoId: string): void {
  const m = loadManifest();
  const e = m.entries[videoId];
  if (!e) return;
  e.lastAccessedAt = Date.now();
  m.entries[videoId] = e;
  saveManifest(m);
}

async function removeEntryFile(e: VideoCacheEntry): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(e.localUri);
    if (info.exists) {
      await FileSystem.deleteAsync(e.localUri, { idempotent: true });
    }
  } catch {
    // ignore
  }
}

export async function evictIfNeeded(): Promise<void> {
  const m = loadManifest();
  const now = Date.now();

  const evictOne = async (e: VideoCacheEntry) => {
    delete m.entries[e.videoId];
    await removeEntryFile(e);
    analytics.track('VideoCacheEviction', {
      video_id: e.videoId,
      bytes: e.bytes,
    });
  };

  for (const e of Object.values({ ...m.entries })) {
    if (e.expiresAt < now) {
      await evictOne(e);
    }
  }

  const countOver = () => Object.keys(m.entries).length;
  const totalBytes = () => Object.values(m.entries).reduce((s, x) => s + x.bytes, 0);

  const pickLru = (): VideoCacheEntry | null => {
    const vals = Object.values(m.entries);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => (a.lastAccessedAt <= b.lastAccessedAt ? a : b));
  };

  while (countOver() > MAX_ITEMS) {
    const victim = pickLru();
    if (!victim) break;
    await evictOne(victim);
  }

  while (totalBytes() > MAX_BYTES && countOver() > 0) {
    const victim = pickLru();
    if (!victim) break;
    await evictOne(victim);
  }

  saveManifest(m);
}

export async function clearVideoCache(): Promise<void> {
  const m = loadManifest();
  for (const e of Object.values(m.entries)) {
    await removeEntryFile(e);
  }
  saveManifest({ entries: {} });
}

export async function getVideoCacheTotalBytesAsync(): Promise<number> {
  const m = loadManifest();
  return Object.values(m.entries).reduce((s, e) => s + e.bytes, 0);
}

const inflight = new Map<string, Promise<string | null>>();

/**
 * Download progressive video to cache. Returns file:// uri or null on skip/fail.
 * Skips if URL is HLS (caller should not pass those).
 */
export function ensureVideoCached(
  videoId: string,
  sourceUrl: string
): Promise<string | null> {
  if (!videoId || !sourceUrl) return Promise.resolve(null);

  const existing = getCachedLocalUri(videoId, sourceUrl);
  if (existing) {
    touchCacheEntry(videoId);
    return Promise.resolve(existing);
  }

  const k = videoId;
  const prev = inflight.get(k);
  if (prev) return prev;

  const p = (async () => {
    const dir = await ensureVideoCacheDir();
    if (!dir) return null;

    const localFile = `${dir}${videoId}-${urlHash(sourceUrl)}.mp4`;
    try {
      await evictIfNeeded();

      const result = await FileSystem.downloadAsync(sourceUrl, localFile);
      if (result.status !== 200) {
        analytics.track('VideoDownloadFailed', {
          video_id: videoId,
          status: result.status,
        });
        try {
          await FileSystem.deleteAsync(localFile, { idempotent: true });
        } catch {
          // ignore
        }
        return null;
      }

      const info = await FileSystem.getInfoAsync(result.uri);
      const size = (info as { size?: number }).size ?? 0;
      const now = Date.now();
      const m = loadManifest();
      const old = m.entries[videoId];
      if (old && old.localUri !== result.uri) {
        await removeEntryFile(old);
      }
      m.entries[videoId] = {
        videoId,
        sourceUrl,
        localUri: result.uri,
        bytes: size,
        createdAt: now,
        lastAccessedAt: now,
        expiresAt: now + TTL_MS,
      };
      saveManifest(m);
      await evictIfNeeded();
      return result.uri;
    } catch {
      analytics.track('VideoDownloadFailed', { video_id: videoId, error: 'exception' });
      try {
        await FileSystem.deleteAsync(localFile, { idempotent: true });
      } catch {
        // ignore
      }
      return null;
    } finally {
      inflight.delete(k);
    }
  })();

  inflight.set(k, p);
  return p;
}

export function getVideoCacheStateForId(videoId: string): 'cached' | 'none' {
  const m = loadManifest();
  return m.entries[videoId] ? 'cached' : 'none';
}
