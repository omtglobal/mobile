import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { SearchBar, CategoryGrid, ProductCarousel, ProductCard } from '~/components/catalog';
import { SkeletonProductCard, Text } from '~/components/ui';
import { useHome, useProducts, useSearchProducts } from '~/lib/hooks/useProducts';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { analytics } from '~/lib/analytics/analyticsService';
import { addSearchHistory } from '~/lib/utils/searchHistory';

const DEBOUNCE_MS = 300;

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const homeQuery = useHome();
  const popularQuery = useProducts({
    sort_by: 'published_at',
    sort_order: 'desc',
    per_page: 20,
  });
  const searchQuery = useSearchProducts(debouncedQuery);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (query.trim().length < 2) {
      setDebouncedQuery('');
      return;
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
      debounceRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      analytics.searchPerformed(debouncedQuery);
    }
  }, [debouncedQuery]);

  const homeData = homeQuery.data?.data;
  const categories = homeData?.categories ?? [];
  const newProducts = homeData?.new_products ?? [];
  const popularPages = popularQuery.data?.pages ?? [];
  const popularProducts = popularPages.flatMap((p) => p.data);

  const isSearching = debouncedQuery.length >= 2;
  const searchPages = searchQuery.data?.pages ?? [];
  const searchProducts = searchPages.flatMap((p) => p.data);
  const searchTotal = searchPages[searchPages.length - 1]?.meta?.total;

  const listData = isSearching ? searchProducts : popularProducts;
  const hasNextPage = isSearching ? searchQuery.hasNextPage : popularQuery.hasNextPage;
  const isFetchingNextPage = isSearching
    ? searchQuery.isFetchingNextPage
    : popularQuery.isFetchingNextPage;

  const onRefresh = () => {
    homeQuery.refetch();
    popularQuery.refetch();
    if (debouncedQuery.length >= 2) {
      searchQuery.refetch();
    }
  };

  const handleSubmitSearch = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      addSearchHistory(trimmed);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      setDebouncedQuery(trimmed);
    }
  }, [query]);

  const isLoading = homeQuery.isLoading && !homeQuery.data;
  const searchLoading = isSearching && searchQuery.isFetching && searchProducts.length === 0;

  const ListHeaderComponent = (
    <View style={styles.header}>
      <View style={[styles.searchSection, { paddingHorizontal: spacing.lg, paddingTop: 38 }]}>
        <SearchBar value={query} onChangeText={setQuery} onSubmitEditing={handleSubmitSearch} />
      </View>

      {isSearching ? (
        <View style={[styles.section, { paddingHorizontal: spacing.lg, paddingTop: spacing.sm }]}>
          {searchLoading ? (
            <View style={styles.searchStatusRow}>
              <ActivityIndicator color={colors.brandPrimary} />
            </View>
          ) : (
            <Text variant="bodyMd" color="secondary">
              {t('home.found_count', { count: searchTotal ?? listData.length })}
            </Text>
          )}
        </View>
      ) : isLoading ? (
        <View style={styles.skeletonSection}>
          <View style={[styles.skeletonCategories, { backgroundColor: colors.bgTertiary }]} />
          <View style={[styles.skeletonCarousel, { backgroundColor: colors.bgTertiary }]} />
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <CategoryGrid categories={categories} />
          </View>

          <View style={[styles.section, { paddingTop: spacing.sm }]}>
            <ProductCarousel
              products={newProducts}
              title={t('home.new_arrivals')}
              allLink="/products?sort_by=published_at"
            />
          </View>

          <View style={[styles.section, { paddingTop: spacing.sm, paddingHorizontal: spacing.lg }]}>
            <Text variant="headingMd">{t('home.popular')}</Text>
          </View>
        </>
      )}
    </View>
  );

  const ListFooterComponent =
    isFetchingNextPage && listData.length > 0 ? (
      <View style={{ height: 48, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <View style={[styles.loader, { backgroundColor: colors.bgTertiary }]} />
      </View>
    ) : null;

  const ListEmptyComponent =
    isSearching && !searchLoading && listData.length === 0 ? (
      <View style={{ paddingHorizontal: spacing.lg, paddingVertical: 24 }}>
        <Text variant="bodyMd" color="secondary">
          {t('home.no_results')}
        </Text>
      </View>
    ) : null;

  if (isLoading && !homeQuery.data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
        <View style={[styles.searchSection, { paddingHorizontal: spacing.lg, paddingTop: 38 }]}>
          <SearchBar value={query} onChangeText={setQuery} onSubmitEditing={handleSubmitSearch} />
        </View>
        <View style={styles.skeletonSection}>
          <View style={[styles.skeletonCategories, { backgroundColor: colors.bgTertiary }]} />
          <View style={[styles.skeletonCarousel, { backgroundColor: colors.bgTertiary }]} />
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.gridCell}>
                <SkeletonProductCard />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <FlashList
      data={listData}
      extraData={isSearching}
      renderItem={({ item }) => (
        <View style={styles.cell}>
          <ProductCard product={item} variant="standard" />
        </View>
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          if (isSearching) {
            searchQuery.fetchNextPage();
          } else {
            popularQuery.fetchNextPage();
          }
        }
      }}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={
            (homeQuery.isRefetching || (isSearching && searchQuery.isRefetching)) &&
            !isFetchingNextPage
          }
          onRefresh={onRefresh}
          tintColor={colors.brandPrimary}
        />
      }
      contentContainerStyle={[
        styles.content,
        { backgroundColor: colors.bgSecondary, paddingBottom: 32 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    marginBottom: 4,
  },
  searchSection: {
    marginBottom: 4,
  },
  searchStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
  },
  section: {
    marginBottom: 2,
  },
  skeletonSection: {
    padding: 16,
    gap: 24,
  },
  skeletonCategories: {
    height: 100,
    borderRadius: 10,
  },
  skeletonCarousel: {
    height: 200,
    borderRadius: 10,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
  },
  gridCell: {
    width: '47%',
  },
  cell: {
    flex: 1,
    padding: 4,
    minHeight: 280,
  },
  loader: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
