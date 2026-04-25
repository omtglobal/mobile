import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';

const DOT_SIZE = 6;

/**
 * “Pull to refresh / fetch more” indicator: three dots light up one by one, then dim together.
 * Use inside an absolute overlay so the message list does not change height when this appears.
 */
export function ChatLoadingDots() {
  const { colors } = useTheme();
  const o0 = useRef(new Animated.Value(0.35)).current;
  const o1 = useRef(new Animated.Value(0.35)).current;
  const o2 = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const step = 170;

    const rise = (v: Animated.Value, delayMs: number) =>
      Animated.sequence([
        Animated.delay(delayMs),
        Animated.timing(v, { toValue: 1, duration: step, useNativeDriver: true }),
      ]);

    const fall = (v: Animated.Value) =>
      Animated.timing(v, { toValue: 0.35, duration: step, useNativeDriver: true });

    const cycle = Animated.sequence([
      Animated.parallel([rise(o0, 0), rise(o1, step), rise(o2, step * 2)]),
      Animated.parallel([fall(o0), fall(o1), fall(o2)]),
      Animated.delay(140),
    ]);

    const loop = Animated.loop(cycle);
    loop.start();
    return () => loop.stop();
  }, [o0, o1, o2]);

  const dotStyle = { backgroundColor: colors.brandPrimary };

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.bgPrimary + 'E6',
          borderColor: colors.borderDefault,
        },
      ]}
    >
      <Animated.View style={[styles.dot, dotStyle, { opacity: o0 }]} />
      <Animated.View style={[styles.dot, dotStyle, { opacity: o1 }]} />
      <Animated.View style={[styles.dot, dotStyle, { opacity: o2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
