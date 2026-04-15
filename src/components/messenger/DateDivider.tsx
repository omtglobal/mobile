import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';

interface DateDividerProps {
  date: string;
}

function formatDividerDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  if (isYesterday) return 'Yesterday';

  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function DateDivider({ date }: DateDividerProps) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={[styles.container, { paddingVertical: spacing.md }]}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.bgSecondary,
            borderRadius: radius.full,
            borderColor: colors.borderDefault,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.xs + 2,
          },
        ]}
      >
        <Text variant="caption" color="tertiary">
          {formatDividerDate(date)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
