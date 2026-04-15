import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '~/constants/queryKeys';
import type {
  Message,
  Conversation,
  MessageStatus,
  MessageType,
  ConversationParticipant,
  ConversationType,
} from '~/types/messaging';
import type { PaginatedResponse } from '~/types/api';

// ── Normalizers ────────────────────────────────────────────────

export function normalizeMessage(
  raw: Record<string, unknown>,
  fallbackConversationId?: string,
): Message {
  return {
    id: String(raw.id ?? ''),
    conversation_id: String(raw.conversation_id ?? fallbackConversationId ?? ''),
    sender_id: String(raw.sender_id ?? ''),
    sender_name: String(raw.sender_name ?? ''),
    sender_avatar_url: (raw.sender_avatar_url as string | null) ?? null,
    type: (raw.type as MessageType) ?? 'text',
    content:
      raw.content === null || raw.content === undefined
        ? null
        : String(raw.content),
    metadata: (raw.metadata as Message['metadata']) ?? null,
    reply_to_id: (raw.reply_to_id as string | null) ?? null,
    status: (raw.status as Message['status']) ?? 'sent',
    created_at: String(raw.created_at ?? new Date().toISOString()),
    translated_content: (raw.translated_content as string | null) ?? null,
  };
}

export function normalizeConversation(
  raw: Record<string, unknown>,
): Conversation {
  const participants = Array.isArray(raw.participants)
    ? (raw.participants as ConversationParticipant[])
    : [];

  const lastMsg = raw.last_message
    ? normalizeMessage(raw.last_message as Record<string, unknown>)
    : null;

  return {
    id: String(raw.id ?? ''),
    type: (raw.type as ConversationType) ?? 'direct',
    participants,
    company: (raw.company as Conversation['company']) ?? undefined,
    last_message: lastMsg,
    unread_count: Number(raw.unread_count ?? 0),
    is_pinned: Boolean(raw.is_pinned ?? false),
    is_muted: Boolean(raw.is_muted ?? false),
    updated_at: String(raw.updated_at ?? new Date().toISOString()),
  };
}

// ── Cache Mergers ──────────────────────────────────────────────

export function mergeIncomingMessage(
  qc: QueryClient,
  conversationId: string,
  payload: Record<string, unknown>,
): void {
  const message = normalizeMessage(payload, conversationId);

  // 1. Append to messages cache (all pages)
  qc.setQueriesData<PaginatedResponse<Message>>(
    { queryKey: queryKeys.messaging.messages(conversationId).slice(0, 3) },
    (old) => {
      if (!old) return old;
      const exists = old.data.some((m) => m.id === message.id);
      if (exists) return old;
      return { ...old, data: [...old.data, message] };
    },
  );

  // 2. Update conversation's last_message and bump to top of every list page
  qc.setQueriesData<PaginatedResponse<Conversation>>(
    { queryKey: queryKeys.messaging.conversations().slice(0, 2) },
    (old) => {
      if (!old) return old;

      const idx = old.data.findIndex((c) => c.id === conversationId);

      if (idx >= 0) {
        const conv = old.data[idx];
        const updated: Conversation = {
          ...conv,
          last_message: message,
          unread_count: conv.unread_count + 1,
          updated_at: message.created_at,
        };
        const rest = old.data.filter((_, i) => i !== idx);
        return { ...old, data: [updated, ...rest] };
      }

      return old;
    },
  );

  // 3. Update single conversation cache
  qc.setQueryData(
    queryKeys.messaging.conversation(conversationId),
    (old: { data: Conversation } | undefined) => {
      if (!old) return old;
      return {
        ...old,
        data: {
          ...old.data,
          last_message: message,
          unread_count: old.data.unread_count + 1,
          updated_at: message.created_at,
        },
      };
    },
  );
}

export function patchMessageStatusInCaches(
  qc: QueryClient,
  messageId: string,
  status: MessageStatus,
): void {
  // Patch across all message query caches
  qc.setQueriesData<PaginatedResponse<Message>>(
    { queryKey: ['messaging', 'messages'] },
    (old) => {
      if (!old) return old;

      let changed = false;
      const data = old.data.map((m) => {
        if (m.id === messageId) {
          changed = true;
          return { ...m, status };
        }
        return m;
      });

      return changed ? { ...old, data } : old;
    },
  );

  // Patch last_message in conversation lists
  qc.setQueriesData<PaginatedResponse<Conversation>>(
    { queryKey: queryKeys.messaging.conversations().slice(0, 2) },
    (old) => {
      if (!old) return old;

      let changed = false;
      const data = old.data.map((c) => {
        if (c.last_message?.id === messageId) {
          changed = true;
          return { ...c, last_message: { ...c.last_message, status } };
        }
        return c;
      });

      return changed ? { ...old, data } : old;
    },
  );
}

export function patchMessageTranslationInCaches(
  qc: QueryClient,
  messageId: string,
  translatedContent: string,
): void {
  qc.setQueriesData<PaginatedResponse<Message>>(
    { queryKey: ['messaging', 'messages'] },
    (old) => {
      if (!old) return old;

      let changed = false;
      const data = old.data.map((m) => {
        if (m.id === messageId) {
          changed = true;
          return { ...m, translated_content: translatedContent };
        }
        return m;
      });

      return changed ? { ...old, data } : old;
    },
  );

  qc.setQueriesData<PaginatedResponse<Conversation>>(
    { queryKey: queryKeys.messaging.conversations().slice(0, 2) },
    (old) => {
      if (!old) return old;

      let changed = false;
      const data = old.data.map((c) => {
        if (c.last_message?.id === messageId) {
          changed = true;
          return {
            ...c,
            last_message: { ...c.last_message, translated_content: translatedContent },
          };
        }
        return c;
      });

      return changed ? { ...old, data } : old;
    },
  );
}
