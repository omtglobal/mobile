import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '~/lib/utils/storage';

interface VideoFeedUiState {
  likedVideoIds: Record<string, boolean>;
  bookmarkedVideoIds: Record<string, boolean>;
  toggleLike: (videoId: string) => void;
  toggleBookmark: (videoId: string) => void;
  isLiked: (videoId: string) => boolean;
  isBookmarked: (videoId: string) => boolean;
}

export const useVideoFeedStore = create<VideoFeedUiState>()(
  persist(
    (set, get) => ({
      likedVideoIds: {},
      bookmarkedVideoIds: {},

      toggleLike: (videoId) =>
        set((s) => ({
          likedVideoIds: { ...s.likedVideoIds, [videoId]: !s.likedVideoIds[videoId] },
        })),

      toggleBookmark: (videoId) =>
        set((s) => ({
          bookmarkedVideoIds: { ...s.bookmarkedVideoIds, [videoId]: !s.bookmarkedVideoIds[videoId] },
        })),

      isLiked: (videoId) => !!get().likedVideoIds[videoId],
      isBookmarked: (videoId) => !!get().bookmarkedVideoIds[videoId],
    }),
    {
      name: 'video-feed-ui',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s) => ({
        likedVideoIds: s.likedVideoIds,
        bookmarkedVideoIds: s.bookmarkedVideoIds,
      }),
    }
  )
);
