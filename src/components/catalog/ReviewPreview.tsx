import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Text } from '~/components/ui';
import { StarRating } from './StarRating';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { Review } from '~/types/models';

interface ReviewPreviewProps {
  productId: string;
  reviews: Review[];
  total: number;
}

export function ReviewPreview({ productId, reviews, total }: ReviewPreviewProps) {
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const displayReviews = reviews.slice(0, 3);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => router.push({ pathname: '/reviews', params: { productId } })}
        style={({ pressed }) => [
          styles.header,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text variant="headingSm">Reviews ({total})</Text>
        <ChevronRight color={colors.brandPrimary} size={20} />
      </Pressable>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
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
