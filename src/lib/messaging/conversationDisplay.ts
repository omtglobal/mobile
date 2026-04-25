import type { Conversation, ConversationParticipant } from '~/types/messaging';

function isSelfParticipant(
  participantId: string,
  currentUserId: string | null | undefined,
): boolean {
  if (participantId === '__self__') return true;
  if (currentUserId == null) return false;
  return String(participantId) === String(currentUserId);
}

/** The other person in a direct chat (not the current user). */
export function getConversationPeer(
  conversation: Conversation,
  currentUserId: string | null | undefined,
): ConversationParticipant | undefined {
  if (conversation.company) return undefined;
  return conversation.participants.find((p) => !isSelfParticipant(p.id, currentUserId));
}

/**
 * Title for a row / header: peer display name, company name, or last message sender
 * when the API omits the peer name on participants.
 */
export function resolveConversationTitle(
  conversation: Conversation,
  currentUserId: string | null | undefined,
): string {
  if (conversation.company?.name?.trim()) return conversation.company.name.trim();

  const other = getConversationPeer(conversation, currentUserId);
  if (other?.name?.trim()) return other.name.trim();

  const last = conversation.last_message;
  if (last?.sender_name?.trim()) {
    const fromSelf = isSelfParticipant(last.sender_id, currentUserId);
    if (!fromSelf) return last.sender_name.trim();
  }

  return other?.name?.trim() || last?.sender_name?.trim() || '';
}
