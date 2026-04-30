import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '~/components/ui';
import { StarRating } from './StarRating';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { Review } from '~/types/models';

interface ReviewPreviewProps {
  productId: string;
  reviews: Review[];
  total: number;
  /** When true, skip the top "Reviews (n)" row (parent already has a section title). */
  hideHeader?: boolean;
}

export function ReviewPreview({ productId, reviews, total, hideHeader }: ReviewPreviewProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();

  const displayReviews = reviews.slice(0, 3);

  return (
    <View style={[styles.container, hideHeader ? styles.containerFlat : undefined]}>
      {!hideHeader ? (
        <Pressable
          onPress={() => router.push({ pathname: '/reviews', params: { productId } })}
          style={({ pressed }) => [
            styles.header,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text variant="headingSm">{t('product.reviews_count', { count: total })}</Text>
          <ChevronRight color={colors.brandPrimary} size={20} />
        </Pressable>
      ) : null}
      {displayReviews.map((r) => (
        <View key={r.id} style={[styles.review, { borderBottomColor: colors.borderDefault }]}>
          <View style={styles.reviewHeader}>
            <StarRating rating={r.rating} size={14} />
            <Text variant="bodySm" color="secondary">
              {r.user_name ?? r.user?.name ?? 'Customer'}
            </Text>
          </View>
          <Text variant="bodyMd" numberOfLines={2}>
            {r.content}
          </Text>
        </View>
      ))}
      {hideHeader && total > displayReviews.length ? (
        <Pressable
          onPress={() => router.push({ pathname: '/reviews', params: { productId } })}
          style={({ pressed }) => [{ marginTop: spacing.sm, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text variant="bodyMd" style={{ color: colors.brandPrimary }}>
            {t('product.review_see_all', { count: total })}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  containerFlat: {
    marginTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  review: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
});
