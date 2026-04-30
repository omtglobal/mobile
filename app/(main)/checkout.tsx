import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { ChevronRight, MapPin, Package } from 'lucide-react-native';
import { Button, HeaderBackButton, Input, Text } from '~/components/ui';
import { BottomSheet } from '~/components/ui/BottomSheet';
import { useToast } from '~/components/ui/Toast';
import { useAuth } from '~/lib/hooks/useAuth';
import { analytics } from '~/lib/analytics/analyticsService';
import { AuthPrompt } from '~/components/layout/AuthPrompt';
import { useAddresses } from '~/lib/hooks/useAddresses';
import { useCreateOrder } from '~/lib/hooks/useOrders';
import { useCartStore } from '~/lib/stores/cart';
import { formatPrice } from '~/lib/utils/format';
import { resolveImageUrl } from '~/lib/utils/imageUrl';
import { useTheme } from '~/lib/contexts/ThemeContext';

export default function CheckoutScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const { colors, spacing } = useTheme();
  const { isAuthenticated } = useAuth();

  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const { data: addressesData } = useAddresses();
  const addresses = addressesData?.data ?? [];
  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];
  const selectedAddress = selectedAddressId
    ? addresses.find((a) => a.id === selectedAddressId)
    : defaultAddress;

  const items = useCartStore((s) => s.items);
  const deselectedIds = useCartStore((s) => s.deselectedIds);
  const selectedItems = useMemo(
    () => items.filter((i) => !deselectedIds.includes(i.product_id)),
    [items, deselectedIds]
  );
  const selectedTotalPriceValue = useMemo(
    () => selectedItems.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),
    [selectedItems]
  );
  const removeItem = useCartStore((s) => s.removeItem);

  const createOrder = useCreateOrder();

  if (!isAuthenticated) {
    return (
      <AuthPrompt
        title={t('checkout.title')}
        message={t('auth.login_prompt_checkout')}
      />
    );
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress || selectedItems.length === 0) return;

    analytics.paymentClicked();

    const orderData = {
      shipping_name: selectedAddress.name,
      shipping_phone: selectedAddress.phone,
      shipping_email: selectedAddress.email,
      shipping_address: selectedAddress.address,
      shipping_city: selectedAddress.city,
      shipping_country: selectedAddress.country,
      shipping_zip: selectedAddress.zip ?? undefined,
      notes: notes || undefined,
      items: selectedItems.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
    };

    try {
      const res = await createOrder.mutateAsync(orderData) as { data?: { id?: string } };
      const orderId = res?.data?.id;
      selectedItems.forEach((i) => removeItem(i.product_id));
      toast.show(t('checkout.order_created'), 'success');
      if (orderId) {
        router.replace(`/order/${orderId}`);
      } else {
        router.back();
      }
    } catch (err) {
      toast.show(t('checkout.order_failed'), 'error');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <HeaderBackButton onPress={() => router.back()} />
        <Text variant="headingMd">{t('checkout.title')}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.section, { backgroundColor: colors.bgPrimary }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.borderDefault }]}>
            <MapPin color={colors.brandPrimary} size={20} />
            <Text variant="headingSm">{t('checkout.delivery_address')}</Text>
          </View>
          {selectedAddress ? (
            <Pressable
              onPress={() => setAddressSheetOpen(true)}
              style={({ pressed }) => [styles.addressCard, { opacity: pressed ? 0.9 : 1 }]}
            >
              <Text variant="bodyMd">{selectedAddress.name}</Text>
              <Text variant="bodySm" color="secondary">
                {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.country}
              </Text>
              <Text variant="bodySm" color="secondary">{selectedAddress.phone}</Text>
              <ChevronRight color={colors.textTertiary} size={20} style={styles.chevron} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/addresses/edit')}
              style={({ pressed }) => [styles.addAddress, { borderColor: colors.borderDefault, opacity: pressed ? 0.9 : 1 }]}
            >
              <Text variant="bodyMd" style={{ color: colors.brandPrimary }}>{t('checkout.add_address')}</Text>
            </Pressable>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.bgPrimary }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.borderDefault }]}>
            <Package color={colors.brandPrimary} size={20} />
            <Text variant="headingSm">{t('checkout.products')}</Text>
          </View>
          {selectedItems.map((item) => {
            const imgUrl = resolveImageUrl(item.product.primary_image?.url ?? null);
            return (
            <View key={item.product_id} style={[styles.productRow, { borderBottomColor: colors.borderDefault }]}>
              <View style={styles.productImage}>
                {imgUrl ? (
                  <Image source={{ uri: imgUrl }} style={styles.img} contentFit="cover" />
                ) : (
                  <View style={[styles.imgPlaceholder, { backgroundColor: colors.bgSecondary }]} />
                )}
              </View>
              <View style={styles.productInfo}>
                <Text variant="bodyMd" numberOfLines={2}>{item.product.title}</Text>
                <Text variant="bodySm" color="secondary">
                  × {item.quantity} — {formatPrice(Number(item.product.price) * item.quantity, item.product.currency)}
                </Text>
              </View>
            </View>
            );
          })}
        </View>

        <View style={[styles.section, { backgroundColor: colors.bgPrimary }]}>
          <Text variant="headingSm" style={styles.notesTitle}>{t('checkout.order_notes')}</Text>
          <Input
            placeholder={t('checkout.optional_comment')}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={[styles.summary, { backgroundColor: colors.bgPrimary }]}>
          <View style={styles.summaryRow}>
            <Text variant="bodyMd" color="secondary">{t('checkout.products_count', { count: selectedItems.length })}</Text>
            <Text variant="bodyMd">{formatPrice(selectedTotalPriceValue, selectedItems[0]?.product.currency ?? 'USD')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyMd" color="secondary">{t('checkout.shipping')}</Text>
            <Text variant="bodyMd">{t('checkout.shipping_free')}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text variant="headingMd">{t('checkout.total')}</Text>
            <Text variant="priceMd" style={{ color: colors.brandPrimary }}>
              {formatPrice(selectedTotalPriceValue, selectedItems[0]?.product.currency ?? 'USD')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.bgPrimary, borderTopColor: colors.borderDefault }]}>
        <Button
          variant="primary"
          onPress={handlePlaceOrder}
          disabled={!selectedAddress || selectedItems.length === 0 || createOrder.isPending}
        >
          {createOrder.isPending ? t('checkout.processing') : t('checkout.pay_amount', { amount: formatPrice(selectedTotalPriceValue, selectedItems[0]?.product.currency ?? 'USD') })}
        </Button>
      </View>

      <BottomSheet visible={addressSheetOpen} onClose={() => setAddressSheetOpen(false)}>
        <View style={[styles.sheetContent, { padding: spacing.lg }]}>
          <View style={styles.sheetHeader}>
            <Text variant="headingMd">{t('checkout.select_address')}</Text>
            <Pressable onPress={() => { setAddressSheetOpen(false); router.push('/addresses/edit'); }}>
              <Text variant="bodyMd" style={{ color: colors.brandPrimary }}>{t('checkout.new')}</Text>
            </Pressable>
          </View>
          {addresses.map((addr) => (
            <Pressable
              key={addr.id}
              onPress={() => {
                setSelectedAddressId(addr.id);
                setAddressSheetOpen(false);
              }}
              style={[
                styles.addressOption,
                { borderBottomColor: colors.borderDefault },
                (selectedAddressId === addr.id || (!selectedAddressId && addr.is_default)) && { backgroundColor: colors.bgSecondary },
              ]}
            >
              <Text variant="bodyMd">{addr.label || addr.name}</Text>
              <Text variant="bodySm" color="secondary">
                {addr.name}, {addr.address}, {addr.city}, {addr.country}
              </Text>
            </Pressable>
          ))}
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
    gap: 16,
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
  addressCard: {
    padding: 16,
    position: 'relative',
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  addAddress: {
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
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
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  imgPlaceholder: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
  },
  notesTitle: {
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  summary: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  sheetContent: {
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addressOption: {
    padding: 16,
    borderBottomWidth: 1,
  },
});
