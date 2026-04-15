import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Text } from '~/components/ui';
import { ProductBadges } from './ProductBadges';
import { StarRating } from './StarRating';
import { formatPrice } from '~/lib/utils/format';
import { resolveImageUrl } from '~/lib/utils/imageUrl';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { Product } from '~/types/models';

interface ProductCardProps {
  product: Product;
  /** Compact: horizontal carousel style; standard: grid 2-col */
  variant?: 'compact' | 'standard';
  onPress?: () => void;
}

export const ProductCard = React.memo(function ProductCard({
  product,
  variant = 'standard',
  onPress,
}: ProductCardProps) {
  const router = useRouter();
  const { colors, radius, spacing } = useTheme();

  const handlePress = () => {
    onPress?.();
    router.push(`/product/${product.id}`);
  };

  const rawUrl =
    product.primary_image?.thumbnail_url ??
    product.primary_image?.url ??
    product.images?.[0]?.thumbnail_url ??
    product.images?.[0]?.url ??
    null;
  const imageUrl = resolveImageUrl(rawUrl);

  if (variant === 'compact') {
    return (
      <Pressable
        testID="product-card"
        onPress={handlePress}
        style={({ pressed }) => [
          styles.compactCard,
          {
            backgroundColor: colors.bgPrimary,
            borderRadius: radius.lg,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View style={[styles.compactImage, { borderRadius: radius.md }]}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              recyclingKey={product.id}
            />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: colors.bgSecondary }]} />
          )}
        </View>
        <View style={styles.compactContent}>
          <Text variant="bodySm" numberOfLines={2} style={styles.compactTitle}>
            {product.title}
          </Text>
          <Text variant="priceMd" style={{ color: colors.brandPrimary }}>
            {formatPrice(product.price, product.currency)}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      testID="product-card"
      onPress={handlePress}
      style={({ pressed }) => [
        styles.standardCard,
        {
          backgroundColor: colors.bgPrimary,
          borderRadius: radius.lg,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.standardImage, { borderRadius: radius.lg }]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            recyclingKey={product.id}
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.bgSecondary }]} />
        )}
      </View>
      <View style={[styles.standardContent, { padding: spacing.md }]}>
        <ProductBadges badges={product.badges} />
        <Text variant="bodyMd" numberOfLines={2} style={styles.title}>
          {product.title}
        </Text>
        <View style={styles.ratingRow}>
          <StarRating rating={product.rating_avg} size={12} />
          {product.review_count > 0 && (
            <Text variant="caption" color="secondary">
              ({product.review_count})
            </Text>
          )}
        </View>
        <Text variant="priceMd" style={{ color: colors.brandPrimary }}>
          {formatPrice(product.price, product.currency)}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  compactCard: {
    width: 140,
    overflow: 'hidden',
  },
  compactImage: {
    width: 140,
    height: 140,
    overflow: 'hidden',
  },
  compactContent: {
    padding: 12,
    gap: 4,
  },
  compactTitle: {
    minHeight: 32,
  },
  standardCard: {
    flex: 1,
    overflow: 'hidden',
  },
  standardImage: {
    aspectRatio: 1,
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
  standardContent: {
    gap: 6,
  },
  title: {
    minHeight: 40,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
