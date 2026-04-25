import type { Product } from './models';

/** Seller row on video (from company / API). */
export interface VideoSeller {
  id: string;
  name: string;
  avatarUrl?: string;
}

export type VideoSourceType = 'platform' | 'seller' | 'user';

export type VideoVariantQuality = '480p' | '720p' | '1080p';

export interface VideoVariant {
  quality: VideoVariantQuality;
  url: string;
  mimeType?: 'application/vnd.apple.mpegurl' | 'video/mp4';
  bitrateKbps?: number;
  width?: number;
  height?: number;
  sizeBytes?: number;
}

export interface VideoMeta {
  id: string;
  filename: string;
  /** Primary remote playback URL; often same as hlsUrl when backend uses HLS. */
  url: string;
  description?: string;
  sourceType?: VideoSourceType;
  hlsUrl?: string;
  posterUrl?: string;
  thumbnailUrl?: string;
  durationSec?: number;
  /** Explicit progressive/HLS variant URLs; optional if url/hlsUrl are enough. */
  variants?: VideoVariant[];
}

export interface VideoFeedItem {
  id: string;
  video: VideoMeta;
  seller: VideoSeller;
  /** Linked product when seller attached one */
  product?: Product | null;
  stats: { likes: number; comments: number; shares: number; bookmarks: number };
  /** Present when API returns user-specific flags (authenticated). */
  user?: { liked: boolean; bookmarked: boolean };
}
