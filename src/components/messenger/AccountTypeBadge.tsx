import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import type { AccountType } from '~/types/messaging';

interface AccountTypeBadgeProps {
  accountType: AccountType;
}

const BADGE_COLORS: Record<AccountType, { bg: string; text: string }> = {
  buyer: { bg: 'rgba(0, 122, 255, 0.12)', text: '#007AFF' },
  seller: { bg: 'rgba(52, 199, 89, 0.12)', text: '#34C759' },
  support: { bg: 'rgba(255, 149, 0, 0.12)', text: '#FF9500' },
};

export function AccountTypeBadge({ accountType }: AccountTypeBadgeProps) {
  const { t } = useTranslation();
  const { spacing, radius } = useTheme();

  const palette = BADGE_COLORS[accountType];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.bg,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs / 2,
          borderRadius: radius.sm,
        },
      ]}
    >
      <Text variant="caption" style={{ color: palette.text }}>
        {t(`messenger.badge.${accountType}`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
});
