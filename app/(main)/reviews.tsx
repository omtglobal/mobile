import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { StarRating } from '~/components/catalog';
import { HeaderBackButton, Text } from '~/components/ui';
import { useProduct } from '~/lib/hooks/useProducts';
import { useTheme } from '~/lib/contexts/ThemeContext';

export default function ReviewsScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { colors, spacing } = useTheme();

  const { data } = useProduct(productId);
  const reviews = data?.data?.reviews?.data ?? [];
  const product = data?.data?.product;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <HeaderBackButton onPress={() => router.back()} />
        <Text variant="headingMd">
          Reviews {product ? `— ${product.title}` : ''}
        </Text>
      </View>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { padding: spacing.lg }]}
        renderItem={({ item }) => (
          <View style={[styles.review, { backgroundColor: colors.bgPrimary, borderRadius: 10 }]}>
            <View style={styles.reviewHeader}>
              <StarRating rating={item.rating} size={14} />
              <Text variant="bodySm" color="secondary">
                {item.user_name ?? item.user?.name ?? 'Customer'} • {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            {item.title && (
              <Text variant="headingSm" style={styles.reviewTitle}>{item.title}</Text>
            )}
            <Text variant="bodyMd">{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  list: {
    paddingBottom: 32,
  },
  review: {
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reviewTitle: {
    marginBottom: 4,
  },
});
