import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, HeaderBackButton, Text } from '~/components/ui';
import { SellerAboutContent } from '~/components/seller/SellerAboutContent';
import { catalogApi } from '~/lib/api/catalog';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '~/lib/contexts/ThemeContext';

export default function SellerAboutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
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
        <Text variant="bodyMd" color="secondary">
          {t('seller.not_found')}
        </Text>
      </View>
    );
  }

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
        <HeaderBackButton onPress={() => router.back()} />
        <Text variant="headingMd" style={{ flex: 1 }}>
          {t('seller.about_title')}
        </Text>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md }}>
        <SellerAboutContent seller={seller} />

        <Button variant="secondary" onPress={() => router.push(`/seller/${id}`)}>
          {t('seller.back_to_shop')}
        </Button>
        <Button
          variant="secondary"
          onPress={() => router.push({ pathname: '/support/new', params: { companyId: id } })}
        >
          {t('seller.contact')}
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
  skeleton: {
    height: 200,
    margin: 16,
    borderRadius: 10,
  },
});
