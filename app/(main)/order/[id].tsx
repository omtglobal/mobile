import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { MapPin, Package, CreditCard } from 'lucide-react-native';
import { resolveOrderItemImageUrl } from '~/lib/utils/imageUrl';
import { Button, HeaderBackButton, Text } from '~/components/ui';
import { BottomSheet } from '~/components/ui/BottomSheet';
import { useToast } from '~/components/ui/Toast';
import { useOrder, usePayOrder, useConfirmDelivery } from '~/lib/hooks/useOrders';
import { useProductThumbnailsByIds } from '~/lib/hooks/useProductThumbnailsByIds';
import { formatPrice, formatDate } from '~/lib/utils/format';
import { useTheme } from '~/lib/contexts/ThemeContext';
export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const { colors, spacing } = useTheme();

  const [paySheetOpen, setPaySheetOpen] = useState(false);

  const { data, isLoading } = useOrder(id);
  const payOrder = usePayOrder();
  const confirmDelivery = useConfirmDelivery();

  const order = data?.data;

  const orderThumbnailIds = useMemo(() => {
    if (!order?.items.length) return [];
    return Array.from(new Set(order.items.map((i) => i.product_id)));
  }, [order]);

  const orderHydrateMap = useProductThumbnailsByIds(orderThumbnailIds);

  const handlePay = async () => {
    if (!id) return;
    try {
      await payOrder.mutateAsync(id);
      setPaySheetOpen(false);
      toast.show(t('orders.order_paid'), 'success');
    } catch {
      toast.show(t('orders.payment_failed'), 'error');
    }
  };

  const handleConfirmDelivery = async () => {
    if (!id) return;
    try {
      await confirmDelivery.mutateAsync(id);
      toast.show(t('orders.delivery_confirmed'), 'success');
    } catch {
      toast.show(t('orders.confirm_failed'), 'error');
    }
  };

  const handleContactSupport = () => {
    router.push({ pathname: '/support/new', params: { orderId: id } });
  };

  if (isLoading || !order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
        <View style={[styles.skeleton, { backgroundColor: colors.bgTertiary }]} />
      </View>
    );
  }

  const canPay = order.status === 'pending';
  const canConfirmDelivery = order.status === 'shipped';

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <HeaderBackButton onPress={() => router.back()} />
        <Text variant="headingMd">{t('orders.order_id', { id: order.id.slice(0, 8) })}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.section, { backgroundColor: colors.bgPrimary }]}>
          <View style={[styles.sectionRow, { borderBottomColor: colors.borderDefault }]}>
            <Text variant="bodyMd" color="secondary">{t('orders.status_label')}</Text>
            <Text variant="bodyMd">{order.status_label}</Text>
          </View>
          <View style={[styles.sectionRow, { borderBottomColor: colors.borderDefault }]}>
            <Text variant="bodyMd" color="secondary">{t('orders.created')}</Text>
            <Text variant="bodyMd">{formatDate(order.created_at)}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.bgPrimary }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.borderDefault }]}>
            <Package color={colors.brandPrimary} size={20} />
            <Text variant="headingSm">{t('orders.products')}</Text>
          </View>
          {order.items.map((item) => {
            const imageUri = resolveOrderItemImageUrl(item, orderHydrateMap);
            return (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/product/${item.product_id}`)}
              style={({ pressed }) => [styles.productRow, { borderBottomColor: colors.borderDefault, opacity: pressed ? 0.9 : 1 }]}
            >
              <View style={[styles.productImage, { backgroundColor: colors.bgSecondary }]}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.productImageInner} contentFit="cover" />
                ) : (
                  <Package size={22} color={colors.textTertiary} />
                )}
              </View>
              <View style={styles.productInfo}>
                <Text variant="bodyMd" numberOfLines={2}>{item.title}</Text>
                <Text variant="bodySm" color="secondary">
                  × {item.quantity} = {formatPrice(item.line_total, item.currency)}
                </Text>
              </View>
            </Pressable>
            );
          })}
        </View>

        <View style={[styles.section, { backgroundColor: colors.bgPrimary }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.borderDefault }]}>
            <MapPin color={colors.brandPrimary} size={20} />
            <Text variant="headingSm">{t('orders.delivery_address')}</Text>
          </View>
          <View style={styles.addressContent}>
            <Text variant="bodyMd">{order.shipping_name}</Text>
            <Text variant="bodySm" color="secondary">
              {order.shipping_address}, {order.shipping_city}, {order.shipping_country}
            </Text>
            <Text variant="bodySm" color="secondary">{order.shipping_phone}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.bgPrimary }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.borderDefault }]}>
            <CreditCard color={colors.brandPrimary} size={20} />
            <Text variant="headingSm">{t('orders.payment')}</Text>
          </View>
          <View style={styles.paymentContent}>
            <View style={styles.sectionRow}>
              <Text variant="bodyMd" color="secondary">{t('orders.method')}</Text>
              <Text variant="bodyMd">{order.payment_method}</Text>
            </View>
            <View style={styles.sectionRow}>
              <Text variant="bodyMd" color="secondary">{t('orders.status_label')}</Text>
              <Text variant="bodyMd">{order.payment_status_label}</Text>
            </View>
            {order.transaction_id && (
              <View style={styles.sectionRow}>
                <Text variant="bodyMd" color="secondary">{t('orders.transaction')}</Text>
                <Text variant="bodySm">{order.transaction_id}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.bgPrimary }]}>
          <View style={[styles.sectionRow, { borderBottomColor: colors.borderDefault }]}>
            <Text variant="bodyMd" color="secondary">{t('checkout.products_count', { count: order.items.length })}</Text>
            <Text variant="bodyMd">{formatPrice(order.total_amount, order.currency)}</Text>
          </View>
          <View style={[styles.sectionRow, { borderBottomColor: colors.borderDefault }]}>
            <Text variant="bodyMd" color="secondary">{t('checkout.shipping')}</Text>
            <Text variant="bodyMd">{t('checkout.shipping_free')}</Text>
          </View>
          <View style={[styles.sectionRow, styles.totalRow]}>
            <Text variant="headingMd">{t('checkout.total')}</Text>
            <Text variant="priceMd" style={{ color: colors.brandPrimary }}>
              {formatPrice(order.total_amount, order.currency)}
            </Text>
          </View>
        </View>

        <View style={[styles.actions, { padding: spacing.lg }]}>
          {canPay && (
            <Button variant="primary" onPress={() => setPaySheetOpen(true)} style={styles.actionBtn}>
              {t('orders.pay')}
            </Button>
          )}
          {canConfirmDelivery && (
            <Button variant="primary" onPress={handleConfirmDelivery} style={styles.actionBtn}>
              {t('orders.confirm_delivery')}
            </Button>
          )}
          <Button variant="outline" onPress={handleContactSupport} style={styles.actionBtn}>
            {t('orders.contact_support')}
          </Button>
        </View>
      </ScrollView>

      <BottomSheet visible={paySheetOpen} onClose={() => setPaySheetOpen(false)}>
        <View style={[styles.sheetContent, { padding: spacing.lg }]}>
          <Text variant="headingMd" style={styles.sheetTitle}>
            {t('orders.pay_confirm_title', { id: order.id.slice(0, 8), amount: formatPrice(order.total_amount, order.currency) })}
          </Text>
          <Text variant="bodyMd" color="secondary" style={styles.sheetSubtitle}>
            {t('orders.pay_confirm_subtitle')}
          </Text>
          <View style={styles.sheetButtons}>
            <Button variant="outline" onPress={() => setPaySheetOpen(false)} style={styles.sheetBtn}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onPress={handlePay}
              disabled={payOrder.isPending}
              style={styles.sheetBtn}
            >
              {payOrder.isPending ? t('checkout.processing') : t('orders.pay')}
            </Button>
          </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  totalRow: {
    borderBottomWidth: 0,
  },
  productRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImageInner: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
  },
  addressContent: {
    padding: 16,
    gap: 4,
  },
  paymentContent: {
    padding: 16,
    gap: 8,
  },
  actions: {
    gap: 12,
  },
  actionBtn: {
    width: '100%',
  },
  skeleton: {
    height: 200,
    margin: 16,
    borderRadius: 10,
  },
  sheetContent: {
    paddingBottom: 32,
  },
  sheetTitle: {
    marginBottom: 8,
  },
  sheetSubtitle: {
    marginBottom: 24,
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sheetBtn: {
    flex: 1,
  },
});
