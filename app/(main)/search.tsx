import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { HeaderBackButton, Input, Text } from '~/components/ui';
import { ProductGrid, ProductCard } from '~/components/catalog';
import { useSearchProducts } from '~/lib/hooks/useProducts';
import { analytics } from '~/lib/analytics/analyticsService';
import {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistory,
  clearSearchHistory,
} from '~/lib/utils/searchHistory';
import { useTheme } from '~/lib/contexts/ThemeContext';

const DEBOUNCE_MS = 300;

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (query.length < 2) {
      setDebouncedQuery('');
      return;
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      debounceRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const searchQuery = useSearchProducts(debouncedQuery);
  const products = searchQuery.data?.pages.flatMap((p) => p.data) ?? [];
  const totalCount = searchQuery.data?.pages[searchQuery.data.pages.length - 1]?.meta?.total;

  const handleLoadMore = useCallback(() => {
    if (searchQuery.hasNextPage && !searchQuery.isFetchingNextPage) {
      searchQuery.fetchNextPage();
    }
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      analytics.searchPerformed(debouncedQuery);
    }
  }, [debouncedQuery]);

  const handleSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (trimmed.length >= 2) {
      addSearchHistory(trimmed);
      setHistory(getSearchHistory());
      setQuery(trimmed);
      setDebouncedQuery(trimmed);
    }
  }, []);

  const handleHistoryItemPress = (item: string) => {
    setQuery(item);
    setDebouncedQuery(item);
  };

  const handleRemoveHistoryItem = (item: string) => {
    removeSearchHistory(item);
    setHistory(getSearchHistory());
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistory([]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <HeaderBackButton onPress={() => router.back()} />
        <Input
          testID="search-input"
          placeholder={t('home.search_placeholder')}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={(e) => handleSearch(e.nativeEvent.text)}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
      </View>

      {debouncedQuery.length < 2 ? (
        <View style={[styles.historySection, { padding: spacing.lg }]}>
          <View style={styles.historyHeader}>
            <Text variant="headingSm">{t('home.recent_searches')}</Text>
            {history.length > 0 && (
              <Pressable onPress={handleClearHistory}>
                <Text variant="bodySm" style={{ color: colors.brandPrimary }}>{t('home.clear')}</Text>
              </Pressable>
            )}
          </View>
          {history.length === 0 ? (
            <Text variant="bodyMd" color="secondary">
              {t('home.search_history_empty')}
            </Text>
          ) : (
            history.map((item) => (
              <Pressable
                key={item}
                onPress={() => handleHistoryItemPress(item)}
                style={({ pressed }) => [
                  styles.historyItem,
                  { borderBottomColor: colors.borderDefault, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text variant="bodyMd">{item}</Text>
                <Pressable
                  onPress={() => handleRemoveHistoryItem(item)}
                  hitSlop={12}
                >
                  <Text variant="bodyMd" color="secondary">×</Text>
                </Pressable>
              </Pressable>
            ))
          )}
        </View>
      ) : (
        <>
          {searchQuery.isLoading && !products.length ? (
            <View style={[styles.empty, { padding: spacing.xl }]}>
              <Text variant="bodyMd" color="secondary">{t('common.loading')}</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={[styles.empty, { padding: spacing.xl }]}>
              <Text variant="headingMd" style={styles.emptyTitle}>
                {t('home.no_results')}
              </Text>
              <Text variant="bodyMd" color="secondary" style={styles.emptySubtitle}>
                {t('home.try_changing')}
              </Text>
            </View>
          ) : (
            <View style={styles.resultsContainer}>
              <View style={[styles.resultsHeader, { paddingHorizontal: spacing.lg }]}>
                <Text variant="bodySm" color="secondary">
                  {t('home.found_count', { count: totalCount ?? products.length })}
                </Text>
              </View>
              <ProductGrid
                products={products}
                onEndReached={handleLoadMore}
                isFetchingNextPage={searchQuery.isFetchingNextPage}
                refreshControl={
                  <RefreshControl
                    refreshing={searchQuery.isRefetching && !searchQuery.isFetchingNextPage}
                    onRefresh={() => searchQuery.refetch()}
                    tintColor={colors.brandPrimary}
                  />
                }
              />
            </View>
          )}
        </>
      )}
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
  input: {
    flex: 1,
  },
  historySection: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    padding: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    marginBottom: 4,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
});
