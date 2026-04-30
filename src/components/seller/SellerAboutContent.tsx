import type { ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import {
  Award,
  Briefcase,
  ClipboardCheck,
  FileText,
  Globe,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Store,
  Zap,
} from 'lucide-react-native';
import { Text } from '~/components/ui';
import { StarRating } from '~/components/catalog/StarRating';
import { getSellerPremiumHeaderGradient, getSellerThemeAccent } from '~/lib/sellerProfileTheme';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { resolveImageUrl } from '~/lib/utils/imageUrl';
import type { SellerProfile } from '~/types/models';

export interface SellerAboutContentProps {
  seller: SellerProfile;
}

function openUrl(url: string) {
  void Linking.openURL(url);
}

function websiteHref(raw: string): string {
  return raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
}

function SectionCard({
  children,
  title,
  titleColor,
  icon: Icon,
  iconColor,
}: {
  children: ReactNode;
  title: string;
  titleColor?: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  iconColor?: string;
}) {
  const { colors, radius, spacing } = useTheme();
  const IconCmp = Icon;
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.bgPrimary,
          borderRadius: radius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.borderDefault,
        },
      ]}
    >
      <View style={styles.sectionTitleRow}>
        {IconCmp ? <IconCmp size={20} color={iconColor ?? colors.brandPrimary} /> : null}
        <Text variant="headingSm" style={{ color: titleColor ?? colors.textPrimary, flex: 1 }}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function ComplianceBlock({ seller, accent }: { seller: SellerProfile; accent: string }) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const hasAddr = !!(seller.address || seller.city || seller.country);
  const hasContact = !!(seller.email || seller.phone);
  const showEmptyRow = !hasAddr && !hasContact;

  const addrLine = [seller.address, [seller.city, seller.country].filter(Boolean).join(', ')].filter(Boolean).join(', ');

  return (
    <SectionCard
      title={t('product.complianceInfo')}
      titleColor={accent}
      icon={ShieldCheck}
      iconColor={accent}
    >
      <Text variant="bodySm" color="secondary" style={{ marginBottom: spacing.md }}>
        {t('seller.complianceIntro')}
      </Text>
      <Text variant="bodyMd" style={{ fontWeight: '600', marginBottom: spacing.sm }}>
        {t('seller.manufacturerSellerInfo')}
      </Text>
      <View style={styles.dl}>
        <Text variant="bodySm" style={styles.dt}>
          {t('common.fieldName')}
        </Text>
        <Text variant="bodySm" color="secondary" style={styles.dd}>
          {seller.legal_name || seller.name}
        </Text>
        {hasAddr ? (
          <>
            <Text variant="bodySm" style={styles.dt}>
              {t('common.fieldAddress')}
            </Text>
            <Text variant="bodySm" color="secondary" style={styles.dd}>
              {addrLine}
            </Text>
          </>
        ) : null}
        {seller.email ? (
          <>
            <Text variant="bodySm" style={styles.dt}>
              {t('common.fieldEmail')}
            </Text>
            <Pressable onPress={() => openUrl(`mailto:${seller.email}`)} style={styles.dd}>
              <Text variant="bodySm" style={{ color: colors.brandPrimary }}>
                {seller.email}
              </Text>
            </Pressable>
          </>
        ) : null}
        {seller.phone ? (
          <>
            <Text variant="bodySm" style={styles.dt}>
              {t('common.fieldPhone')}
            </Text>
            <Pressable onPress={() => openUrl(`tel:${seller.phone}`)} style={styles.dd}>
              <Text variant="bodySm" style={{ color: colors.brandPrimary }}>
                {seller.phone}
              </Text>
            </Pressable>
          </>
        ) : null}
        {showEmptyRow ? (
          <Text variant="bodySm" color="secondary" style={styles.dd}>
            {t('seller.noComplianceDetails')}
          </Text>
        ) : null}
      </View>
    </SectionCard>
  );
}

function AddressBlock({ seller, accent }: { seller: SellerProfile; accent: string }) {
  const { t } = useTranslation();
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.bgPrimary,
          borderRadius: radius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.borderDefault,
        },
      ]}
    >
      <View style={styles.sectionTitleRow}>
        <MapPin size={20} color={accent} />
        <Text variant="headingSm" style={{ color: accent, flex: 1 }}>
          {t('seller.sectionAddress')}
        </Text>
      </View>
      {seller.address ? (
        <Text variant="bodyMd" color="secondary">
          {seller.address}
        </Text>
      ) : null}
      {(seller.city || seller.country) && (
        <Text variant="bodyMd" color="secondary" style={seller.address ? { marginTop: 4 } : undefined}>
          {[seller.city, seller.country].filter(Boolean).join(', ')}
        </Text>
      )}
    </View>
  );
}

function ContactBlock({ seller, accent }: { seller: SellerProfile; accent: string }) {
  const { t } = useTranslation();
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.bgPrimary,
          borderRadius: radius.lg,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.borderDefault,
        },
      ]}
    >
      <Text variant="headingSm" style={{ color: accent, marginBottom: spacing.md }}>
        {t('seller.sectionContact')}
      </Text>
      <View style={{ gap: spacing.md }}>
        {seller.phone ? (
          <Pressable style={styles.contactRow} onPress={() => openUrl(`tel:${seller.phone}`)}>
            <Phone size={18} color={accent} />
            <Text variant="bodyMd" style={{ color: colors.brandPrimary, flex: 1 }}>
              {seller.phone}
            </Text>
          </Pressable>
        ) : null}
        {seller.email ? (
          <Pressable style={styles.contactRow} onPress={() => openUrl(`mailto:${seller.email}`)}>
            <Mail size={18} color={accent} />
            <Text variant="bodyMd" style={{ color: colors.brandPrimary, flex: 1 }}>
              {seller.email}
            </Text>
          </Pressable>
        ) : null}
        {seller.website ? (
          <Pressable style={styles.contactRow} onPress={() => openUrl(websiteHref(seller.website!))}>
            <Globe size={18} color={accent} />
            <Text variant="bodyMd" style={{ color: colors.brandPrimary, flex: 1 }}>
              {seller.website.replace(/^https?:\/\//, '')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function StandardLayout({ seller }: { seller: SellerProfile }) {
  const { t } = useTranslation();
  const { colors, radius, spacing } = useTheme();
  const accent = colors.brandPrimary;
  const hasAddress = !!(seller.city || seller.address || seller.country);
  const hasContact = !!(seller.phone || seller.email || seller.website);

  return (
    <View style={{ gap: spacing.md }}>
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.bgPrimary,
            borderRadius: radius.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.borderDefault,
          },
        ]}
      >
        <View style={styles.heroRow}>
          <View style={[styles.heroIcon, { backgroundColor: `${colors.brandPrimary}18` }]}>
            <Store size={28} color={colors.brandPrimary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="headingMd">{seller.name}</Text>
            {seller.legal_name && seller.legal_name !== seller.name ? (
              <View style={[styles.legalRow, { marginTop: 4 }]}>
                <FileText size={14} color={colors.textSecondary} />
                <Text variant="bodySm" color="secondary" style={{ flex: 1 }}>
                  {seller.legal_name}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {(hasAddress || hasContact) && (
        <View style={styles.twoCol}>
          {hasAddress ? <AddressBlock seller={seller} accent={accent} /> : null}
          {hasContact ? <ContactBlock seller={seller} accent={accent} /> : null}
        </View>
      )}

      {!hasAddress && !hasContact ? (
        <Text variant="bodyMd" color="secondary">
          {t('seller.noExtraContact')}
        </Text>
      ) : null}

      <ComplianceBlock seller={seller} accent={accent} />
    </View>
  );
}

function PremiumLayout({ seller }: { seller: SellerProfile }) {
  const { t } = useTranslation();
  const { colors, radius, spacing } = useTheme();
  const themeKey = seller.profile_theme ?? 'neutral';
  const accent = getSellerThemeAccent(themeKey, colors.brandPrimary);
  const [g0, g1] = getSellerPremiumHeaderGradient(themeKey);
  const headerUrl = resolveImageUrl(seller.header_background_url ?? null);
  const logoUrl = resolveImageUrl(seller.logo_url ?? null);
  const reviews = Array.isArray(seller.company_reviews) ? seller.company_reviews : [];
  const hasAddress = !!(seller.city || seller.address || seller.country);
  const hasContact = !!(seller.phone || seller.email || seller.website);

  return (
    <View style={{ gap: spacing.md }}>
      <View style={[styles.premiumHeaderWrap, { borderRadius: radius.lg, overflow: 'hidden' }]}>
        {headerUrl ? (
          <Image source={{ uri: headerUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bgTertiary }]} />
        )}
        <LinearGradient colors={[g0, g1]} style={StyleSheet.absoluteFill} />
        <View style={{ padding: spacing.lg, minHeight: 160, justifyContent: 'flex-end' }}>
          <View style={styles.premiumHeaderInner}>
            <View style={[styles.premiumLogo, { backgroundColor: 'rgba(255,255,255,0.92)' }]}>
              {logoUrl ? (
                <Image source={{ uri: logoUrl }} style={styles.premiumLogoImg} contentFit="contain" />
              ) : (
                <Store size={36} color={accent} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="headingMd" style={{ color: '#fff' }}>
                {seller.name}
              </Text>
              {seller.legal_name && seller.legal_name !== seller.name ? (
                <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>
                  {seller.legal_name}
                </Text>
              ) : null}
              {seller.company_rating_avg != null && seller.company_rating_avg > 0 ? (
                <View style={styles.ratingRow}>
                  <Star size={14} color="#fbbf24" fill="#fbbf24" />
                  <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.95)', fontWeight: '600' }}>
                    {seller.company_rating_avg.toFixed(1)}
                  </Text>
                  <Text variant="bodySm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    ({reviews.length}{' '}
                    {reviews.length === 1 ? t('seller.reviewSingular') : t('seller.reviewsPlural')})
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      {seller.profile_description ? (
        <SectionCard title={t('seller.aboutUs')} titleColor={accent} iconColor={accent}>
          <Text variant="bodyMd" color="secondary">
            {seller.profile_description}
          </Text>
        </SectionCard>
      ) : null}

      {seller.profile_services ? (
        <SectionCard title={t('seller.companyServices')} titleColor={accent} icon={Zap} iconColor={accent}>
          <Text variant="bodyMd" color="secondary">
            {seller.profile_services}
          </Text>
        </SectionCard>
      ) : null}

      <SectionCard title={t('seller.videoGallery')} titleColor={accent} iconColor={accent}>
        <View style={styles.galleryGrid}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.galleryCell,
                {
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.borderDefault,
                  borderRadius: radius.md,
                },
              ]}
            >
              <ImageIcon size={28} color={colors.textTertiary} />
            </View>
          ))}
        </View>
      </SectionCard>

      {reviews.length > 0 ? (
        <SectionCard title={t('seller.companyReviews')} titleColor={accent} icon={Star} iconColor={accent}>
          <View style={{ gap: spacing.md }}>
            {reviews.map((r, idx) => (
              <View
                key={r.id}
                style={{
                  paddingBottom: idx < reviews.length - 1 ? spacing.md : 0,
                  borderBottomWidth: idx < reviews.length - 1 ? 1 : 0,
                  borderBottomColor: colors.borderDefault,
                }}
              >
                <View style={styles.reviewHead}>
                  <Text variant="bodyMd" style={{ fontWeight: '600' }}>
                    {r.author_name}
                  </Text>
                  <StarRating rating={r.rating} size={12} />
                </View>
                <Text variant="bodySm" color="secondary" style={{ marginTop: 4 }}>
                  {r.content}
                </Text>
              </View>
            ))}
          </View>
        </SectionCard>
      ) : null}

      {seller.profile_certificates ? (
        <SectionCard title={t('seller.certificates')} titleColor={accent} icon={Award} iconColor={accent}>
          <Text variant="bodyMd" color="secondary">
            {seller.profile_certificates}
          </Text>
        </SectionCard>
      ) : null}

      {seller.profile_quality_control ? (
        <SectionCard
          title={t('seller.qualityControl')}
          titleColor={accent}
          icon={ClipboardCheck}
          iconColor={accent}
        >
          <Text variant="bodyMd" color="secondary">
            {seller.profile_quality_control}
          </Text>
        </SectionCard>
      ) : null}

      {seller.profile_trade_experience ? (
        <SectionCard title={t('seller.tradeExperience')} titleColor={accent} icon={Briefcase} iconColor={accent}>
          <Text variant="bodyMd" color="secondary">
            {seller.profile_trade_experience}
          </Text>
        </SectionCard>
      ) : null}

      {seller.profile_capabilities ? (
        <SectionCard title={t('seller.capabilities')} titleColor={accent} icon={Zap} iconColor={accent}>
          <Text variant="bodyMd" color="secondary">
            {seller.profile_capabilities}
          </Text>
        </SectionCard>
      ) : null}

      {(hasAddress || hasContact) && (
        <View style={styles.twoCol}>
          {hasAddress ? <AddressBlock seller={seller} accent={accent} /> : null}
          {hasContact ? <ContactBlock seller={seller} accent={accent} /> : null}
        </View>
      )}

      <ComplianceBlock seller={seller} accent={accent} />
    </View>
  );
}

export function SellerAboutContent({ seller }: SellerAboutContentProps) {
  if (seller.is_premium_plus) {
    return <PremiumLayout seller={seller} />;
  }
  return <StandardLayout seller={seller} />;
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 0,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  heroCard: {},
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  twoCol: {
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dl: {
    gap: 8,
  },
  dt: {
    fontWeight: '600',
    marginTop: 4,
  },
  dd: {
    marginLeft: 0,
    marginBottom: 4,
  },
  premiumHeaderWrap: {
    position: 'relative',
    minHeight: 160,
  },
  premiumHeaderInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 14,
  },
  premiumLogo: {
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  premiumLogoImg: {
    width: '100%',
    height: '100%',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  galleryCell: {
    width: '47%',
    aspectRatio: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
});
