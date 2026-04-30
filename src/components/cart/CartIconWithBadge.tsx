import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ShoppingCart } from 'lucide-react-native/icons';

export interface CartIconWithBadgeProps {
  color: string;
  size: number;
  count: number;
  /** Container size for tab bar alignment (default fits 24px icon + badge) */
  containerStyle?: StyleProp<ViewStyle>;
  badgeBackgroundColor?: string;
  accessibilityLabel?: string;
}

export function CartIconWithBadge({
  color,
  size,
  count,
  containerStyle,
  badgeBackgroundColor = '#FF3B30',
  accessibilityLabel,
}: CartIconWithBadgeProps) {
  const show = count > 0;
  const label = count > 99 ? '99+' : String(count);

  return (
    <View
      style={[styles.container, containerStyle]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    >
      <ShoppingCart color={color} size={size} />
      {show ? (
        <View style={[styles.badge, { backgroundColor: badgeBackgroundColor }]}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {label}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
