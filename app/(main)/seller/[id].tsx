import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ProductCard } from '~/components/catalog';
import { Button, Text } from '~/components/ui';
import { catalogApi } from '~/lib/api/catalog';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { resolveImageUrl } from '~/lib/utils/imageUrl';

export default function SellerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing } = useTheme();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['company', id],
    queryFn: () => catalogApi.getCompany(id!),
    enabled: !!id,
  });

  const seller = data?.data;

  if (isLoading && !seller) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
        <View style={[styles.skeleton, { backgroundColor: colors.bgTertiary }]} />
      </View>
    );
  }

  if (!seller) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgSecondary, padding: spacing.lg }]}>
        <Text variant="bodyMd" color="secondary">Seller not found</Text>
      </View>
    );
  }

  const products = seller.preview_products ?? [];
  const categories = seller.main_categories ?? [];
  const headerUrl = resolveImageUrl(seller.header_background_url ?? null);
  const logoUrl = resolveImageUrl(seller.logo_url ?? null);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgSecondary }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          tintColor={colors.brandPrimary}
        />
      }
    >
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text variant="bodyMd" style={{ color: colors.brandPrimary }}>←</Text>
        </Pressable>
        <Text variant="headingMd">Seller</Text>
      </View>

      <View style={[styles.profileCard, { backgroundColor: colors.bgPrimary }]}>
        {seller.is_premium_plus && headerUrl ? (
          <View style={[styles.headerBg, { height: 80 }]}>
            <Image
              source={{ uri: headerUrl }}
              style={styles.headerBgImage}
              contentFit="cover"
            />
          </View>
        ) : null}
        <View style={[styles.profileRow, { padding: spacing.lg }]}>
          <View style={[styles.logoWrap, { backgroundColor: colors.bgSecondary, borderRadius: 10 }]}>
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.logo} contentFit="cover" />
            ) : (
              <Text style={styles.logoPlaceholder}>🏢</Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text variant="headingMd">{seller.name}</Text>
            {seller.company_rating_avg != null && seller.company_rating_avg > 0 && (
              <Text variant="bodyMd" color="secondary">
                ★ {seller.company_rating_avg.toFixed(1)}
              </Text>
            )}
            {(seller.city || seller.country) && (
              <Text variant="bodySm" color="secondary">
                {[seller.city, seller.country].filter(Boolean).join(', ')}
              </Text>
            )}
          </View>
        </View>
      </View>

      {seller.profile_description && (
        <View style={[styles.section, { padding: spacing.lg, backgroundColor: colors.bgPrimary }]}>
          <Text variant="headingSm" style={styles.sectionTitle}>
            About
          </Text>
          <Text variant="bodyMd" color="secondary">
            {seller.profile_description}
          </Text>
        </View>
      )}

      {categories.length > 0 && (
        <View style={[styles.section, { padding: spacing.lg, backgroundColor: colors.bgPrimary }]}>
          <Text variant="headingSm" style={styles.sectionTitle}>
            Categories
          </Text>
          <View style={styles.categoryChips}>
            {categories.map((c) => (
              <View
                key={c.id}
                style={[styles.chip, { backgroundColor: colors.bgSecondary, borderRadius: 8 }]}
              >
                <Text variant="bodySm">
                  {c.name} ({c.products_count})
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={[styles.section, { padding: spacing.lg }]}>
        <Text variant="headingSm" style={styles.sectionTitle}>
          Seller Products
        </Text>
        <View style={styles.productGrid}>
          {products.map((p) => (
            <View key={p.id} style={styles.productCell}>
              <ProductCard product={p} variant="standard" />
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.contactSection, { padding: spacing.lg }]}>
        <Button
          variant="secondary"
          onPress={() => router.push({ pathname: '/support/new', params: { companyId: id } })}
        >
          Contact Seller
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  profileCard: {
    marginBottom: 8,
    overflow: 'hidden',
  },
  headerBg: {
    width: '100%',
    overflow: 'hidden',
  },
  headerBgImage: {
    width: '100%',
    height: '100%',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoWrap: {
    width: 64,
    height: 64,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCell: {
    width: '47%',
  },
  contactSection: {
    marginTop: 16,
  },
  skeleton: {
    height: 200,
    margin: 16,
    borderRadius: 10,
  },
});
