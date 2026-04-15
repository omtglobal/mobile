import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '~/lib/contexts/ThemeContext';

interface SkeletonProps {
  width?: number;
  height?: number;
  borderRadius?: number;
}

export function Skeleton({
  width,
  height = 20,
  borderRadius = 6,
}: SkeletonProps) {
  const { colors, radius } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.5, 1]),
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          flex: width === undefined ? 1 : undefined,
          width: width as number | undefined,
          height,
          borderRadius: borderRadius ?? radius.sm,
          backgroundColor: colors.bgSecondary,
        },
        animatedStyle,
      ]}
    />
  );
}

export function SkeletonProductCard() {
  const { colors, radius, spacing } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderRadius: radius.lg }]}>
      <Skeleton height={160} borderRadius={radius.lg} />
      <View style={{ padding: spacing.md, gap: spacing.sm }}>
        <Skeleton height={14} width={120} />
        <Skeleton height={14} width={90} />
        <Skeleton height={18} width={60} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {},
  card: {
    overflow: 'hidden',
  },
});
