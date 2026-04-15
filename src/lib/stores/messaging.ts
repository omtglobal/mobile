import { create } from 'zustand';
import { getQueryClient } from '~/lib/api/queryClientRef';
import { mergeIncomingMessage, patchMessageStatusInCaches, patchMessageTranslationInCaches } from '~/lib/messaging/realtimeMerge';
import type { MessageStatus } from '~/types/messaging';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface TypingTimer {
  timer: ReturnType<typeof setTimeout>;
}

interface MessagingState {
  connection: ConnectionStatus;
  typingMap: Record<string, string[]>;

  setConnection: (status: ConnectionStatus) => void;
  setTyping: (conversationId: string, userName: string, isTyping: boolean) => void;
  handleRealtimePayload: (data: unknown) => void;
}

const TYPING_TIMEOUT_MS = 5_000;

/** Stable empty list for selectors — `?? []` breaks useSyncExternalStore (new ref each snapshot). */
export const EMPTY_TYPING_NAMES: string[] = [];

const typingTimers = new Map<string, TypingTimer>();

function typingKey(conversationId: string, userName: string): string {
  return `${conversationId}::${userName}`;
}

export const useMessagingStore = create<MessagingState>()((set, get) => ({
  connection: 'disconnected',
  typingMap: {},

  setConnection: (status) => set({ connection: status }),

  setTyping: (conversationId, userName, isTyping) => {
    const key = typingKey(conversationId, userName);

    const existing = typingTimers.get(key);
    if (existing) {
      clearTimeout(existing.timer);
      typingTimers.delete(key);
    }

    if (isTyping) {
      const timer = setTimeout(() => {
        typingTimers.delete(key);
        get().setTyping(conversationId, userName, false);
      }, TYPING_TIMEOUT_MS);

      typingTimers.set(key, { timer });

      set((state) => {
        const current = state.typingMap[conversationId] ?? [];
        if (current.includes(userName)) return state;
        return {
          typingMap: {
            ...state.typingMap,
            [conversationId]: [...current, userName],
          },
        };
      });
    } else {
      set((state) => {
        const current = state.typingMap[conversationId] ?? [];
        const next = current.filter((n) => n !== userName);
        if (next.length === current.length) return state;
        const updated = { ...state.typingMap };
        if (next.length === 0) {
          delete updated[conversationId];
        } else {
          updated[conversationId] = next;
        }
        return { typingMap: updated };
      });
    }
  },

  handleRealtimePayload: (data) => {
    if (!data || typeof data !== 'object') return;

    const payload = data as Record<string, unknown>;
    const event = payload.event as string | undefined;
    if (!event) return;

    const qc = getQueryClient();

    switch (event) {
      case 'message.new': {
        const conversationId = payload.conversation_id as string | undefined;
        if (qc && conversationId) {
          mergeIncomingMessage(qc, conversationId, payload);
        }
        break;
      }

      case 'message.status': {
        const messageId = payload.message_id as string | undefined;
        const status = payload.status as MessageStatus | undefined;
        if (qc && messageId && status) {
          patchMessageStatusInCaches(qc, messageId, status);
        }
        break;
      }

      case 'message.translation': {
        const innerData = (payload.data ?? payload) as Record<string, unknown>;
        const innerPayload = (innerData.payload ?? innerData) as Record<string, unknown>;
        const messageId = (innerPayload.message_id ?? innerData.message_id) as string | undefined;
        const content = (innerPayload.content ?? innerData.content) as string | undefined;
        if (qc && messageId && content) {
          patchMessageTranslationInCaches(qc, messageId, content);
        }
        break;
      }

      case 'typing.start': {
        const cId = payload.conversation_id as string | undefined;
        const name = payload.user_name as string | undefined;
        if (cId && name) {
          get().setTyping(cId, name, true);
        }
        break;
      }

      case 'typing.stop': {
        const cId = payload.conversation_id as string | undefined;
        const name = payload.user_name as string | undefined;
        if (cId && name) {
          get().setTyping(cId, name, false);
        }
        break;
      }
    }
  },
}));
