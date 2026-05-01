import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { ProductGrid, ProductCard } from '~/components/catalog';
import { BottomSheet, Button, HeaderBackButton, Text } from '~/components/ui';
import { useCategory } from '~/lib/hooks/useCategories';
import { useCategoryProducts } from '~/lib/hooks/useProducts';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { analytics } from '~/lib/analytics/analyticsService';
import type { ProductFilters } from '~/types/models';

const SORT_OPTIONS: { sort_by: ProductFilters['sort_by']; sort_order: ProductFilters['sort_order']; label: string }[] = [
  { sort_by: 'reviews_count', sort_order: 'desc', label: 'Popular' },
  { sort_by: 'created_at', sort_order: 'desc', label: 'Newest' },
  { sort_by: 'price', sort_order: 'asc', label: 'Price: Low to High' },
  { sort_by: 'price', sort_order: 'desc', label: 'Price: High to Low' },
  { sort_by: 'title', sort_order: 'asc', label: 'Name: A-Z' },
];

export default function CategoryProductsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortIndex, setSortIndex] = useState(0);
  const [filters, setFilters] = useState<Partial<ProductFilters>>({});
  const activeFilterCount = [filters.min_price, filters.max_price, filters.min_rating].filter(
    (v) => v != null && v !== undefined
  ).length;

  const categoryQuery = useCategory(id);
  const category = categoryQuery.data?.data;

  useEffect(() => {
    if (id && category?.id) analytics.categoryViewed(id);
  }, [id, category?.id]);

  const sortOpt = SORT_OPTIONS[sortIndex];
  const productsQuery = useCategoryProducts(id, {
    sort_by: sortOpt?.sort_by ?? 'published_at',
    sort_order: sortOpt?.sort_order ?? 'desc',
    min_price: filters.min_price,
    max_price: filters.max_price,
    min_rating: filters.min_rating,
    per_page: 20,
  });

  const products = productsQuery.data?.pages.flatMap((p) => p.data) ?? [];

  const handleSortSelect = (index: number) => {
    setSortIndex(index);
    setSortSheetOpen(false);
  };

  const handleApplyFilters = () => {
    setFilterSheetOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <HeaderBackButton onPress={() => router.back()} />
        <Text variant="headingSm" numberOfLines={1} style={styles.title}>
          {category?.name ?? 'Category'}
        </Text>
        <Pressable onPress={() => router.push('/search')} style={styles.iconBtn}>
          <Search color={colors.textPrimary} size={22} />
        </Pressable>
        <Pressable onPress={() => setFilterSheetOpen(true)} style={styles.iconBtn}>
          <SlidersHorizontal color={colors.textPrimary} size={22} />
        </Pressable>
      </View>

      <View style={[styles.chipBar, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <Pressable
          onPress={() => setSortSheetOpen(true)}
          style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text variant="bodySm" color="secondary">
            {sortOpt?.label ?? 'Sort'} ▼
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFilterSheetOpen(true)}
          style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text variant="bodySm" color="secondary">
            Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Text>
        </Pressable>
      </View>

      <ProductGrid
        products={products}
        onEndReached={() => {
          if (productsQuery.hasNextPage && !productsQuery.isFetchingNextPage) {
            productsQuery.fetchNextPage();
          }
        }}
        isFetchingNextPage={productsQuery.isFetchingNextPage}
        refreshControl={
          <RefreshControl
            refreshing={productsQuery.isRefetching && !productsQuery.isFetchingNextPage}
            onRefresh={() => productsQuery.refetch()}
            tintColor={colors.brandPrimary}
          />
        }
      />

      <BottomSheet visible={sortSheetOpen} onClose={() => setSortSheetOpen(false)}>
        <View style={[styles.sheetContent, { padding: spacing.lg }]}>
          <Text variant="headingMd" style={styles.sheetTitle}>
            Sort
          </Text>
          {SORT_OPTIONS.map((opt, i) => (
            <Pressable
              key={i}
              onPress={() => handleSortSelect(i)}
              style={[
                styles.sortOption,
                { borderBottomColor: colors.borderDefault },
                sortIndex === i && { backgroundColor: colors.bgSecondary },
              ]}
            >
              <Text variant="bodyMd">{opt.label}</Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>

      <BottomSheet visible={filterSheetOpen} onClose={() => setFilterSheetOpen(false)}>
        <View style={[styles.sheetContent, { padding: spacing.lg }]}>
          <View style={styles.sheetHeader}>
            <Text variant="headingMd">Filters</Text>
            <Pressable onPress={handleResetFilters}>
              <Text variant="bodyMd" style={{ color: colors.brandPrimary }}>Reset</Text>
            </Pressable>
          </View>
          <Text variant="bodySm" color="secondary" style={styles.filterHint}>
            Price and rating — coming soon
          </Text>
          <Button variant="primary" onPress={handleApplyFilters} style={styles.applyBtn}>
            Apply Filters
          </Button>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
  },
  iconBtn: {
    padding: 4,
  },
  chipBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  sheetContent: {
    paddingBottom: 32,
  },
  sheetTitle: {
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sortOption: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  filterHint: {
    marginBottom: 24,
  },
  applyBtn: {
    marginTop: 8,
  },
});
