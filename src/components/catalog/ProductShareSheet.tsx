import { useCallback, useMemo } from 'react';
import { Modal, Pressable, Share, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Copy, ExternalLink, Link2, X } from 'lucide-react-native';
import { Text } from '~/components/ui';
import { useToast } from '~/components/ui/Toast';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { productWebUrl } from '~/constants/config';
import { copyTextToClipboard } from '~/lib/utils/copyToClipboard';

type Props = {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
};

export function ProductShareSheet({ visible, onClose, productId, productTitle }: Props) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const url = useMemo(() => productWebUrl(productId), [productId]);

  const handleCopy = useCallback(async () => {
    const result = await copyTextToClipboard(url);
    if (result === 'ok') {
      toast.show(t('product.link_copied'), 'success');
    } else if (result === 'share_fallback') {
      toast.show(t('product.link_share_fallback'), 'info');
    } else {
      toast.show(t('product.copy_failed'), 'error');
    }
  }, [url, toast, t]);

  const handleShare = useCallback(async () => {
    try {
      const message = `${productTitle}\n${url}`;
      await Share.share(
        { title: productTitle, message, url },
        { subject: productTitle }
      );
      onClose();
    } catch {
      /* dismissed */
    }
  }, [onClose, productTitle, url]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.wrap}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.bgPrimary,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <View
            style={[
              styles.header,
              {
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.lg,
                borderBottomColor: colors.borderDefault,
              },
            ]}
          >
            <View style={styles.headerTitleRow}>
              <Link2 size={22} color={colors.brandPrimary} />
              <Text variant="headingMd" color="primary" style={styles.headerTitle}>
                {t('product.share_title')}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel={t('product.share_close')}>
              <X size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View
            style={[
              styles.urlBox,
              {
                marginHorizontal: spacing.lg,
                marginTop: spacing.md,
                backgroundColor: colors.bgSecondary,
                borderRadius: radius.md,
              },
            ]}
          >
            <Text variant="caption" color="secondary" numberOfLines={2} selectable>
              {url}
            </Text>
          </View>

          <Pressable
            onPress={() => void handleCopy()}
            style={({ pressed }) => [
              styles.row,
              { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, opacity: pressed ? 0.85 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('product.copy_link')}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.bgSecondary, borderRadius: radius.full }]}>
              <Copy size={20} color={colors.brandPrimary} />
            </View>
            <Text variant="bodyMd" color="primary" style={styles.rowLabel}>
              {t('product.copy_link')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => void handleShare()}
            style={({ pressed }) => [
              styles.row,
              { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, opacity: pressed ? 0.85 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('product.share_more_apps')}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.bgSecondary, borderRadius: radius.full }]}>
              <ExternalLink size={20} color={colors.brandPrimary} />
            </View>
            <Text variant="bodyMd" color="primary" style={styles.rowLabel}>
              {t('product.share_more_apps')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '55%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
  },
  urlBox: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rowIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontWeight: '600',
  },
});
