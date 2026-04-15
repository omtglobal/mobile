import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ArrowLeft,
  Search,
  Star,
  Smile,
  ThumbsUp,
  Heart,
  Flame,
  Sparkles,
  X,
  Send,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import { useSendMessageMutation } from '~/lib/hooks/useMessaging';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';

type Nav = NativeStackNavigationProp<MessengerStackParamList, 'MessengerStickers'>;
type StickersRoute = RouteProp<MessengerStackParamList, 'MessengerStickers'>;

const CATEGORY_ICONS = {
  Star,
  Smile,
  ThumbsUp,
  Heart,
  Flame,
  Sparkles,
} as const;

const STICKER_CATEGORIES = [
  { id: 'popular', name: 'Popular', icon: 'Star' as const },
  { id: 'emotions', name: 'Emotions', icon: 'Smile' as const },
  { id: 'reactions', name: 'Reactions', icon: 'ThumbsUp' as const },
  { id: 'love', name: 'Love', icon: 'Heart' as const },
  { id: 'fire', name: 'Fire', icon: 'Flame' as const },
  { id: 'special', name: 'Special', icon: 'Sparkles' as const },
];

const STICKER_DATA: Record<string, string[]> = {
  popular: ['😍','😂','🥰','😊','🔥','👍','❤️','✨','🎉','💯','👏','🙌','💪','🤗','😎','🤩'],
  emotions: ['😊','😂','🥺','😢','😭','😤','😡','🥱','😴','🤔','😬','😳','🙄','😌','😑','🤨'],
  reactions: ['👍','👎','👏','🙌','🤝','✌️','🤘','👌','🤙','💪','🙏','👀','🔥','💯','✅','❌'],
  love: ['❤️','💕','💖','💗','💓','💞','💝','💘','😍','🥰','😘','💋','🌹','💐','💑','💏'],
  fire: ['🔥','💥','⚡','💫','⭐','🌟','✨','💎','👑','🏆','🎯','🚀','💪','🦁','🐯','🌶️'],
  special: ['✨','🎉','🎊','🎈','🎁','🎂','🍰','🎵','🎶','🎸','☕','🍕','🍔','🍟','🌈','🦄'],
};

const NUM_COLUMNS = 4;

export function StickersScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<StickersRoute>();
  const conversationId = route.params?.conversationId;

  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const sendMessage = conversationId
    ? useSendMessageMutation(conversationId)
    : null;

  const stickers = useMemo(() => {
    const data = STICKER_DATA[selectedCategory] ?? [];
    if (!searchText.trim()) return data;
    return data.filter((s) => s.includes(searchText));
  }, [selectedCategory, searchText]);

  const handleSend = useCallback(() => {
    if (!selectedSticker) return;
    if (sendMessage && conversationId) {
      sendMessage.mutate({
        type: 'sticker',
        content: selectedSticker,
        metadata: { sticker_emoji: selectedSticker },
      });
    }
    navigation.goBack();
  }, [selectedSticker, sendMessage, conversationId, navigation]);

  const renderSticker = useCallback(
    ({ item }: { item: string }) => (
      <Pressable
        onPress={() => setSelectedSticker(item)}
        style={({ pressed }) => [
          styles.stickerCell,
          {
            borderRadius: radius.lg,
            backgroundColor:
              selectedSticker === item
                ? colors.brandPrimary + '15'
                : 'transparent',
            borderWidth: selectedSticker === item ? 2 : 0,
            borderColor: selectedSticker === item ? colors.brandPrimary : 'transparent',
            transform: [{ scale: pressed ? 0.85 : 1 }],
          },
        ]}
      >
        <Text style={styles.stickerEmoji}>{item}</Text>
      </Pressable>
    ),
    [selectedSticker, colors.brandPrimary, radius.lg],
  );

  const keyExtractor = useCallback(
    (item: string, index: number) => `${selectedCategory}-${index}`,
    [selectedCategory],
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
            borderBottomColor: colors.borderDefault,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{ padding: 4 }}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text variant="headingLg" color="primary">
              {t('messenger.stickers', 'Stickers')}
            </Text>
            <Text variant="caption" color="secondary">
              {t('messenger.stickers_subtitle', 'Choose a sticker to send')}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.bgSecondary,
              borderRadius: radius.lg,
              marginTop: spacing.md,
            },
          ]}
        >
          <Search size={20} color={colors.textTertiary} style={{ marginLeft: spacing.md }} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('messenger.search_stickers', 'Search stickers...')}
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.searchInput,
              {
                color: colors.textPrimary,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.md,
              },
            ]}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} style={{ paddingRight: spacing.md }}>
              <X size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.categoryRow,
          { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
        ]}
      >
        {STICKER_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const IconComponent = CATEGORY_ICONS[cat.icon];
          return (
            <Pressable
              key={cat.id}
              onPress={() => {
                setSelectedCategory(cat.id);
                setSelectedSticker(null);
              }}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: isActive ? colors.brandPrimary : colors.bgSecondary,
                  borderRadius: radius.full,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  gap: 6,
                },
              ]}
            >
              <IconComponent
                size={16}
                color={isActive ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                variant="caption"
                style={{
                  color: isActive ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: '600',
                }}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Stickers grid */}
      <FlatList
        data={stickers}
        renderItem={renderSticker}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: selectedSticker ? 80 + insets.bottom : insets.bottom + spacing.lg,
        }}
        columnWrapperStyle={styles.gridRow}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text variant="bodyMd" color="secondary">
              {t('messenger.no_stickers_found', 'No stickers found')}
            </Text>
          </View>
        }
      />

      {/* Selected sticker bar */}
      {selectedSticker && (
        <View
          style={[
            styles.sendBar,
            {
              paddingBottom: insets.bottom + spacing.sm,
              paddingTop: spacing.md,
              paddingHorizontal: spacing.lg,
              backgroundColor: colors.bgPrimary,
              borderTopColor: colors.borderDefault,
            },
          ]}
        >
          <View
            style={[
              styles.stickerPreview,
              { backgroundColor: colors.bgSecondary, borderRadius: radius.lg },
            ]}
          >
            <Text style={styles.previewEmoji}>{selectedSticker}</Text>
          </View>
          <Pressable
            onPress={handleSend}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: pressed
                  ? colors.brandPrimary + 'DD'
                  : colors.brandPrimary,
                borderRadius: radius.lg,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.md,
                gap: spacing.sm,
              },
            ]}
          >
            <Send size={18} color="#FFFFFF" />
            <Text variant="bodySm" style={{ color: '#FFFFFF', fontWeight: '600' }}>
              {t('messenger.send', 'Send')}
            </Text>
          </Pressable>
        </View>
      )}
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
    paddingTop: 60,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridRow: {
    justifyContent: 'flex-start',
  },
  stickerCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '25%',
  },
  stickerEmoji: {
    fontSize: 48,
  },
  sendBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  stickerPreview: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmoji: {
    fontSize: 36,
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
