import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '~/types/api';
import type { VideoFeedItem } from '~/types/content';

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

function normalizeFeedItem(raw: Record<string, unknown>): VideoFeedItem {
  const seller = raw.seller as Record<string, unknown>;
  return {
    id: raw.id as string,
    video: raw.video as VideoFeedItem['video'],
    seller: {
      id: seller.id as string,
      name: seller.name as string,
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
