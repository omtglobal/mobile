import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { CartItem } from '~/components/cart';
import { Button, Text } from '~/components/ui';
import { useCartStore } from '~/lib/stores/cart';
import { useAuth } from '~/lib/hooks/useAuth';
import { analytics } from '~/lib/analytics/analyticsService';
import { formatPrice } from '~/lib/utils/format';
import { useTheme } from '~/lib/contexts/ThemeContext';

export default function CartScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { isAuthenticated } = useAuth();

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
  const toggleSelection = useCartStore((s) => s.toggleSelection);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const allSelected = items.length > 0 && items.every((i) => !deselectedIds.includes(i.product_id));

  const handleSelectAll = () => {
    if (allSelected) {
      items.filter((i) => !deselectedIds.includes(i.product_id)).forEach((i) => toggleSelection(i.product_id));
    } else {
      deselectedIds.forEach((id) => toggleSelection(id));
    }
  };
  const canCheckout = selectedItems.length > 0;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    analytics.checkoutStarted();
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.bgSecondary }]}>
        <View style={[styles.empty, { padding: spacing.xl }]}>
          <Text variant="headingMd" style={styles.emptyTitle}>
            {t('cart.title')}
          </Text>
          <Text variant="bodyMd" color="secondary" style={styles.emptySubtitle}>
            {t('cart.empty')}
          </Text>
          <Button variant="primary" onPress={() => router.replace('/(main)/(tabs)')} style={styles.emptyBtn}>
            {t('cart.start_shopping')}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <Text variant="headingMd">{t('cart.title')} ({items.length})</Text>
      </View>

      <Pressable
        onPress={handleSelectAll}
        style={({ pressed }) => [
          styles.selectAllRow,
          { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: allSelected ? colors.brandPrimary : colors.borderStrong,
              backgroundColor: allSelected ? colors.brandPrimary : 'transparent',
            },
          ]}
        >
          {allSelected && <Check color="#fff" size={14} strokeWidth={3} />}
        </View>
        <Text variant="bodyMd">{t('cart.select_all')}</Text>
      </Pressable>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item) => (
          <CartItem
            key={item.product_id}
            item={item}
            isSelected={!deselectedIds.includes(item.product_id)}
            onToggleSelect={() => toggleSelection(item.product_id)}
            onUpdateQuantity={(q) => updateQuantity(item.product_id, q)}
            onRemove={() => removeItem(item.product_id)}
          />
        ))}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.bgPrimary, borderTopColor: colors.borderDefault }]}>
        <Text variant="bodyMd" color="secondary">
          {t('cart.total')} ({t('cart.items_count', { count: selectedItems.length })}): {formatPrice(selectedTotalPriceValue, selectedItems[0]?.product.currency ?? 'USD')}
        </Text>
        <Button
          variant="primary"
          onPress={handleCheckout}
          disabled={!canCheckout}
          style={!canCheckout ? styles.disabledBtn : undefined}
        >
          {t('cart.checkout')}
        </Button>
      </View>
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
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  footer: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyTitle: {
    marginBottom: 4,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyBtn: {
    minWidth: 200,
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
