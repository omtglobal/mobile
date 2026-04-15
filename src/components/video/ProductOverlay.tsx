import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/Text';
import { Button } from '~/components/ui/Button';
import { useMainPager } from '~/lib/contexts/MainPagerContext';
import { formatPrice } from '~/lib/utils/format';
import type { Product } from '~/types/models';

type Props = {
  product: Product;
};

export function ProductOverlay({ product }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { goToSalesAndProduct } = useMainPager();

  const short =
    product.short_description?.trim() ||
    (product.description?.length ? `${product.description.slice(0, 80)}…` : '');

  return (
    <View
      style={{
        marginHorizontal: 12,
        marginBottom: Math.max(insets.bottom, 12) + 8,
        padding: 14,
        borderRadius: 14,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
      }}
    >
      <Text variant="headingSm" style={{ color: '#FFFFFF' }} numberOfLines={2}>
        {product.title}
      </Text>
      <Text variant="priceMd" style={{ color: '#FFFFFF', marginTop: 6 }}>
        {formatPrice(product.price, product.currency)}
      </Text>
      {short ? (
        <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8 }} numberOfLines={2}>
          {short}
        </Text>
      ) : null}
      <View style={{ marginTop: 12 }}>
        <Button variant="primary" size="sm" onPress={() => goToSalesAndProduct(product.id)}>
          {t('video.buy')}
        </Button>
      </View>
    </View>
  );
}
