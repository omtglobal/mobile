import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '~/types/api';
import type {
  Conversation,
  Message,
  Contact,
  ContactSearchResult,
  ContactGroup,
  Channel,
  ChannelPost,
  StickerPack,
  Sticker,
  MessageType,
  MessageMetadata,
} from '~/types/messaging';

const PREFIX = '/messaging';

// ── Conversations ──────────────────────────────────────────────

export function getConversations(
  page = 1,
): Promise<PaginatedResponse<Conversation>> {
  return apiClient
    .get(`${PREFIX}/conversations`, { params: { page } })
    .then((r) => r.data);
}

export function getConversation(
  id: string,
): Promise<ApiResponse<Conversation>> {
  return apiClient.get(`${PREFIX}/conversations/${id}`).then((r) => r.data);
}

export function createConversation(body: {
  participant_user_id: string;
  type: 'direct';
}): Promise<ApiResponse<Conversation>> {
  return apiClient.post(`${PREFIX}/conversations`, body).then((r) => r.data);
}

export function markConversationRead(
  conversationId: string,
): Promise<ApiResponse<null>> {
  return apiClient
    .post(`${PREFIX}/conversations/${conversationId}/read`)
    .then((r) => r.data);
}

export function updateParticipant(
  conversationId: string,
  body: { is_pinned?: boolean; is_muted?: boolean },
): Promise<ApiResponse<Conversation>> {
  return apiClient
    .patch(`${PREFIX}/conversations/${conversationId}/participant`, body)
    .then((r) => r.data);
}

// ── Messages ───────────────────────────────────────────────────

export function getMessages(
  conversationId: string,
  page = 1,
): Promise<PaginatedResponse<Message>> {
  return apiClient
    .get(`${PREFIX}/conversations/${conversationId}/messages`, {
      params: { page },
    })
    .then((r) => r.data);
}

export function sendMessage(
  conversationId: string,
  body: {
    type: MessageType;
    content?: string | null;
    metadata?: MessageMetadata;
    reply_to_id?: string;
  },
): Promise<ApiResponse<Message>> {
  return apiClient
    .post(`${PREFIX}/conversations/${conversationId}/messages`, body)
    .then((r) => r.data);
}

// ── Contacts ───────────────────────────────────────────────────

export function getContacts(): Promise<ApiResponse<Contact[]>> {
  return apiClient.get(`${PREFIX}/contacts`).then((r) => r.data);
}

export function searchContacts(
  q: string,
): Promise<ApiResponse<ContactSearchResult[]>> {
  return apiClient
    .get(`${PREFIX}/contacts/search`, { params: { q } })
    .then((r) => r.data);
}

export function requestContact(body: {
  contact_user_id: string;
}): Promise<ApiResponse<Contact>> {
  return apiClient.post(`${PREFIX}/contacts`, body).then((r) => r.data);
}

export function acceptContact(
  contactId: string,
): Promise<ApiResponse<Contact>> {
  return apiClient
    .post(`${PREFIX}/contacts/${contactId}/accept`)
    .then((r) => r.data);
}

export function blockContact(
  contactId: string,
): Promise<ApiResponse<Contact>> {
  return apiClient
    .post(`${PREFIX}/contacts/${contactId}/block`)
    .then((r) => r.data);
}

export function deleteContact(
  contactId: string,
): Promise<ApiResponse<null>> {
  return apiClient
    .delete(`${PREFIX}/contacts/${contactId}`)
    .then((r) => r.data);
}

// ── Media ──────────────────────────────────────────────────────

export function getPresignedUploadUrl(body: {
  filename: string;
  mime_type: string;
  content_length?: number;
}): Promise<
  ApiResponse<{ path: string; upload_url: string; expires_at: string }>
> {
  return apiClient
    .post(`${PREFIX}/media/presign`, body)
    .then((r) => r.data);
}

export function getMediaAccessUrl(body: {
  path: string;
}): Promise<ApiResponse<{ url: string }>> {
  return apiClient
    .post(`${PREFIX}/media/access-url`, body)
    .then((r) => r.data);
}

// ── Contact Groups ──────────────────────────────────────────────

export function getContactGroups(): Promise<ApiResponse<ContactGroup[]>> {
  return apiClient.get(`${PREFIX}/contact-groups`).then((r) => r.data);
}

export function createContactGroup(body: {
  name: string;
  icon?: string;
  order?: number;
}): Promise<ApiResponse<ContactGroup>> {
  return apiClient.post(`${PREFIX}/contact-groups`, body).then((r) => r.data);
}

export function updateContactGroup(
  id: string,
  body: { name?: string; icon?: string; order?: number },
): Promise<ApiResponse<ContactGroup>> {
  return apiClient.patch(`${PREFIX}/contact-groups/${id}`, body).then((r) => r.data);
}

export function deleteContactGroup(id: string): Promise<ApiResponse<null>> {
  return apiClient.delete(`${PREFIX}/contact-groups/${id}`).then((r) => r.data);
}

export function updateContact(
  id: string,
  body: { group_id?: string | null },
): Promise<ApiResponse<Contact>> {
  return apiClient.patch(`${PREFIX}/contacts/${id}`, body).then((r) => r.data);
}

// ── Channels ────────────────────────────────────────────────────

export function getChannels(): Promise<ApiResponse<Channel[]>> {
  return apiClient.get(`${PREFIX}/channels`).then((r) => r.data);
}

export function createChannel(body: {
  name: string;
  description?: string;
  category?: string;
}): Promise<ApiResponse<Channel>> {
  return apiClient.post(`${PREFIX}/channels`, body).then((r) => r.data);
}

export function getChannel(id: string): Promise<ApiResponse<Channel>> {
  return apiClient.get(`${PREFIX}/channels/${id}`).then((r) => r.data);
}

export function updateChannel(
  id: string,
  body: { name?: string; description?: string; category?: string },
): Promise<ApiResponse<Channel>> {
  return apiClient.patch(`${PREFIX}/channels/${id}`, body).then((r) => r.data);
}

export function deleteChannel(id: string): Promise<ApiResponse<null>> {
  return apiClient.delete(`${PREFIX}/channels/${id}`).then((r) => r.data);
}

export function toggleChannelSubscription(
  id: string,
): Promise<ApiResponse<{ subscribed: boolean }>> {
  return apiClient.post(`${PREFIX}/channels/${id}/subscribe`).then((r) => r.data);
}

export function getChannelPosts(
  channelId: string,
  page = 1,
): Promise<PaginatedResponse<ChannelPost>> {
  return apiClient
    .get(`${PREFIX}/channels/${channelId}/posts`, { params: { page } })
    .then((r) => r.data);
}

export function createChannelPost(
  channelId: string,
  body: { content: string; image_path?: string },
): Promise<ApiResponse<ChannelPost>> {
  return apiClient
    .post(`${PREFIX}/channels/${channelId}/posts`, body)
    .then((r) => r.data);
}

export function likeChannelPost(
  channelId: string,
  postId: string,
): Promise<ApiResponse<ChannelPost>> {
  return apiClient
    .post(`${PREFIX}/channels/${channelId}/posts/${postId}/like`)
    .then((r) => r.data);
}

// ── Stickers ────────────────────────────────────────────────────

export function getStickerPacks(): Promise<ApiResponse<StickerPack[]>> {
  return apiClient.get(`${PREFIX}/stickers/packs`).then((r) => r.data);
}

export function getPackStickers(
  packId: string,
): Promise<ApiResponse<Sticker[]>> {
  return apiClient.get(`${PREFIX}/stickers/packs/${packId}`).then((r) => r.data);
}

export function installStickerPack(
  packId: string,
): Promise<ApiResponse<null>> {
  return apiClient.post(`${PREFIX}/stickers/packs/${packId}/install`).then((r) => r.data);
}

export function uninstallStickerPack(
  packId: string,
): Promise<ApiResponse<null>> {
  return apiClient.delete(`${PREFIX}/stickers/packs/${packId}/install`).then((r) => r.data);
}
