import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Smile, Sticker as StickerIcon, X } from 'lucide-react-native';
import { EmojiKeyboard } from 'rn-emoji-keyboard';
import type { EmojiType } from 'rn-emoji-keyboard';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import { StickerPanel } from './StickerPanel';

export type BottomPanelTab = 'emoji' | 'stickers';

interface ChatBottomPanelProps {
  activeTab: BottomPanelTab;
  onTabChange: (tab: BottomPanelTab) => void;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  onStickerSelect: (emoji: string) => void;
}

const TABS: { id: BottomPanelTab; label: string; Icon: typeof Smile }[] = [
  { id: 'emoji', label: 'Emoji', Icon: Smile },
  { id: 'stickers', label: 'Stickers', Icon: StickerIcon },
];

export function ChatBottomPanel({
  activeTab,
  onTabChange,
  onClose,
  onEmojiSelect,
  onStickerSelect,
}: ChatBottomPanelProps) {
  const { colors, spacing, radius } = useTheme();

  const handleEmojiSelected = useCallback(
    (emojiObject: EmojiType) => {
      onEmojiSelect(emojiObject.emoji);
    },
    [onEmojiSelect],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, borderTopColor: colors.borderDefault }]}>
      {/* Tab bar */}
      <View style={[styles.tabBar, { paddingHorizontal: spacing.md }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              style={[
                styles.tab,
                {
                  borderBottomWidth: isActive ? 2 : 0,
                  borderBottomColor: colors.brandPrimary,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              <tab.Icon
                size={18}
                color={isActive ? colors.brandPrimary : colors.textTertiary}
              />
              <Text
                variant="caption"
                style={{
                  color: isActive ? colors.brandPrimary : colors.textTertiary,
                  fontWeight: isActive ? '600' : '400',
                  marginLeft: 4,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
        <View style={{ flex: 1 }} />
        <Pressable onPress={onClose} hitSlop={8} style={{ padding: 6 }}>
          <X size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Content */}
      {activeTab === 'emoji' && (
        <View style={{ height: 280 }}>
          <EmojiKeyboard
            onEmojiSelected={handleEmojiSelected}
            enableSearchBar
            enableRecentlyUsed
            categoryPosition="top"
            emojiSize={28}
            theme={{
              backdrop: 'transparent',
              knob: colors.borderDefault,
              container: colors.bgPrimary,
              header: colors.textSecondary,
              category: {
                icon: colors.textTertiary,
                iconActive: colors.brandPrimary,
                container: 'transparent',
                containerActive: colors.brandPrimary + '15',
              },
              search: {
                background: colors.bgSecondary,
                text: colors.textPrimary,
                placeholder: colors.textTertiary,
                icon: colors.textTertiary,
              },
              emoji: {
                selected: colors.brandPrimary + '20',
              },
              skinTonesContainer: colors.bgSecondary,
              customButton: {
                icon: colors.textTertiary,
                iconPressed: colors.brandPrimary,
                background: 'transparent',
                backgroundPressed: colors.brandPrimary + '15',
              },
            }}
          />
        </View>
      )}

      {activeTab === 'stickers' && (
        <StickerPanelInline onSelect={onStickerSelect} />
      )}
    </View>
  );
}

function StickerPanelInline({ onSelect }: { onSelect: (emoji: string) => void }) {
  return <StickerPanel onClose={() => {}} onSelect={onSelect} hideHeader />;
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
