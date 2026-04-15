import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Paperclip, Send, Mic, Smile, Sticker } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { usePreferencesStore } from '~/lib/stores/preferences';
import { resolveFontFamily } from '~/constants/fonts';

export interface MessageInputRef {
  insertText: (text: string) => void;
}

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  onPanelPress?: () => void;
  onEmojiPress?: () => void;
  onAttachPress?: () => void;
}

export const MessageInput = React.forwardRef<MessageInputRef, MessageInputProps>(
  function MessageInput(
    { onSend, disabled = false, onPanelPress, onEmojiPress, onAttachPress },
    ref,
  ) {
    const { t } = useTranslation();
    const { colors, spacing, radius } = useTheme();
    const fontId = usePreferencesStore((s) => s.fontId);
    const inputFont = resolveFontFamily(fontId, '400');
    const [text, setText] = useState('');

    useImperativeHandle(ref, () => ({
      insertText: (t: string) => setText((prev) => prev + t),
    }));

    const canSend = text.trim().length > 0 && !disabled;

    const handleSend = useCallback(() => {
      const trimmed = text.trim();
      if (!trimmed) return;
      onSend(trimmed);
      setText('');
    }, [text, onSend]);

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.bgPrimary,
            borderTopColor: colors.borderDefault,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <Pressable
          onPress={onAttachPress}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: pressed ? colors.bgTertiary : colors.bgSecondary,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Paperclip size={20} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          onPress={onPanelPress}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: pressed ? colors.bgTertiary : colors.bgSecondary,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Sticker size={20} color={colors.textSecondary} />
        </Pressable>

        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.bgSecondary,
              borderRadius: radius.lg,
            },
          ]}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('messenger.input_placeholder')}
            placeholderTextColor={colors.textTertiary}
            editable={!disabled}
            multiline
            maxLength={2000}
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                paddingLeft: spacing.md,
                paddingRight: 40,
                paddingVertical: spacing.sm,
                fontFamily: inputFont,
              },
            ]}
          />
          <Pressable
            onPress={onEmojiPress}
            style={[styles.emojiInsideBtn, { right: spacing.xs }]}
            hitSlop={6}
          >
            <Smile size={20} color={colors.textTertiary} />
          </Pressable>
        </View>

        {canSend ? (
          <Pressable
            onPress={handleSend}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: pressed ? colors.brandPrimary + 'DD' : colors.brandPrimary,
                borderRadius: radius.lg,
              },
            ]}
            accessibilityLabel={t('messenger.send')}
          >
            <Send size={18} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable
            style={[
              styles.sendButton,
              {
                backgroundColor: colors.bgSecondary,
                borderRadius: radius.lg,
              },
            ]}
          >
            <Mic size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    maxHeight: 100,
    fontSize: 15,
    lineHeight: 20,
  },
  emojiInsideBtn: {
    position: 'absolute',
    bottom: 10,
    padding: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
