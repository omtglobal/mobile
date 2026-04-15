import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ShoppingCart, Share2, ChevronLeft } from 'lucide-react-native';
import {
  ProductGallery,
  ProductBadges,
  StarRating,
  SellerCard,
  ReviewPreview,
  StickyAddToCart,
  ProductCarousel,
} from '~/components/catalog';
import { Text } from '~/components/ui';
import { useProduct } from '~/lib/hooks/useProducts';
import { useCartStore } from '~/lib/stores/cart';
import { useToast } from '~/components/ui/Toast';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { formatPrice } from '~/lib/utils/format';
import { analytics } from '~/lib/analytics/analyticsService';
import { ShareToChatSheet } from '~/components/messenger';

const DESCRIPTION_LINES = 3;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const toast = useToast();
  const addItem = useCartStore((s) => s.addItem);

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [shareChatOpen, setShareChatOpen] = useState(false);

  const { data, isLoading } = useProduct(id);
  const pageData = data?.data;
  const product = pageData?.product;

  useEffect(() => {
    if (product?.id) analytics.productViewed(product.id);
  }, [product?.id]);
  const reviews = pageData?.reviews;
  const featured = pageData?.featured ?? [];

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product);
    analytics.addToCartClicked(product.id, 1);
    toast.show(t('product.added_to_cart'), 'success');
  };

  if (isLoading || !product) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
        <View style={[styles.skeleton, { backgroundColor: colors.bgTertiary }]} />
      </View>
    );
  }

  const reviewData = reviews?.data ?? [];
  const reviewTotal = reviews?.meta?.total ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={8}>
          <ChevronLeft color={colors.textPrimary} size={28} />
        </Pressable>
        <View style={styles.headerSpacer} />
        <Pressable onPress={() => router.push('/(main)/(tabs)/cart')} style={styles.iconBtn}>
          <ShoppingCart color={colors.textPrimary} size={24} />
        </Pressable>
        <Pressable onPress={() => setShareChatOpen(true)} style={styles.iconBtn} accessibilityLabel={t('messenger.share_to_chat')}>
          <MessageCircle color={colors.textPrimary} size={22} />
        </Pressable>
        <Pressable style={styles.iconBtn}>
          <Share2 color={colors.textPrimary} size={22} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProductGallery productId={product.id} images={product.images} />

        <View style={[styles.content, { padding: spacing.lg }]}>
          <ProductBadges badges={product.badges} />
          <Text variant="headingMd" style={styles.title}>
            {product.title}
          </Text>
          <Text variant="priceLg" style={{ color: colors.brandPrimary }}>
            {formatPrice(product.price, product.currency)}
          </Text>
          <View style={styles.ratingRow}>
            <StarRating rating={product.rating_avg} size={16} />
            {product.review_count > 0 && (
              <Text variant="bodyMd" color="secondary" style={styles.reviewCount}>
                {product.rating_avg?.toFixed(1) ?? '—'} ({product.review_count} reviews)
              </Text>
            )}
          </View>

          <View style={[styles.section, { borderTopColor: colors.borderDefault }]}>
            <SellerCard seller={product.company} />
          </View>

          <View style={[styles.section, { borderTopColor: colors.borderDefault }]}>
            <Text variant="headingSm" style={styles.sectionTitle}>
              Description
            </Text>
            <Text
              variant="bodyMd"
              color="secondary"
              numberOfLines={descriptionExpanded ? undefined : DESCRIPTION_LINES}
            >
              {product.description || 'No description'}
            </Text>
            {(product.description?.length ?? 0) > 120 && (
              <Pressable onPress={() => setDescriptionExpanded(!descriptionExpanded)}>
                <Text variant="bodyMd" style={{ color: colors.brandPrimary, marginTop: 8 }}>
                  {descriptionExpanded ? 'Show less' : 'Show more'}
                </Text>
              </Pressable>
            )}
          </View>

          {reviewTotal > 0 && (
            <View style={[styles.section, { borderTopColor: colors.borderDefault }]}>
              <ReviewPreview productId={product.id} reviews={reviewData} total={reviewTotal} />
            </View>
          )}

          {featured.length > 0 && (
            <View style={[styles.section, { borderTopColor: colors.borderDefault }]}>
              <Text variant="headingSm" style={styles.sectionTitle}>
                Similar Products
              </Text>
              <ProductCarousel products={featured} />
            </View>
          )}
        </View>
      </ScrollView>

      <StickyAddToCart product={product} onAddToCart={handleAddToCart} />

      <ShareToChatSheet
        visible={shareChatOpen}
        onClose={() => setShareChatOpen(false)}
        productId={product.id}
        productTitle={product.title}
        productPrice={String(product.price)}
        productCurrency={product.currency}
        productImageUrl={product.primary_image?.url ?? product.images[0]?.url ?? null}
        sellerOwnerUserId={product.company?.owner_user_id ?? null}
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
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: 10,
  },
  headerSpacer: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    gap: 12,
  },
  title: {
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewCount: {
    marginLeft: 4,
  },
  section: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  skeleton: {
    height: 300,
    margin: 16,
    borderRadius: 10,
  },
});
