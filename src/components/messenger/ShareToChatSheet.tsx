import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import { useToast } from '~/components/ui/Toast';
import { useConversations } from '~/lib/hooks/useMessaging';
import { useAuth } from '~/lib/hooks/useAuth';
import { useMainPager } from '~/lib/contexts/MainPagerContext';
import * as messagingApi from '~/lib/api/messaging';
import { MessengerLoginPrompt } from './MessengerLoginPrompt';
import { resolveConversationTitle } from '~/lib/messaging/conversationDisplay';
import type { Conversation } from '~/types/messaging';

interface ShareToChatSheetProps {
  visible: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  productPrice: string;
  productCurrency: string;
  productImageUrl: string | null;
  sellerOwnerUserId: string | null;
}

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function ShareToChatSheet({
  visible,
  onClose,
  productId,
  productTitle,
  productPrice,
  productCurrency,
  productImageUrl,
  sellerOwnerUserId,
}: ShareToChatSheetProps) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuth();
  const { data: conversationsData } = useConversations();
  const { goToMessengerAndChat } = useMainPager();
  const toast = useToast();
  const [sending, setSending] = useState<string | null>(null);

  const conversations: Conversation[] = React.useMemo(() => {
    if (!conversationsData?.data) return [];
    const raw = conversationsData.data;
    return Array.isArray(raw) ? raw : (raw as unknown as { data: Conversation[] }).data ?? [];
  }, [conversationsData]);

  const handleSelect = useCallback(
    async (conversation: Conversation) => {
      if (sending) return;
      setSending(conversation.id);
      try {
        await messagingApi.sendMessage(conversation.id, {
          type: 'product',
          content: productTitle,
          metadata: {
            product_id: productId,
            product_title: productTitle,
            product_price: productPrice,
            product_currency: productCurrency,
            product_image_url: productImageUrl ?? undefined,
          },
        });
        toast.show(t('messenger.share_sent'), 'success');
        onClose();
        goToMessengerAndChat(conversation.id);
      } catch {
        toast.show(t('messenger.share_error'), 'error');
      } finally {
        setSending(null);
      }
    },
    [
      sending, productId, productTitle, productPrice,
      productCurrency, productImageUrl, toast, t,
      onClose, goToMessengerAndChat,
    ],
  );

  const renderConversation = useCallback(
    ({ item }: { item: Conversation }) => {
      const name = resolveConversationTitle(item, user?.id) || t('messenger.chat');
      const initial = name.charAt(0).toUpperCase();
      const avatarBg = getAvatarColor(item.id);
      const isLoading = sending === item.id;

      return (
        <Pressable
          onPress={() => handleSelect(item)}
          disabled={!!sending}
          style={({ pressed }) => [
            styles.convRow,
            {
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              backgroundColor: pressed ? colors.bgSecondary : colors.bgPrimary,
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Text variant="headingSm" style={styles.avatarText}>
              {initial}
            </Text>
          </View>
          <Text variant="bodyMd" color="primary" numberOfLines={1} style={{ flex: 1 }}>
            {name}
          </Text>
        </Pressable>
      );
    },
    [colors, spacing, sending, handleSelect, user?.id, t],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
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
          <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
            <Text variant="headingMd" color="primary">
              {t('messenger.share_to_chat')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View
            style={[
              styles.productPreview,
              {
                marginHorizontal: spacing.lg,
                marginVertical: spacing.md,
                padding: spacing.md,
                backgroundColor: colors.bgSecondary,
                borderRadius: radius.md,
              },
            ]}
          >
            {productImageUrl && (
              <Image
                source={{ uri: productImageUrl }}
                style={[styles.productImage, { borderRadius: radius.sm }]}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text variant="bodySm" color="primary" numberOfLines={2}>
                {productTitle}
              </Text>
              <Text variant="headingSm" style={{ color: colors.brandPrimary, marginTop: 2 }}>
                {productCurrency}{productPrice}
              </Text>
            </View>
          </View>

          {!isAuthenticated ? (
            <View style={{ flex: 1, minHeight: 200 }}>
              <MessengerLoginPrompt />
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(c) => c.id}
              renderItem={renderConversation}
              style={{ maxHeight: 360 }}
              ListEmptyComponent={
                <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                  <Text variant="bodySm" color="secondary">
                    {t('messenger.no_conversations')}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productImage: {
    width: 48,
    height: 48,
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
