import type { Product } from './models';

/** Seller row on video (from company / API). */
export interface VideoSeller {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface VideoMeta {
  id: string;
  filename: string;
  url: string;
  description?: string;
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
