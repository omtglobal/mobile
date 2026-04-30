import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Share2 } from 'lucide-react-native';
import {
  ProductGallery,
  ProductBadges,
  StarRating,
  SellerCard,
  ProductReviewForm,
  ProductDetailTabBar,
  type ProductDetailTabKey,
  StickyAddToCart,
  ProductCarousel,
  ProductShareSheet,
} from '~/components/catalog';
import { CartIconWithBadge } from '~/components/cart';
import { HeaderBackButton, Button, Text } from '~/components/ui';
import { useProduct } from '~/lib/hooks/useProducts';
import { useProductReviews } from '~/lib/hooks/useReviews';
import { cartTotalQuantitySelector, useCartStore } from '~/lib/stores/cart';
import { useToast } from '~/components/ui/Toast';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { formatPrice } from '~/lib/utils/format';
import { getProductSpecificationRows } from '~/lib/utils/productAttributes';
import { analytics } from '~/lib/analytics/analyticsService';
import { ShareToChatSheet } from '~/components/messenger';
import type { Review } from '~/types/models';

function ReviewCard({ item }: { item: Review }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View
      style={[
        styles.reviewCard,
        {
          backgroundColor: colors.bgPrimary,
          borderRadius: radius.lg,
          padding: spacing.lg,
          marginBottom: spacing.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.borderDefault,
        },
      ]}
    >
      <View style={styles.reviewHeader}>
        <StarRating rating={item.rating} size={14} />
        <Text variant="bodySm" color="secondary">
          {item.user_name ?? item.user?.name ?? '—'} • {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      {item.title ? (
        <Text variant="headingSm" style={{ marginBottom: 4 }}>
          {item.title}
        </Text>
      ) : null}
      <Text variant="bodyMd" color="secondary">
        {item.content}
      </Text>
    </View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const toast = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore(cartTotalQuantitySelector);

  const [activeTab, setActiveTab] = useState<ProductDetailTabKey>('description');
  const [shareChatOpen, setShareChatOpen] = useState(false);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);

  const { data, isLoading } = useProduct(id);
  const pageData = data?.data;
  const product = pageData?.product;

  const reviewsQuery = useProductReviews(product?.id ?? '', activeTab === 'reviews' && !!product?.id);

  useEffect(() => {
    if (product?.id) analytics.productViewed(product.id);
  }, [product?.id]);

  const featured = pageData?.featured ?? [];

  const tabLabels = useMemo(
    () =>
      ({
        description: t('product.tab_description'),
        reviews: t('product.tab_reviews'),
        specification: t('product.tab_specification'),
        company: t('product.tab_company'),
      }) satisfies Record<ProductDetailTabKey, string>,
    [t],
  );

  const specRows = useMemo(
    () => (product ? getProductSpecificationRows(product.attributes) : []),
    [product],
  );

  const reviewPages = reviewsQuery.data?.pages ?? [];
  const allReviews = reviewPages.flatMap((p) => p.data);
  const reviewTotalFromProduct = product?.review_count ?? 0;

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

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <HeaderBackButton onPress={() => router.back()} hitSlop={8} />
        <View style={styles.headerSpacer} />
        <Pressable
          onPress={() => router.push('/(main)/(tabs)/cart')}
          style={styles.iconBtn}
          accessibilityLabel={t('tabs.cart')}
        >
          <CartIconWithBadge color={colors.textPrimary} size={24} count={cartCount} />
        </Pressable>
        <Pressable onPress={() => setShareChatOpen(true)} style={styles.iconBtn} accessibilityLabel={t('messenger.share_to_chat')}>
          <MessageCircle color={colors.textPrimary} size={22} />
        </Pressable>
        <Pressable
          style={styles.iconBtn}
          onPress={() => setShareSheetOpen(true)}
          accessibilityLabel={t('product.share')}
        >
          <Share2 color={colors.textPrimary} size={22} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <ProductGallery productId={product.id} images={product.images} />

        <View style={[styles.hero, { padding: spacing.lg, backgroundColor: colors.bgPrimary }]}>
          <ProductBadges badges={product.badges} />
          <Text variant="headingMd" style={styles.title}>
            {product.title}
          </Text>
          <Text variant="priceLg" style={{ color: colors.brandPrimary }}>
            {formatPrice(product.price, product.currency)}
          </Text>
          <View style={styles.ratingRow}>
            <StarRating rating={product.rating_avg} size={16} />
            {product.review_count > 0 ? (
              <Text variant="bodyMd" color="secondary" style={styles.reviewCount}>
                {product.rating_avg?.toFixed(1) ?? '—'} ({t('product.reviews_count', { count: product.review_count })})
              </Text>
            ) : (
              <Text variant="bodyMd" color="secondary" style={styles.reviewCount}>
                {t('product.no_reviews_yet_short')}
              </Text>
            )}
          </View>
        </View>

        <ProductDetailTabBar active={activeTab} onChange={setActiveTab} labels={tabLabels} />

        <View style={[styles.tabPanel, { padding: spacing.lg, backgroundColor: colors.bgSecondary }]}>
          {activeTab === 'description' && (
            <View style={[styles.panelCard, { backgroundColor: colors.bgPrimary, borderRadius: radius.lg, padding: spacing.lg }]}>
              <Text variant="bodyMd" color="secondary">
                {product.description?.trim() ? product.description : t('product.description_empty')}
              </Text>
            </View>
          )}

          {activeTab === 'reviews' && (
            <View>
              {reviewsQuery.isLoading && allReviews.length === 0 ? (
                <View style={styles.reviewsLoading}>
                  <ActivityIndicator color={colors.brandPrimary} />
                </View>
              ) : null}
              {reviewTotalFromProduct === 0 && !reviewsQuery.isLoading && allReviews.length === 0 ? (
                <Text variant="bodyMd" color="secondary">
                  {t('product.no_reviews_yet')}
                </Text>
              ) : null}
              {allReviews.map((r) => (
                <ReviewCard key={r.id} item={r} />
              ))}
              {reviewsQuery.hasNextPage ? (
                <Button
                  variant="secondary"
                  onPress={() => reviewsQuery.fetchNextPage()}
                  disabled={reviewsQuery.isFetchingNextPage}
                  loading={reviewsQuery.isFetchingNextPage}
                  style={{ marginTop: spacing.sm }}
                >
                  {t('product.reviews_load_more')}
                </Button>
              ) : null}
              <View style={{ marginTop: spacing.lg }}>
                <ProductReviewForm productId={product.id} />
              </View>
            </View>
          )}

          {activeTab === 'specification' && (
            <View style={[styles.panelCard, { backgroundColor: colors.bgPrimary, borderRadius: radius.lg, overflow: 'hidden' }]}>
              {specRows.length === 0 ? (
                <Text variant="bodyMd" color="secondary" style={{ padding: spacing.lg }}>
                  {t('product.spec_empty')}
                </Text>
              ) : (
                specRows.map((row, idx) => (
                  <View
                    key={row.key}
                    style={[
                      styles.specRow,
                      {
                        borderBottomColor: colors.borderDefault,
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                        borderBottomWidth: idx < specRows.length - 1 ? StyleSheet.hairlineWidth : 0,
                      },
                    ]}
                  >
                    <Text variant="bodySm" style={{ color: colors.textSecondary, flex: 1, marginRight: spacing.md }}>
                      {row.label}
                    </Text>
                    <Text variant="bodyMd" style={{ flex: 1, textAlign: 'right' }}>
                      {row.value}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'company' && (
            <View style={{ gap: spacing.md }}>
              <SellerCard seller={product.company} />
              {product.company?.id ? (
                <>
                  <Pressable
                    onPress={() => router.push(`/seller/${product.company!.id}/about`)}
                    accessibilityRole="button"
                    accessibilityLabel={t('seller.view_details')}
                  >
                    <Text variant="bodyMd" style={{ color: colors.brandPrimary }}>
                      {t('seller.view_details')}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push(`/seller/${product.company!.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={t('product.company_all_products')}
                  >
                    <Text variant="bodyMd" style={{ color: colors.brandPrimary }}>
                      {t('product.company_all_products')}
                    </Text>
                  </Pressable>
                </>
              ) : null}
              <View
                style={[
                  styles.panelCard,
                  { backgroundColor: colors.bgPrimary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
                ]}
              >
                {product.category ? (
                  <View style={styles.metaRow}>
                    <Text variant="bodySm" color="secondary">
                      {t('product.field_category')}
                    </Text>
                    <Text variant="bodyMd">{product.category.name}</Text>
                  </View>
                ) : null}
                <View style={styles.metaRow}>
                  <Text variant="bodySm" color="secondary">
                    {t('product.field_sku')}
                  </Text>
                  <Text variant="bodyMd">{product.sku}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text variant="bodySm" color="secondary">
                    {t('product.field_stock')}
                  </Text>
                  <Text variant="bodyMd">{product.stock_quantity}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text variant="bodySm" color="secondary">
                    {t('product.field_status')}
                  </Text>
                  <Text variant="bodyMd">{product.status_label}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {featured.length > 0 && (
          <View style={[styles.section, { paddingHorizontal: spacing.lg, borderTopColor: colors.borderDefault }]}>
            <Text variant="headingSm" style={styles.sectionTitle}>
              {t('product.similar_products')}
            </Text>
            <ProductCarousel products={featured} />
          </View>
        )}
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

      <ProductShareSheet
        visible={shareSheetOpen}
        onClose={() => setShareSheetOpen(false)}
        productId={product.id}
        productTitle={product.title}
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
  hero: {
    gap: 8,
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
  tabPanel: {
    minHeight: 120,
  },
  panelCard: {},
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
  reviewCard: {},
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  metaRow: {
    gap: 4,
  },
  reviewsLoading: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});
