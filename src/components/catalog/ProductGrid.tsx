import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { ProductCard } from './ProductCard';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { Product } from '~/types/models';

interface ProductGridProps {
  products: Product[];
  onEndReached?: () => void;
  isFetchingNextPage?: boolean;
  ListFooterComponent?: React.ReactElement | null;
  ListHeaderComponent?: React.ReactElement | null;
  refreshControl?: React.ReactElement<React.ComponentProps<typeof RefreshControl>> | null;
  contentContainerStyle?: object;
}

export function ProductGrid({
  products,
  onEndReached,
  isFetchingNextPage,
  ListFooterComponent,
  ListHeaderComponent,
  refreshControl,
  contentContainerStyle,
}: ProductGridProps) {
  const { spacing } = useTheme();

  const renderProduct = useCallback(({ item }: { item: Product }) => {
    return (
      <View style={styles.cell}>
        <ProductCard product={item} variant="standard" />
      </View>
    );
  }, []);

  return (
    <FlashList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={2}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        ListFooterComponent ?? (isFetchingNextPage ? <View style={{ height: 48, padding: 16 }} /> : null)
      }
      ListHeaderComponent={ListHeaderComponent}
      {...(refreshControl ? { refreshControl } : {})}
      contentContainerStyle={[
        styles.content,
        { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
        contentContainerStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
  },
  cell: {
    flex: 1,
    padding: 6,
    minHeight: 280,
  },
});
