import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '~/components/ui';
import { useTheme } from '~/lib/contexts/ThemeContext';

export type ProductDetailTabKey = 'description' | 'reviews' | 'specification' | 'company';

const TAB_ORDER: ProductDetailTabKey[] = ['description', 'reviews', 'specification', 'company'];

interface ProductDetailTabBarProps {
  active: ProductDetailTabKey;
  onChange: (tab: ProductDetailTabKey) => void;
  labels: Record<ProductDetailTabKey, string>;
}

export function ProductDetailTabBar({ active, onChange, labels }: ProductDetailTabBarProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrap, { borderBottomColor: colors.borderDefault, backgroundColor: colors.bgPrimary }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {TAB_ORDER.map((key) => {
          const isActive = active === key;
          return (
            <Pressable
              key={key}
              onPress={() => onChange(key)}
              style={({ pressed }) => [
                styles.tab,
                {
                  borderBottomColor: isActive ? colors.brandPrimary : 'transparent',
                  borderBottomWidth: 2,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                variant="bodySm"
                style={{
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? colors.textPrimary : colors.textSecondary,
                }}
                numberOfLines={1}
              >
                {labels[key]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scroll: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    gap: 4,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 2,
  },
});
