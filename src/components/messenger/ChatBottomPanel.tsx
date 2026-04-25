import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import { EmojiKeyboard } from 'rn-emoji-keyboard';
import type { EmojiType } from 'rn-emoji-keyboard';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';

interface ChatBottomPanelProps {
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

export function ChatBottomPanel({ onClose, onEmojiSelect }: ChatBottomPanelProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();

  const handleEmojiSelected = useCallback(
    (emojiObject: EmojiType) => {
      onEmojiSelect(emojiObject.emoji);
    },
    [onEmojiSelect],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgPrimary, borderTopColor: colors.borderDefault }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
        <Text variant="caption" style={{ color: colors.textSecondary, fontWeight: '600' }}>
          {t('messenger.emoji')}
        </Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={onClose} hitSlop={8} style={{ padding: 6 }} accessibilityRole="button">
          <X size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={{ height: 280 }}>
        <EmojiKeyboard
          onEmojiSelected={handleEmojiSelected}
          enableSearchBar={false}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
