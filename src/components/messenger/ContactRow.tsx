import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MessageCircle, Phone } from 'lucide-react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import type { Contact, ContactSearchResult } from '~/types/messaging';

interface ContactRowProps {
  contact: Contact | ContactSearchResult;
  onPress: () => void;
  onAction?: () => void;
  actionLabel?: string;
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

export function ContactRow({ contact, onPress, onAction, actionLabel }: ContactRowProps) {
  const { colors, spacing, radius } = useTheme();

  const initial = contact.name.charAt(0).toUpperCase();
  const avatarBg = getAvatarColor(contact.name);

  const accountLabel =
    contact.account_type === 'seller'
      ? 'Seller'
      : contact.account_type === 'support'
        ? 'Support'
        : '';

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
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text variant="headingSm" style={styles.avatarText}>
            {initial}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text variant="headingSm" color="primary" numberOfLines={1}>
          {contact.name}
        </Text>
        {accountLabel ? (
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {accountLabel}
          </Text>
        ) : null}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onPress();
          }}
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
        <Pressable
          style={[
            styles.actionBtn,
            {
              backgroundColor: colors.bgSecondary,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Phone size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

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
  info: {
    flex: 1,
    gap: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
