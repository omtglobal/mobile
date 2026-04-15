import { View, StyleSheet } from 'react-native';
import { Badge } from '~/components/ui';
import type { ProductBadge } from '~/types/models';

interface ProductBadgesProps {
  badges?: ProductBadge[] | null;
}

const BADGE_LABELS: Record<ProductBadge, string> = {
  choice: 'Choice',
  saving: 'Saving',
  brand_plus: 'Brand+',
  best_sale: 'Best Sale',
};

const BADGE_TYPE_MAP: Record<ProductBadge, 'choice' | 'best_sale' | 'brand_plus' | 'discount'> = {
  choice: 'choice',
  saving: 'discount',
  brand_plus: 'brand_plus',
  best_sale: 'best_sale',
};

export function ProductBadges({ badges }: ProductBadgesProps) {
  if (!badges?.length) return null;

  return (
    <View style={styles.container}>
      {badges.map((b) => (
        <Badge key={b} type={BADGE_TYPE_MAP[b]} label={BADGE_LABELS[b]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
