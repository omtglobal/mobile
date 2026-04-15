import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Check, Minus, Plus, Trash2 } from 'lucide-react-native';
import { Text } from '~/components/ui';
import { StarRating } from '~/components/catalog';
import { formatPrice } from '~/lib/utils/format';
import { resolveImageUrl } from '~/lib/utils/imageUrl';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { CartItem as CartItemType } from '~/types/models';

interface CartItemProps {
  item: CartItemType;
  isSelected: boolean;
  onToggleSelect: () => void;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({
  item,
  isSelected,
  onToggleSelect,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const router = useRouter();
  const { colors, radius, spacing } = useTheme();
  const { product, quantity } = item;
  const imageUrl = resolveImageUrl(product.primary_image?.url ?? product.images?.[0]?.url ?? null);

  const handleProductPress = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
      <Pressable
        onPress={onToggleSelect}
        style={({ pressed }) => [styles.checkbox, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View
          style={[
            styles.checkboxInner,
            {
              borderColor: isSelected ? colors.brandPrimary : colors.borderStrong,
              backgroundColor: isSelected ? colors.brandPrimary : 'transparent',
            },
          ]}
        >
          {isSelected && <Check color="#fff" size={14} strokeWidth={3} />}
        </View>
      </Pressable>

      <Pressable onPress={handleProductPress} style={styles.content}>
        <View style={[styles.imageWrap, { borderRadius: radius.md }]}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: colors.bgSecondary }]} />
          )}
        </View>
        <View style={styles.info}>
          <Text variant="bodyMd" numberOfLines={2} style={styles.title}>
            {product.title}
          </Text>
          <Text variant="priceMd" style={{ color: colors.brandPrimary }}>
            {formatPrice(product.price, product.currency)}
          </Text>
          {product.rating_avg != null && product.rating_avg > 0 && (
            <StarRating rating={product.rating_avg} size={12} />
          )}
          <View style={styles.quantityRow}>
            <Pressable
              onPress={() => onUpdateQuantity(Math.max(1, quantity - 1))}
              style={({ pressed }) => [styles.qtyBtn, { backgroundColor: colors.bgSecondary, opacity: pressed ? 0.7 : 1 }]}
            >
              <Minus color={colors.textPrimary} size={16} />
            </Pressable>
            <Text variant="bodyMd" style={styles.qtyText}>
              {quantity}
            </Text>
            <Pressable
              onPress={() => onUpdateQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
              style={({ pressed }) => [styles.qtyBtn, { backgroundColor: colors.bgSecondary, opacity: pressed ? 0.7 : 1 }]}
            >
              <Plus color={colors.textPrimary} size={16} />
            </Pressable>
          </View>
        </View>
      </Pressable>

      <Pressable onPress={onRemove} style={({ pressed }) => [styles.removeBtn, { opacity: pressed ? 0.7 : 1 }]}>
        <Trash2 color={colors.error} size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  checkbox: {
    padding: 4,
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  imageWrap: {
    width: 80,
    height: 80,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    minHeight: 36,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    minWidth: 24,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 4,
  },
});
