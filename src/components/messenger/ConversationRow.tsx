import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Pin, Check, CheckCheck } from 'lucide-react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import type { Conversation } from '~/types/messaging';

interface ConversationRowProps {
  conversation: Conversation;
  onPress: () => void;
}

const AVATAR_SIZE = 56;

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ConversationRowInner({ conversation, onPress }: ConversationRowProps) {
  const { colors, spacing, radius } = useTheme();

  const displayName = useMemo(() => {
    if (conversation.company) return conversation.company.name;
    const other = conversation.participants.find((p) => p.id !== '__self__');
    return other?.name ?? 'Chat';
  }, [conversation]);

  const initial = displayName.charAt(0).toUpperCase();
  const avatarBg = getAvatarColor(conversation.id);

  const isOnline = useMemo(() => {
    const other = conversation.participants.find((p) => p.id !== '__self__');
    return other?.is_online ?? false;
  }, [conversation]);

  const lastMsg = conversation.last_message;
  const isSent = lastMsg?.sender_id === '__self__';
  const isRead = lastMsg?.status === 'read';
  const isDelivered = lastMsg?.status === 'delivered';
  const isTyping = false;

  const lastText = lastMsg?.type === 'image'
    ? '📷 Photo'
    : lastMsg?.type === 'product'
      ? '🛍 Product'
      : lastMsg?.type === 'system'
        ? lastMsg.content ?? ''
        : lastMsg?.content ?? '';

  const timeLabel = lastMsg
    ? formatTimeAgo(lastMsg.created_at)
    : formatTimeAgo(conversation.updated_at);

  const hasUnread = conversation.unread_count > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: pressed ? colors.bgSecondary : colors.bgPrimary,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderDefault,
        },
      ]}
    >
      {/* Avatar with online indicator */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text variant="headingSm" style={styles.avatarText}>
            {initial}
          </Text>
        </View>
        {isOnline && (
          <View
            style={[
              styles.onlineDot,
              { borderColor: colors.bgPrimary, backgroundColor: colors.success },
            ]}
          />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topLine}>
          <View style={styles.titleRow}>
            <Text variant="headingSm" color="primary" numberOfLines={1} style={styles.title}>
              {displayName}
            </Text>
            {conversation.is_pinned && (
              <Pin
                size={14}
                color={colors.textTertiary}
                fill={colors.textTertiary}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
          <Text
            variant="caption"
            style={{
              color: hasUnread ? colors.brandPrimary : colors.textTertiary,
              fontWeight: hasUnread ? '600' : '400',
            }}
          >
            {timeLabel}
          </Text>
        </View>

        <View style={styles.bottomLine}>
          <View style={styles.previewRow}>
            {isSent && (
              isRead ? (
                <CheckCheck size={16} color={colors.brandPrimary} style={{ marginRight: 4 }} />
              ) : (
                <Check size={16} color={colors.textTertiary} style={{ marginRight: 4 }} />
              )
            )}
            <Text
              variant="bodySm"
              numberOfLines={1}
              style={[
                styles.preview,
                {
                  color: isTyping
                    ? colors.brandPrimary
                    : hasUnread
                      ? colors.textPrimary
                      : colors.textSecondary,
                  fontWeight: hasUnread ? '500' : '400',
                },
              ]}
            >
              {isTyping ? 'typing...' : lastText}
            </Text>
          </View>
          {hasUnread && (
            <View
              style={[
                styles.unreadBadge,
                { backgroundColor: colors.brandPrimary, borderRadius: radius.full },
              ]}
            >
              <Text variant="caption" style={styles.unreadText}>
                {conversation.unread_count > 99 ? '99+' : String(conversation.unread_count)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export const ConversationRow = memo(ConversationRowInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  content: {
    flex: 1,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  title: {
    flex: 1,
  },
  bottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  preview: {
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
