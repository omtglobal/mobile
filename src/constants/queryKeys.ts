import type { ProductFilters } from '~/types/models';

export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: (filters: ProductFilters) => ['products', 'list', filters] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    featured: ['products', 'featured'] as const,
    search: (query: string) => ['products', 'search', query] as const,
  },
  categories: {
    all: ['categories'] as const,
    tree: ['categories', 'tree'] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
    products: (id: string, filters?: ProductFilters) =>
      ['categories', id, 'products', filters ?? {}] as const,
  },
  reviews: {
    byProduct: (productId: string) => ['reviews', productId] as const,
  },
  orders: {
    all: ['orders'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
  addresses: {
    all: ['addresses'] as const,
  },
  tickets: {
    all: ['tickets'] as const,
    detail: (id: string) => ['tickets', 'detail', id] as const,
  },
  home: ['home'] as const,
  user: ['user', 'me'] as const,
  video: {
    feed: ['video', 'feed'] as const,
    comments: (videoId: string) => ['video', 'comments', videoId] as const,
  },
  messaging: {
    conversations: (page?: number) => ['messaging', 'conversations', page ?? 1] as const,
    conversation: (id: string) => ['messaging', 'conversation', id] as const,
    messages: (conversationId: string, page?: number) =>
      ['messaging', 'messages', conversationId, page ?? 1] as const,
    contacts: ['messaging', 'contacts'] as const,
    contactSearch: (q: string) => ['messaging', 'contacts', 'search', q] as const,
    contactGroups: ['messaging', 'contactGroups'] as const,
    stickerPacks: ['messaging', 'stickerPacks'] as const,
    packStickers: (packId: string) => ['messaging', 'stickerPacks', packId, 'stickers'] as const,
    channels: ['messaging', 'channels'] as const,
    channel: (id: string) => ['messaging', 'channels', id] as const,
    channelPosts: (channelId: string, page?: number) =>
      ['messaging', 'channels', channelId, 'posts', page ?? 1] as const,
  },
};
