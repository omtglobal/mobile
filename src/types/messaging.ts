export type AccountType = 'buyer' | 'seller' | 'support';
export type ConversationType = 'direct' | 'company_support' | 'channel';
export type MessageType = 'text' | 'image' | 'video' | 'product' | 'system' | 'sticker' | 'gif';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar_url: string | null;
  account_type: AccountType;
  is_online: boolean;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participants: ConversationParticipant[];
  company?: { id: string; name: string; logo_url: string | null };
  last_message: Message | null;
  unread_count: number;
  is_pinned: boolean;
  is_muted: boolean;
  updated_at: string;
}

export interface MessageMetadata {
  image_url?: string;
  thumbnail_url?: string;
  video_url?: string;
  product_id?: string;
  product_title?: string;
  product_price?: string;
  product_image_url?: string;
  product_currency?: string;
  sticker_id?: string;
  sticker_emoji?: string;
  sticker_image_url?: string;
  gif_url?: string;
  gif_preview_url?: string;
  gif_width?: number;
  gif_height?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar_url: string | null;
  type: MessageType;
  content: string | null;
  translated_content?: string | null;
  metadata: MessageMetadata | null;
  reply_to_id: string | null;
  status: MessageStatus;
  created_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string | null;
  account_type: AccountType;
  status: 'pending' | 'accepted' | 'blocked';
  group_id: string | null;
}

export interface ContactSearchResult {
  id: string;
  name: string;
  avatar_url: string | null;
  account_type: AccountType;
  email_hint: string | null;
  phone_hint: string | null;
  is_contact: boolean;
}

export interface ContactGroup {
  id: string;
  name: string;
  icon: string | null;
  order: number;
  contacts_count: number;
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  category: string | null;
  owner_user_id: string;
  subscribers_count: number;
  posts_count: number;
  is_subscribed: boolean;
  is_owner: boolean;
  created_at: string;
}

export interface ChannelPost {
  id: string;
  content: string;
  image_url: string | null;
  views_count: number;
  likes_count: number;
  comments_count: number;
  author: { id: string; name: string };
  created_at: string;
}

export interface StickerPack {
  id: string;
  name: string;
  icon_url: string | null;
  is_default: boolean;
  is_installed: boolean;
  stickers_count: number;
}

export interface Sticker {
  id: string;
  emoji: string | null;
  image_url: string | null;
  order: number;
}
