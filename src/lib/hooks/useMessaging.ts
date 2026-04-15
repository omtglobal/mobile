import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '~/constants/queryKeys';
import { useAuthStore } from '~/lib/stores/auth';
import * as messagingApi from '~/lib/api/messaging';
import { normalizeMessage } from '~/lib/messaging/realtimeMerge';
import type {
  Conversation,
  Message,
  Contact,
  ContactSearchResult,
  ContactGroup,
  StickerPack,
  Sticker,
  Channel,
  ChannelPost,
  MessageType,
  MessageMetadata,
} from '~/types/messaging';
import type { ApiResponse, PaginatedResponse } from '~/types/api';

// ── Helpers ────────────────────────────────────────────────────

function useMessagingAuthReady(): boolean {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const token = useAuthStore((s) => s.token);
  return isHydrated && !!token;
}

function rowsFromPaginatedBody<T>(
  res: PaginatedResponse<T> | ApiResponse<T[]>,
): T[] {
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === 'object' && 'data' in d && Array.isArray((d as Record<string, unknown>).data)) {
    return (d as unknown as { data: T[] }).data;
  }
  return [];
}

// ── Conversations ──────────────────────────────────────────────

export function useConversations(page = 1) {
  const authReady = useMessagingAuthReady();

  return useQuery<PaginatedResponse<Conversation>>({
    queryKey: queryKeys.messaging.conversations(page),
    queryFn: () => messagingApi.getConversations(page),
    enabled: authReady,
  });
}

export function useConversation(conversationId: string | undefined) {
  const authReady = useMessagingAuthReady();

  return useQuery<ApiResponse<Conversation>>({
    queryKey: queryKeys.messaging.conversation(conversationId ?? ''),
    queryFn: () => messagingApi.getConversation(conversationId!),
    enabled: authReady && !!conversationId,
  });
}

export function useMessages(conversationId: string | undefined) {
  const authReady = useMessagingAuthReady();

  return useQuery<PaginatedResponse<Message>, Error, Message[]>({
    queryKey: queryKeys.messaging.messages(conversationId ?? ''),
    queryFn: () => messagingApi.getMessages(conversationId!),
    enabled: authReady && !!conversationId,
    select: (res) => {
      const rows = rowsFromPaginatedBody(res);
      return [...rows].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    },
  });
}

// ── Mutations ──────────────────────────────────────────────────

export function useMarkReadMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      messagingApi.markConversationRead(conversationId),
    onSuccess: (_data, conversationId) => {
      void qc.invalidateQueries({
        queryKey: queryKeys.messaging.conversations().slice(0, 2),
      });
      void qc.invalidateQueries({
        queryKey: queryKeys.messaging.messages(conversationId).slice(0, 3),
      });
    },
  });
}

export function useSendMessageMutation(conversationId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      type: MessageType;
      content?: string | null;
      metadata?: MessageMetadata;
      reply_to_id?: string;
    }) => messagingApi.sendMessage(conversationId, variables),

    onMutate: async (variables) => {
      const messagesKey = queryKeys.messaging.messages(conversationId);
      await qc.cancelQueries({ queryKey: messagesKey.slice(0, 3) });

      const optimistic = normalizeMessage(
        {
          id: `optimistic-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: '__self__',
          sender_name: '',
          sender_avatar_url: null,
          type: variables.type,
          content: variables.content ?? '',
          metadata: variables.metadata ?? null,
          reply_to_id: variables.reply_to_id ?? null,
          status: 'sending',
          created_at: new Date().toISOString(),
        },
        conversationId,
      );

      const previous = qc.getQueryData<PaginatedResponse<Message>>(messagesKey);

      qc.setQueryData<PaginatedResponse<Message>>(messagesKey, (old) => {
        if (!old) return old;
        return { ...old, data: [...old.data, optimistic] };
      });

      return { previous, optimisticId: optimistic.id };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(
          queryKeys.messaging.messages(conversationId),
          context.previous,
        );
      }
    },

    onSettled: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.messaging.messages(conversationId).slice(0, 3),
      });
      void qc.invalidateQueries({
        queryKey: queryKeys.messaging.conversations().slice(0, 2),
      });
    },
  });
}

export function useCreateConversationMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (variables: {
      participant_user_id: string;
      type: 'direct';
    }) => messagingApi.createConversation(variables),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: queryKeys.messaging.conversations().slice(0, 2),
      });
    },
  });
}

// ── Contacts ───────────────────────────────────────────────────

export function useContactsQuery() {
  const authReady = useMessagingAuthReady();

  return useQuery<ApiResponse<Contact[]>, Error, Contact[]>({
    queryKey: queryKeys.messaging.contacts,
    queryFn: () => messagingApi.getContacts(),
    enabled: authReady,
    select: (res) => rowsFromPaginatedBody(res),
  });
}

export function useContactSearchQuery(q: string) {
  const authReady = useMessagingAuthReady();
  const trimmed = q.trim();

  return useQuery<ApiResponse<ContactSearchResult[]>, Error, ContactSearchResult[]>({
    queryKey: queryKeys.messaging.contactSearch(trimmed),
    queryFn: () => messagingApi.searchContacts(trimmed),
    enabled: authReady && trimmed.length >= 2,
    select: (res) => rowsFromPaginatedBody(res),
  });
}

export function useRequestContactMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (variables: { contact_user_id: string }) =>
      messagingApi.requestContact(variables),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.contacts });
    },
  });
}

export function useAcceptContactMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => messagingApi.acceptContact(contactId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.contacts });
    },
  });
}

// ── Contact Groups ──────────────────────────────────────────────

export function useContactGroupsQuery() {
  const authReady = useMessagingAuthReady();

  return useQuery<ApiResponse<ContactGroup[]>, Error, ContactGroup[]>({
    queryKey: queryKeys.messaging.contactGroups,
    queryFn: () => messagingApi.getContactGroups(),
    enabled: authReady,
    select: (res) => rowsFromPaginatedBody(res),
  });
}

export function useCreateContactGroupMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (variables: { name: string; icon?: string; order?: number }) =>
      messagingApi.createContactGroup(variables),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.contactGroups });
    },
  });
}

export function useUpdateContactGroupMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; icon?: string; order?: number }) =>
      messagingApi.updateContactGroup(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.contactGroups });
    },
  });
}

export function useDeleteContactGroupMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => messagingApi.deleteContactGroup(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.contactGroups });
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.contacts });
    },
  });
}

export function useUpdateContactMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; group_id?: string | null }) =>
      messagingApi.updateContact(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.contacts });
    },
  });
}

// ── Sticker Packs ───────────────────────────────────────────────

export function useStickerPacksQuery() {
  const authReady = useMessagingAuthReady();

  return useQuery<ApiResponse<StickerPack[]>, Error, StickerPack[]>({
    queryKey: queryKeys.messaging.stickerPacks,
    queryFn: () => messagingApi.getStickerPacks(),
    enabled: authReady,
    select: (res) => rowsFromPaginatedBody(res),
  });
}

export function usePackStickersQuery(packId: string | undefined) {
  const authReady = useMessagingAuthReady();

  return useQuery<ApiResponse<Sticker[]>, Error, Sticker[]>({
    queryKey: queryKeys.messaging.packStickers(packId ?? ''),
    queryFn: () => messagingApi.getPackStickers(packId!),
    enabled: authReady && !!packId,
    select: (res) => rowsFromPaginatedBody(res),
  });
}

export function useInstallStickerPackMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (packId: string) => messagingApi.installStickerPack(packId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.stickerPacks });
    },
  });
}

export function useUninstallStickerPackMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (packId: string) => messagingApi.uninstallStickerPack(packId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.stickerPacks });
    },
  });
}

// ── Channels ────────────────────────────────────────────────────

export function useChannelsQuery() {
  const authReady = useMessagingAuthReady();

  return useQuery<ApiResponse<Channel[]>, Error, Channel[]>({
    queryKey: queryKeys.messaging.channels,
    queryFn: () => messagingApi.getChannels(),
    enabled: authReady,
    select: (res) => rowsFromPaginatedBody(res),
  });
}

export function useChannelQuery(channelId: string | undefined) {
  const authReady = useMessagingAuthReady();

  return useQuery<ApiResponse<Channel>, Error, Channel>({
    queryKey: queryKeys.messaging.channel(channelId ?? ''),
    queryFn: () => messagingApi.getChannel(channelId!),
    enabled: authReady && !!channelId,
    select: (res) => res.data as Channel,
  });
}

export function useChannelPostsQuery(channelId: string | undefined, page = 1) {
  const authReady = useMessagingAuthReady();

  return useQuery<PaginatedResponse<ChannelPost>, Error, ChannelPost[]>({
    queryKey: queryKeys.messaging.channelPosts(channelId ?? '', page),
    queryFn: () => messagingApi.getChannelPosts(channelId!, page),
    enabled: authReady && !!channelId,
    select: (res) => rowsFromPaginatedBody(res),
  });
}

export function useCreateChannelMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (variables: { name: string; description?: string; category?: string }) =>
      messagingApi.createChannel(variables),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.channels });
    },
  });
}

export function useToggleChannelSubscriptionMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => messagingApi.toggleChannelSubscription(channelId),
    onSuccess: (_data, channelId) => {
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.channels });
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.channel(channelId) });
    },
  });
}

export function useCreateChannelPostMutation(channelId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (variables: { content: string; image_path?: string }) =>
      messagingApi.createChannelPost(channelId, variables),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.channelPosts(channelId) });
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.channel(channelId) });
    },
  });
}

export function useLikeChannelPostMutation(channelId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => messagingApi.likeChannelPost(channelId, postId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.messaging.channelPosts(channelId) });
    },
  });
}
