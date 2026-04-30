import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '~/types/api';
import type { VideoFeedItem, VideoMeta, VideoVariant, VideoVariantQuality } from '~/types/content';

export interface VideoFeedPage {
  items: VideoFeedItem[];
  nextCursor: string | null;
}

export interface VideoCommentDto {
  id: string;
  body: string;
  user: { id: string; name: string };
  created_at: string;
}

function mapVariant(r: Record<string, unknown>): VideoVariant {
  const mime = (r.mime_type ?? r.mimeType) as string | undefined;
  const br = r.bitrate_kbps ?? r.bitrateKbps;
  const sz = r.size_bytes ?? r.sizeBytes;
  return {
    quality: r.quality as VideoVariantQuality,
    url: String(r.url),
    ...(mime && { mimeType: mime as VideoVariant['mimeType'] }),
    ...(br != null && { bitrateKbps: Number(br) }),
    ...(r.width != null && { width: Number(r.width) }),
    ...(r.height != null && { height: Number(r.height) }),
    ...(sz != null && { sizeBytes: Number(sz) }),
  };
}

function normalizeVideoMeta(raw: unknown): VideoMeta {
  if (!raw || typeof raw !== 'object') {
    return { id: '', filename: '', url: '' };
  }
  const o = raw as Record<string, unknown>;
  const variantsRaw = o.variants;
  let variants: VideoMeta['variants'];
  if (Array.isArray(variantsRaw)) {
    variants = variantsRaw
      .filter((v) => v && typeof v === 'object')
      .map((v) => mapVariant(v as Record<string, unknown>));
  }

  const sourceType = o.source_type ?? o.sourceType;
  const hlsUrl = o.hls_url ?? o.hlsUrl;
  const posterUrl = o.poster_url ?? o.posterUrl;
  const thumbnailUrl = o.thumbnail_url ?? o.thumbnailUrl;
  const durationSec = o.duration_sec ?? o.durationSec;

  return {
    id: String(o.id ?? ''),
    filename: String(o.filename ?? ''),
    url: String(o.url ?? ''),
    ...(o.description != null && { description: String(o.description) }),
    ...(sourceType != null && { sourceType: sourceType as VideoMeta['sourceType'] }),
    ...(hlsUrl != null && { hlsUrl: String(hlsUrl) }),
    ...(posterUrl != null && { posterUrl: String(posterUrl) }),
    ...(thumbnailUrl != null && { thumbnailUrl: String(thumbnailUrl) }),
    ...(durationSec != null && { durationSec: Number(durationSec) }),
    ...(variants && { variants }),
  };
}

function normalizeFeedItem(raw: Record<string, unknown>): VideoFeedItem {
  const seller = (raw.seller as Record<string, unknown> | null) ?? {};
  return {
    id: raw.id as string,
    video: normalizeVideoMeta(raw.video),
    seller: {
      id: String(seller.id ?? ''),
      name: String(seller.name ?? ''),
      avatarUrl: (seller.avatar_url as string | undefined) ?? undefined,
    },
    product: (raw.product as VideoFeedItem['product']) ?? null,
    stats: {
      likes: Number((raw.stats as Record<string, unknown>)?.likes ?? 0),
      comments: Number((raw.stats as Record<string, unknown>)?.comments ?? 0),
      shares: Number((raw.stats as Record<string, unknown>)?.shares ?? 0),
      bookmarks: Number((raw.stats as Record<string, unknown>)?.bookmarks ?? 0),
    },
    user: raw.user
      ? {
          liked: Boolean((raw.user as Record<string, unknown>).liked),
          bookmarked: Boolean((raw.user as Record<string, unknown>).bookmarked),
        }
      : undefined,
  };
}

export const videoApi = {
  getFeed: async (params?: { cursor?: string; limit?: number }): Promise<VideoFeedPage> => {
    const res = await apiClient.get<{
      success: boolean;
      message: string;
      data: Record<string, unknown>[];
      meta: { next_cursor: string | null };
    }>('/video/feed', { params: { limit: params?.limit ?? 10, cursor: params?.cursor } });

    return {
      items: res.data.data.map(normalizeFeedItem),
      nextCursor: res.data.meta?.next_cursor ?? null,
    };
  },

  like: (videoId: string) =>
    apiClient.post<ApiResponse<{ liked: boolean; likes_count: number }>>(`/video/${videoId}/like`).then((r) => r.data),

  unlike: (videoId: string) =>
    apiClient.delete<ApiResponse<{ liked: boolean; likes_count: number }>>(`/video/${videoId}/like`).then((r) => r.data),

  bookmark: (videoId: string) =>
    apiClient
      .post<ApiResponse<{ bookmarked: boolean; bookmarks_count: number }>>(`/video/${videoId}/bookmark`)
      .then((r) => r.data),

  unbookmark: (videoId: string) =>
    apiClient
      .delete<ApiResponse<{ bookmarked: boolean; bookmarks_count: number }>>(`/video/${videoId}/bookmark`)
      .then((r) => r.data),

  recordView: (videoId: string) =>
    apiClient.post<ApiResponse<{ recorded: boolean }>>(`/video/${videoId}/view`).then((r) => r.data),

  recordShare: (videoId: string) =>
    apiClient.post<ApiResponse<{ shares_count: number }>>(`/video/${videoId}/share`).then((r) => r.data),

  getComments: (videoId: string, params?: { per_page?: number; page?: number }) =>
    apiClient
      .get<PaginatedResponse<VideoCommentDto>>(`/video/${videoId}/comments`, { params })
      .then((r) => r.data),

  postComment: (videoId: string, body: string) =>
    apiClient
      .post<ApiResponse<VideoCommentDto>>(`/video/${videoId}/comments`, { body })
      .then((r) => r.data),
};
