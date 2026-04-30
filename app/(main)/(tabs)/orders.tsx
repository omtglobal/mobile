import { useMemo } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { FlashList } from '@shopify/flash-list';
import { Package } from 'lucide-react-native';
import { Text } from '~/components/ui';
import { Badge } from '~/components/ui/Badge';
import { AuthPrompt } from '~/components/layout/AuthPrompt';
import { useAuth } from '~/lib/hooks/useAuth';
import { useOrders } from '~/lib/hooks/useOrders';
import { useProductThumbnailsByIds } from '~/lib/hooks/useProductThumbnailsByIds';
import { formatPrice, formatDate } from '~/lib/utils/format';
import { resolveOrderItemImageUrl } from '~/lib/utils/imageUrl';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { Order } from '~/types/models';

const STATUS_COLORS: Record<string, 'status' | 'choice' | 'best_sale' | 'brand_plus' | 'discount'> = {
  pending: 'discount',
  paid: 'brand_plus',
  processing: 'brand_plus',
  shipped: 'brand_plus',
  delivered: 'choice',
  cancelled: 'status',
  refunded: 'best_sale',
};

function OrderCard({
  order,
  onPress,
  hydrateMap,
}: {
  order: Order;
  onPress: () => void;
  hydrateMap?: Record<string, string | null>;
}) {
  const { t } = useTranslation();
  const { colors, radius, spacing } = useTheme();
  const previewItems = order.items.slice(0, 3);
  const badgeType = STATUS_COLORS[order.status] ?? 'status';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.bgPrimary, borderRadius: radius.lg, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={[styles.cardHeader, { borderBottomColor: colors.borderDefault }]}>
        <Text variant="bodyMd">{t('orders.order_id', { id: order.id.slice(0, 8) })}</Text>
        <Text variant="bodySm" color="secondary">{formatDate(order.created_at)}</Text>
      </View>
      <View style={styles.previewRow}>
        {previewItems.map((item) => {
          const uri = resolveOrderItemImageUrl(item, hydrateMap);
          return (
            <View
              key={item.id}
              style={[styles.previewImg, { backgroundColor: colors.bgSecondary, borderRadius: radius.sm }]}
            >
              {uri ? (
                <Image source={{ uri }} style={styles.previewImgInner} contentFit="cover" />
              ) : (
                <Package size={22} color={colors.textTertiary} />
              )}
            </View>
          );
        })}
      </View>
      <View style={[styles.cardFooter, { borderTopColor: colors.borderDefault }]}>
        <Text variant="bodySm" color="secondary">
          {t('orders.items_count', { count: order.items.length })} · {formatPrice(order.total_amount, order.currency)}
        </Text>
        <Badge type={badgeType} label={order.status_label} />
      </View>
    </Pressable>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, refetch, isRefetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useOrders();
  const orders = data?.pages.flatMap((p) => p.data) ?? [];

  const thumbnailProductIds = useMemo(() => {
    const ids = new Set<string>();
    for (const o of orders) {
      for (const it of o.items.slice(0, 3)) {
        ids.add(it.product_id);
      }
    }
    return Array.from(ids);
  }, [data]);

  const orderHydrateMap = useProductThumbnailsByIds(thumbnailProductIds);

  if (!isAuthenticated) {
    return (
      <AuthPrompt
        title={t('orders.title')}
        message={t('auth.login_prompt_orders')}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <Text variant="headingMd">{t('orders.title')}</Text>
      </View>

      {orders.length === 0 && !isLoading ? (
        <View style={[styles.empty, { padding: spacing.xl }]}>
          <Text variant="headingMd" style={styles.emptyTitle}>{t('orders.empty')}</Text>
          <Text variant="bodyMd" color="secondary" style={styles.emptySubtitle}>
            {t('orders.empty_subtitle')}
          </Text>
        </View>
      ) : (
        <FlashList
          data={orders}
          renderItem={({ item }) => (
            <View style={[styles.cardWrap, { paddingHorizontal: spacing.lg, paddingVertical: 6 }]}>
              <OrderCard
                order={item}
                hydrateMap={orderHydrateMap}
                onPress={() => router.push(`/order/${item.id}`)}
              />
            </View>
          )}
          keyExtractor={(item) => item.id}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={() => refetch()}
              tintColor={colors.brandPrimary}
            />
          }
          ListFooterComponent={isFetchingNextPage ? <View style={{ height: 48 }} /> : null}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  listContent: {
    paddingBottom: 32,
    paddingTop: 8,
  },
  cardWrap: {},
  card: {
    padding: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
  },
  previewImg: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImgInner: {
    width: '100%',
    height: '100%',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
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
