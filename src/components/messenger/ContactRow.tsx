import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import type { Contact, ContactSearchResult } from '~/types/messaging';

interface ContactRowProps {
  contact: Contact | ContactSearchResult;
  onPress: () => void;
  onAction?: () => void;
  actionLabel?: string;
  /** Shows spinner in the action button; disables the action while true */
  actionLoading?: boolean;
  onSecondaryAction?: () => void;
  secondaryLabel?: string;
  secondaryLoading?: boolean;
}

const AVATAR_SIZE = 56;

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function ContactRow({
  contact,
  onPress,
  onAction,
  actionLabel,
  actionLoading = false,
  onSecondaryAction,
  secondaryLabel,
  secondaryLoading = false,
}: ContactRowProps) {
  const { colors, spacing, radius } = useTheme();

  const initial = contact.name.charAt(0).toUpperCase();
  const avatarBg = getAvatarColor(contact.name);

  const accountLabel =
    contact.account_type === 'seller'
      ? 'Seller'
      : contact.account_type === 'support'
        ? 'Support'
        : '';

  const searchHint =
    'email_hint' in contact
      ? [contact.email_hint, contact.phone_hint].filter(Boolean).join(' · ') || null
      : null;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.bgPrimary,
          borderBottomColor: colors.borderDefault,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.main,
          { backgroundColor: pressed ? colors.bgSecondary : 'transparent' },
        ]}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Text variant="headingSm" style={styles.avatarText}>
              {initial}
            </Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text variant="headingSm" color="primary" numberOfLines={1}>
            {contact.name}
          </Text>
          {searchHint ? (
            <Text variant="caption" color="secondary" numberOfLines={1}>
              {searchHint}
            </Text>
          ) : accountLabel ? (
            <Text variant="caption" color="secondary" numberOfLines={1}>
              {accountLabel}
            </Text>
          ) : null}
        </View>
      </Pressable>
      <View style={[styles.actions, { marginLeft: 8 }]}>
        <Pressable
          onPress={onPress}
          hitSlop={6}
          style={[
            styles.actionBtn,
            {
              backgroundColor: colors.brandPrimary + '15',
              borderRadius: radius.lg,
            },
          ]}
        >
          <MessageCircle size={20} color={colors.brandPrimary} />
        </Pressable>
        {onAction && (actionLabel || actionLoading) ? (
          <Pressable
            onPress={actionLoading ? undefined : onAction}
            disabled={actionLoading}
            hitSlop={6}
            style={[
              styles.actionBtn,
              {
                backgroundColor: colors.brandPrimary + '20',
                borderRadius: radius.lg,
                paddingHorizontal: spacing.sm,
                minWidth: 48,
                maxWidth: 112,
              },
            ]}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color={colors.brandPrimary} />
            ) : actionLabel ? (
              <Text
                variant="bodySm"
                color="brand"
                numberOfLines={1}
                style={{ fontWeight: '600' }}
              >
                {actionLabel}
              </Text>
            ) : null}
          </Pressable>
        ) : null}
        {onSecondaryAction && (secondaryLabel || secondaryLoading) ? (
          <Pressable
            onPress={secondaryLoading ? undefined : onSecondaryAction}
            disabled={secondaryLoading}
            hitSlop={6}
            style={[
              styles.actionBtn,
              {
                backgroundColor: colors.bgSecondary,
                borderRadius: radius.lg,
                paddingHorizontal: spacing.sm,
                minWidth: 48,
                maxWidth: 112,
              },
            ]}
          >
            {secondaryLoading ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : secondaryLabel ? (
              <Text
                variant="bodySm"
                color="secondary"
                numberOfLines={1}
                style={{ fontWeight: '600' }}
              >
                {secondaryLabel}
              </Text>
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingVertical: 12,
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
  info: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 16,
  },
  actionBtn: {
    minHeight: 40,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
