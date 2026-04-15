import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ExternalLink } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import type { MessageMetadata } from '~/types/messaging';

interface ProductMessageCardProps {
  metadata: MessageMetadata;
}

export function ProductMessageCard({ metadata }: ProductMessageCardProps) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    if (metadata.product_id) {
      router.push(`/product/${metadata.product_id}`);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.bgPrimary,
          borderRadius: radius.md,
          borderColor: colors.borderDefault,
        },
      ]}
    >
      {metadata.product_image_url && (
        <Image
          source={{ uri: metadata.product_image_url }}
          style={[styles.image, { borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md }]}
          resizeMode="cover"
        />
      )}
      <View style={{ padding: spacing.md }}>
        {metadata.product_title && (
          <Text variant="bodySm" color="primary" numberOfLines={2} style={{ marginBottom: spacing.xs }}>
            {metadata.product_title}
          </Text>
        )}
        {metadata.product_price && (
          <Text variant="headingSm" style={{ color: colors.brandPrimary, marginBottom: spacing.sm }}>
            {metadata.product_currency ?? '$'}{metadata.product_price}
          </Text>
        )}
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.viewButton,
            {
              backgroundColor: pressed
                ? colors.brandPrimary + 'DD'
                : colors.brandPrimary + '14',
              borderRadius: radius.sm,
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          <ExternalLink size={14} color={colors.brandPrimary} />
          <Text variant="caption" style={{ color: colors.brandPrimary, fontWeight: '600', marginLeft: 4 }}>
            {t('messenger.view_product')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});
