import { RefreshControl, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { SearchBar, CategoryGrid, ProductCarousel, ProductGrid, ProductCard } from '~/components/catalog';
import { SkeletonProductCard, Text } from '~/components/ui';
import { useHome, useProducts } from '~/lib/hooks/useProducts';
import { useTheme } from '~/lib/contexts/ThemeContext';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const homeQuery = useHome();
  const popularQuery = useProducts({
    sort_by: 'published_at',
    sort_order: 'desc',
    per_page: 20,
  });

  const homeData = homeQuery.data?.data;
  const categories = homeData?.categories ?? [];
  const newProducts = homeData?.new_products ?? [];
  const popularPages = popularQuery.data?.pages ?? [];
  const popularProducts = popularPages.flatMap((p) => p.data);
  const hasNextPage = popularQuery.hasNextPage;
  const isFetchingNextPage = popularQuery.isFetchingNextPage;

  const onRefresh = () => {
    homeQuery.refetch();
    popularQuery.refetch();
  };

  const isLoading = homeQuery.isLoading && !homeQuery.data;

  const ListHeaderComponent = (
    <View style={styles.header}>
      <View style={[styles.searchSection, { paddingHorizontal: spacing.lg, paddingTop: 38 }]}>
        <SearchBar />
      </View>

      {isLoading ? (
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
    isFetchingNextPage && popularProducts.length > 0 ? (
      <View style={{ height: 48, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <View style={[styles.loader, { backgroundColor: colors.bgTertiary }]} />
      </View>
    ) : null;

  if (isLoading && !homeQuery.data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
        <View style={[styles.searchSection, { paddingHorizontal: spacing.lg, paddingTop: 38 }]}>
          <SearchBar />
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
      data={popularProducts}
      renderItem={({ item }) => (
        <View style={styles.cell}>
          <ProductCard product={item} variant="standard" />
        </View>
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          popularQuery.fetchNextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={homeQuery.isRefetching && !popularQuery.isFetchingNextPage}
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
