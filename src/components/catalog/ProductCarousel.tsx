import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { ProductCard } from './ProductCard';
import { Text } from '~/components/ui';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { Product } from '~/types/models';

interface ProductCarouselProps {
  products: Product[];
  /** Link destination for "All" button */
  allLink?: string;
  title?: string;
}

export function ProductCarousel({ products, allLink, title }: ProductCarouselProps) {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  if (!products.length) return null;

  return (
    <View style={styles.section}>
      {(title || allLink) && (
        <View style={[styles.header, { marginBottom: spacing.xs }]}>
          {title && (
            <Text variant="headingMd">{title}</Text>
          )}
          {allLink && (
            <Pressable
              onPress={() => { if (allLink) router.push(allLink as never); }}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <View style={styles.allLink}>
                <Text variant="bodyMd" style={{ color: colors.brandPrimary }}>All</Text>
                <ChevronRight color={colors.brandPrimary} size={18} />
              </View>
            </Pressable>
          )}
        </View>
      )}
      <FlatList
        data={products}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ProductCard product={item} variant="compact" />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingHorizontal: spacing.lg }]}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  allLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  list: {
    paddingVertical: 4,
  },
  item: {},
});
