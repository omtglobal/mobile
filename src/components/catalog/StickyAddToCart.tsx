import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '~/components/ui';
import { formatPrice } from '~/lib/utils/format';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { Product } from '~/types/models';

interface StickyAddToCartProps {
  product: Product;
  onAddToCart: () => void;
}

export function StickyAddToCart({ product, onAddToCart }: StickyAddToCartProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();

  const handlePress = () => {
    onAddToCart();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, borderTopColor: colors.borderDefault }]}>
      <View style={styles.priceWrap}>
        <Text variant="caption" color="secondary">
          {t('product.price')}
        </Text>
        <Text variant="priceLg" style={{ color: colors.brandPrimary }}>
          {formatPrice(product.price, product.currency)}
        </Text>
      </View>
      <Button testID="add-to-cart" variant="primary" onPress={handlePress} style={styles.btn}>
        🛒 {t('product.add_to_cart')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    borderTopWidth: 1,
  },
  priceWrap: {
    flex: 1,
  },
  btn: {
    flex: 1,
  },
});
