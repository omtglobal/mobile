import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';

type BadgeType =
  | 'choice'
  | 'best_sale'
  | 'brand_plus'
  | 'discount'
  | 'premium_plus'
  | 'status';

interface BadgeProps {
  type: BadgeType;
  label: string;
}

const BADGE_COLORS: Record<Exclude<BadgeType, 'status'>, keyof typeof import('~/constants/theme').lightColors> = {
  choice: 'badgeChoice',
  best_sale: 'badgeSale',
  brand_plus: 'badgeBrand',
  discount: 'discount',
  premium_plus: 'premiumPlus',
};

export function Badge({ type, label }: BadgeProps) {
  const { colors, radius } = useTheme();

  const backgroundColor =
    type === 'status' ? colors.bgTertiary : colors[BADGE_COLORS[type]];
  const textColor = type === 'status' ? colors.textPrimary : '#FFFFFF';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          borderRadius: radius.sm,
        },
      ]}
    >
      <Text style={[styles.text, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});
