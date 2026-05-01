import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { resolveImageUrl } from '~/lib/utils/imageUrl';
import { analytics } from '~/lib/analytics/analyticsService';
import type { ProductImage } from '~/types/models';

interface ProductGalleryProps {
  images: ProductImage[];
  productId?: string;
}

export function ProductGallery({ images, productId }: ProductGalleryProps) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const displayImages = sorted.length > 0 ? sorted : [{ url: '', thumbnail_url: null, is_primary: true, sort_order: 0 } as ProductImage];

  useEffect(() => {
    if (productId) {
      const img = displayImages[activeIndex];
      analytics.productPhotoViewed(productId, activeIndex, img?.id);
    }
  }, [productId, activeIndex, displayImages]);

  return (
    <View style={[styles.container, { width }]}>
      <FlatList
        data={displayImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(i);
        }}
        renderItem={({ item }) => {
          const resolvedUrl = resolveImageUrl(item.thumbnail_url ?? item.url);
          return (
          <View style={[styles.slide, { width, backgroundColor: colors.bgSecondary }]}>
            {resolvedUrl ? (
              <Image
                source={{ uri: resolvedUrl }}
                style={styles.image}
                contentFit="contain"
                transition={200}
                recyclingKey={item.id ?? item.url}
              />
            ) : (
              <View style={[styles.placeholder, { backgroundColor: colors.bgTertiary }]} />
            )}
          </View>
          );
        }}
        keyExtractor={(item) => item.id ?? item.url ?? String(item.sort_order)}
      />
      <View style={styles.dots}>
        {displayImages.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === activeIndex ? colors.brandPrimary : colors.borderDefault,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
  },
  slide: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '80%',
    height: '80%',
    borderRadius: 8,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
