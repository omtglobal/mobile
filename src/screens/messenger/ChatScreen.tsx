import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import {
  ChatBubble,
  ChatWallpaper,
  ChatBottomPanel,
  DateDivider,
  MessageInput,
  MessengerLoginPrompt,
  TypingIndicator,
} from '~/components/messenger';
import type { MessageInputRef, BottomPanelTab } from '~/components/messenger';
import {
  useConversation,
  useMessages,
  useMarkReadMutation,
  useSendMessageMutation,
} from '~/lib/hooks/useMessaging';
import { useAuth } from '~/lib/hooks/useAuth';
import {
  EMPTY_TYPING_NAMES,
  useMessagingStore,
} from '~/lib/stores/messaging';
import { usePreferencesStore } from '~/lib/stores/preferences';
import { findWallpaper } from '~/constants/wallpapers';
import { isAuthHttpError } from '~/lib/utils/authErrors';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';
import type { Message } from '~/types/messaging';

type ChatRoute = RouteProp<MessengerStackParamList, 'MessengerChat'>;
type Nav = NativeStackNavigationProp<MessengerStackParamList, 'MessengerChat'>;

interface ListItem {
  key: string;
  type: 'message' | 'date';
  message?: Message;
  date?: string;
}

function isSameDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function ChatScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ChatRoute>();
  const { conversationId } = route.params;
  const { isAuthenticated, isHydrated, user } = useAuth();

  const listRef = useRef<FlatList<ListItem>>(null);
  const inputRef = useRef<MessageInputRef>(null);
  const [panelTab, setPanelTab] = useState<BottomPanelTab | null>(null);

  const chatWallpaperId = usePreferencesStore((s) => s.chatWallpaperId);
  const wallpaper = useMemo(() => findWallpaper(chatWallpaperId ?? undefined), [chatWallpaperId]);

  const {
    data: conversationRes,
    isLoading: convLoading,
    isError: convError,
    error: convErr,
  } = useConversation(conversationId);

  const {
    data: messages,
    isLoading: msgLoading,
    isError: msgError,
    error: msgErr,
    refetch: refetchMessages,
    isFetching: msgFetching,
  } = useMessages(conversationId);

  const markRead = useMarkReadMutation();
  const sendMessage = useSendMessageMutation(conversationId);

  const typingNames = useMessagingStore(
    (s) => s.typingMap[conversationId] ?? EMPTY_TYPING_NAMES,
  );

  const conversation = conversationRes?.data;

  const participantName = useMemo(() => {
    if (!conversation) return '';
    if (conversation.company) return conversation.company.name;
    const other = conversation.participants.find((p) => p.id !== user?.id);
    return other?.name ?? '';
  }, [conversation, user?.id]);

  const isOnline = useMemo(() => {
    if (!conversation) return false;
    const other = conversation.participants.find((p) => p.id !== user?.id);
    return other?.is_online ?? false;
  }, [conversation, user?.id]);

  const otherParticipantId = useMemo(() => {
    if (!conversation) return undefined;
    const other = conversation.participants.find((p) => p.id !== user?.id);
    return other?.id;
  }, [conversation, user?.id]);

  const listItems = useMemo<ListItem[]>(() => {
    if (!messages) return [];
    const items: ListItem[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at)) {
        items.push({ key: `date-${msg.created_at}`, type: 'date', date: msg.created_at });
      }
      items.push({ key: msg.id, type: 'message', message: msg });
    }
    return items;
  }, [messages]);

  useEffect(() => {
    if (conversationId && isAuthenticated) {
      markRead.mutate(conversationId);
    }
  }, [conversationId, isAuthenticated, messages?.length]);

  useEffect(() => {
    if (listItems.length > 0) {
      const timer = setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [listItems.length]);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage.mutate({ type: 'text', content: text });
      setPanelTab(null);
    },
    [sendMessage],
  );

  const handleStickerSelect = useCallback(
    (emoji: string) => {
      sendMessage.mutate({
        type: 'sticker',
        content: emoji,
        metadata: { sticker_emoji: emoji },
      });
      setPanelTab(null);
    },
    [sendMessage],
  );

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      inputRef.current?.insertText(emoji);
    },
    [],
  );

  const handlePanelPress = useCallback(() => {
    setPanelTab((prev) => (prev ? null : 'stickers'));
  }, []);

  const handleEmojiPress = useCallback(() => {
    setPanelTab((prev) => (prev === 'emoji' ? null : 'emoji'));
  }, []);

  const handleContactProfile = useCallback(() => {
    if (otherParticipantId) {
      navigation.navigate('MessengerContactProfile' as any, { userId: otherParticipantId });
    }
  }, [navigation, otherParticipantId]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'date') {
        return <DateDivider date={item.date!} />;
      }
      const msg = item.message!;
      const uid = user?.id;
      const isOwn =
        msg.sender_id === '__self__' ||
        (uid != null && String(msg.sender_id) === String(uid));
      return <ChatBubble message={msg} isOwn={isOwn} />;
    },
    [user?.id],
  );

  const keyExtractor = useCallback((item: ListItem) => item.key, []);

  if (!isHydrated) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bgPrimary }]}>
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }

  if (!isAuthenticated || ((convError || msgError) && isAuthHttpError(convErr ?? msgErr))) {
    return <MessengerLoginPrompt />;
  }

  const isLoading = convLoading || msgLoading;

  return (
    <View style={[styles.flex, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.sm,
            borderBottomColor: colors.borderDefault,
          },
        ]}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>

        <Pressable onPress={handleContactProfile} style={styles.headerInfo}>
          <View style={styles.headerAvatarWrap}>
            <View style={[styles.headerAvatar, { backgroundColor: colors.bgTertiary }]}>
              <Text variant="headingSm" style={{ color: colors.textPrimary }}>
                {participantName.charAt(0).toUpperCase()}
              </Text>
            </View>
            {isOnline && (
              <View
                style={[
                  styles.headerOnlineDot,
                  { backgroundColor: colors.success, borderColor: colors.bgPrimary },
                ]}
              />
            )}
          </View>
          <View style={styles.headerTextWrap}>
            <Text variant="headingSm" color="primary" numberOfLines={1}>
              {participantName}
            </Text>
            {isOnline && (
              <Text variant="caption" style={{ color: colors.brandPrimary }}>
                {t('messenger.online')}
              </Text>
            )}
          </View>
        </Pressable>

        <View style={styles.headerRightActions}>
          <Pressable
            hitSlop={8}
            style={[styles.headerActionBtn, { borderRadius: radius.lg }]}
          >
            <Phone size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            hitSlop={8}
            style={[styles.headerActionBtn, { borderRadius: radius.lg }]}
          >
            <Video size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            hitSlop={8}
            style={[styles.headerActionBtn, { borderRadius: radius.lg }]}
          >
            <MoreVertical size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      ) : (convError || msgError) ? (
        <View style={styles.centered}>
          <Text variant="bodyMd" color="secondary" style={{ marginBottom: spacing.md }}>
            {t('messenger.error_loading')}
          </Text>
          <Pressable onPress={() => refetchMessages()}>
            <Text variant="bodyMd" color="brand">
              {t('messenger.retry')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <ChatWallpaper wallpaper={wallpaper} fallbackColor={colors.bgPrimary}>
          <FlatList
            ref={listRef}
            data={listItems}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={{ paddingVertical: spacing.sm }}
          ListHeaderComponent={
            msgFetching && !msgLoading ? (
              <View style={{ paddingVertical: spacing.md, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.brandPrimary} />
              </View>
            ) : null
          }
          ListFooterComponent={
            <TypingIndicator names={typingNames} />
          }
        />
        </ChatWallpaper>
      )}

      {/* Bottom Panel (Emoji / Stickers) */}
      {panelTab != null && (
        <ChatBottomPanel
          activeTab={panelTab}
          onTabChange={setPanelTab}
          onClose={() => setPanelTab(null)}
          onEmojiSelect={handleEmojiSelect}
          onStickerSelect={handleStickerSelect}
        />
      )}

      {/* Input */}
      <View style={{ paddingBottom: insets.bottom }}>
        <MessageInput
          ref={inputRef}
          onSend={handleSend}
          disabled={sendMessage.isPending}
          onPanelPress={handlePanelPress}
          onEmojiPress={handleEmojiPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    marginRight: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatarWrap: {
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerActionBtn: {
    padding: 8,
  },
});
