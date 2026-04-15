import { View } from 'react-native';
import { Text } from '@/components/StyledText';
import type { Product } from '~/types/models';

interface ProductPreviewCardProps {
  product: Product;
  onPress?: () => void;
}

/** Shared placeholder for product preview (marketplace + future messenger). */
export function ProductPreviewCard({ product, onPress }: ProductPreviewCardProps) {
  return (
    <View style={{ padding: 12, backgroundColor: '#f5f5f7', borderRadius: 10 }}>
      <Text style={{ fontSize: 14, fontWeight: '600' }}>{product.title}</Text>
      <Text style={{ fontSize: 12, opacity: 0.7 }}>{product.price} {product.currency}</Text>
    </View>
  );
}
