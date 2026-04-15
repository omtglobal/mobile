import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { X, Star, Smile, ThumbsUp, Heart, Flame, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';

interface StickerPanelProps {
  onClose: () => void;
  onSelect: (emoji: string) => void;
  hideHeader?: boolean;
}

const CATEGORY_ICONS = { Star, Smile, ThumbsUp, Heart, Flame, Sparkles } as const;

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

const NUM_COLUMNS = 6;

export function StickerPanel({ onClose, onSelect, hideHeader }: StickerPanelProps) {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('popular');

  const stickers = useMemo(
    () => STICKER_DATA[selectedCategory] ?? [],
    [selectedCategory],
  );

  const renderSticker = useCallback(
    ({ item }: { item: string }) => (
      <Pressable
        onPress={() => onSelect(item)}
        style={({ pressed }) => [
          styles.stickerCell,
          {
            borderRadius: radius.lg,
            backgroundColor: pressed ? colors.brandPrimary + '15' : 'transparent',
            transform: [{ scale: pressed ? 0.85 : 1 }],
          },
        ]}
      >
        <Text style={styles.stickerEmoji}>{item}</Text>
      </Pressable>
    ),
    [onSelect, colors.brandPrimary, radius.lg],
  );

  const keyExtractor = useCallback(
    (item: string, index: number) => `${selectedCategory}-${index}`,
    [selectedCategory],
  );

  return (
    <View style={[styles.container, !hideHeader && { backgroundColor: colors.bgPrimary, borderTopColor: colors.borderDefault }]}>
      {/* Tab bar: Stickers + close */}
      {!hideHeader && (
      <View style={[styles.tabBar, { paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]}>
        <Text variant="headingSm" color="primary" style={{ flex: 1 }}>
          {t('messenger.stickers', 'Stickers')}
        </Text>
        <Pressable onPress={onClose} hitSlop={8} style={{ padding: 4 }}>
          <X size={18} color={colors.textSecondary} />
        </Pressable>
      </View>
      )}

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.categoryRow, { paddingHorizontal: spacing.md, gap: spacing.xs }]}
      >
        {STICKER_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const IconComponent = CATEGORY_ICONS[cat.icon];
          return (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: isActive ? colors.brandPrimary + '15' : colors.bgSecondary,
                  borderRadius: radius.md,
                  width: 40,
                  height: 40,
                  borderWidth: isActive ? 2 : 0,
                  borderColor: isActive ? colors.brandPrimary : 'transparent',
                },
              ]}
            >
              <IconComponent
                size={18}
                color={isActive ? colors.brandPrimary : colors.textSecondary}
              />
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Grid */}
      <FlatList
        data={stickers}
        renderItem={renderSticker}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.sm }}
        columnWrapperStyle={styles.gridRow}
        style={{ maxHeight: 220 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  categoryPill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    justifyContent: 'flex-start',
  },
  stickerCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: `${100 / NUM_COLUMNS}%`,
  },
  stickerEmoji: {
    fontSize: 36,
  },
});
