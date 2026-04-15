import { useCallback } from 'react';
import { Modal, Pressable, Share, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { ExternalLink, X } from 'lucide-react-native';
import { Text } from '~/components/ui';
import { useTheme } from '~/lib/contexts/ThemeContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  videoId: string;
  videoFilename: string;
  sellerName: string;
  onShareRecorded?: () => void;
};

export function VideoShareSheet({
  visible,
  onClose,
  videoId,
  videoFilename,
  sellerName,
  onShareRecorded,
}: Props) {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const shareExternal = useCallback(async () => {
    try {
      const url = Linking.createURL(`video/${videoId}`);
      const message = `${sellerName} — ${videoFilename}\n${url}`;
      await Share.share({ message, url });
      onShareRecorded?.();
      onClose();
    } catch {
      // user cancelled
    }
  }, [onClose, onShareRecorded, sellerName, videoFilename, videoId]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} onPress={onClose} />
        <View
          style={{
            backgroundColor: '#1A1A1A',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: insets.bottom + spacing.md,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Text variant="headingSm" style={{ color: '#FFFFFF', fontWeight: '700' }}>
              {t('video.share_title')}
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <Pressable
            onPress={() => void shareExternal()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.12)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ExternalLink size={20} color="#FFFFFF" />
            </View>
            <Text variant="bodyMd" style={{ color: '#FFFFFF', fontWeight: '600' }}>
              {t('video.share_other_apps')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
