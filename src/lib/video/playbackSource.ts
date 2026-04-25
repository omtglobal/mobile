import type { VideoMeta } from '~/types/content';

/**
 * HLS / adaptive streams should not be fully downloaded in JS; native player + CDN handle buffering.
 */
export function isLikelyHlsUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes('.m3u8') || u.includes('application/vnd.apple.mpegurl') || u.includes('mpegurl');
}

export function detectVideoFormatForAnalytics(url: string): 'hls' | 'progressive' | 'unknown' {
  if (isLikelyHlsUrl(url)) return 'hls';
  if (/\.(mp4|m4v|webm|mov)(\?|$)/i.test(url)) return 'progressive';
  return 'unknown';
}

/**
 * Remote URI actually passed to the player. Prefer HLS when provided (adaptive).
 */
export function getRemotePlaybackSource(video: VideoMeta): { uri: string; format: 'hls' | 'progressive' } {
  const hls = video.hlsUrl?.trim();
  if (hls) {
    return { uri: hls, format: isLikelyHlsUrl(hls) ? 'hls' : 'progressive' };
  }
  const main = video.url?.trim() ?? '';
  return {
    uri: main,
    format: isLikelyHlsUrl(main) ? 'hls' : 'progressive',
  };
}

/**
 * Single URL we may pre-download to disk (progressive only). Picks 480p on cellular if listed.
 */
export function getProgressiveUrlForFileCache(
  video: VideoMeta,
  options: { preferLowerQuality: boolean }
): string | null {
  if (options.preferLowerQuality && video.variants?.length) {
    const v480 = video.variants.find((v) => v.quality === '480p' && v.mimeType !== 'application/vnd.apple.mpegurl');
    if (v480?.url) return v480.url;
  }
  const { uri, format } = getRemotePlaybackSource(video);
  if (format === 'hls' || isLikelyHlsUrl(uri)) {
    return null;
  }
  return uri;
}
