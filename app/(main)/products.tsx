import { useLocalSearchParams } from 'expo-router';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { ProductGrid } from '~/components/catalog';
import { Text } from '~/components/ui';
import { useProducts } from '~/lib/hooks/useProducts';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { ProductFilters } from '~/types/models';

export default function ProductsScreen() {
  const params = useLocalSearchParams<{ sort_by?: string; sort_order?: string }>();
  const { colors, spacing } = useTheme();

  const filters: ProductFilters = {
    sort_by: (params.sort_by as ProductFilters['sort_by']) ?? 'published_at',
    sort_order: (params.sort_order as ProductFilters['sort_order']) ?? 'desc',
    per_page: 20,
  };

  const query = useProducts(filters);
  const products = query.data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <Text variant="headingMd">All Products</Text>
      </View>
      <ProductGrid
        products={products}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            query.fetchNextPage();
          }
        }}
        isFetchingNextPage={query.isFetchingNextPage}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={() => query.refetch()}
            tintColor={colors.brandPrimary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
});
