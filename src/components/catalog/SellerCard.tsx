import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import { Text } from '~/components/ui';
import { StarRating } from './StarRating';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { resolveImageUrl } from '~/lib/utils/imageUrl';
import type { CompanyShort, SellerProfile } from '~/types/models';

interface SellerCardProps {
  seller: CompanyShort | SellerProfile | null;
}

export function SellerCard({ seller }: SellerCardProps) {
  const router = useRouter();
  const { colors, radius, spacing } = useTheme();

  if (!seller) return null;

  const rating = 'company_rating_avg' in seller ? seller.company_rating_avg : null;
  const isPremium = seller.is_premium_plus;
  const logoUrl = 'logo_url' in seller ? resolveImageUrl(seller.logo_url ?? null) : null;

  return (
    <Pressable
      onPress={() => router.push(`/seller/${seller.id}`)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.bgSecondary,
          borderRadius: radius.lg,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={[styles.logoWrap, { backgroundColor: colors.bgPrimary, borderRadius: radius.md }]}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logo} contentFit="cover" />
          ) : (
            <Text style={styles.logoPlaceholder}>🏢</Text>
          )}
        </View>
        <View style={styles.info}>
          <Text variant="headingSm">{seller.name}</Text>
          {isPremium && (
            <Text variant="caption" style={{ color: colors.premiumPlus }}>
              Premium Plus ◆
            </Text>
          )}
          {rating != null && rating > 0 && (
            <View style={styles.ratingRow}>
              <StarRating rating={rating} size={12} />
            </View>
          )}
        </View>
        <ChevronRight color={colors.textTertiary} size={20} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoWrap: {
    width: 48,
    height: 48,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  ratingRow: {
    marginTop: 4,
  },
});
