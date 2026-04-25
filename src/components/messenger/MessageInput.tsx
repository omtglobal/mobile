import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Send, Smile } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { usePreferencesStore } from '~/lib/stores/preferences';
import { resolveFontFamily } from '~/constants/fonts';

export interface MessageInputRef {
  insertText: (text: string) => void;
  focus: () => void;
}

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  onEmojiPress?: () => void;
  /** Fires when the text field is focused (e.g. to close emoji panel and show the soft keyboard). */
  onInputFocus?: () => void;
}

export const MessageInput = React.forwardRef<MessageInputRef, MessageInputProps>(
  function MessageInput({ onSend, disabled = false, onEmojiPress, onInputFocus }, ref) {
    const { t } = useTranslation();
    const { colors, spacing, radius } = useTheme();
    const fontId = usePreferencesStore((s) => s.fontId);
    const inputFont = resolveFontFamily(fontId, '400');
    const [text, setText] = useState('');
    const textInputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      insertText: (s: string) => setText((prev) => prev + s),
      focus: () => textInputRef.current?.focus(),
    }));

    const canSend = text.trim().length > 0 && !disabled;

    const handleSend = useCallback(() => {
      const trimmed = text.trim();
      if (!trimmed) return;
      // Clear before onSend: mutate() sets isPending → parent passes disabled → TextInput
      // editable={false}; on iOS/Android controlled value often won’t clear while not editable.
      setText('');
      onSend(trimmed);
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
            ref={textInputRef}
            value={text}
            onChangeText={setText}
            onFocus={onInputFocus}
            placeholder={t('messenger.input_placeholder')}
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={2000}
            showSoftInputOnFocus
            blurOnSubmit={false}
            keyboardType="default"
            returnKeyType="default"
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                paddingLeft: spacing.md,
                paddingRight: 40,
                paddingVertical: spacing.sm,
                fontFamily: inputFont,
                ...(Platform.OS === 'android' ? { textAlignVertical: 'top' as const } : null),
              },
            ]}
          />
          <Pressable
            onPress={onEmojiPress}
            style={[styles.emojiInsideBtn, { right: spacing.xs }]}
            hitSlop={6}
            accessibilityRole="button"
          >
            <Smile size={20} color={colors.textTertiary} />
          </Pressable>
        </View>

        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={({ pressed }) => [
            styles.sendButton,
            {
              borderRadius: radius.lg,
              backgroundColor: canSend
                ? pressed
                  ? colors.brandPrimary + 'DD'
                  : colors.brandPrimary
                : colors.bgSecondary,
            },
          ]}
          accessibilityLabel={t('messenger.send')}
          accessibilityState={{ disabled: !canSend }}
        >
          <Send size={18} color={canSend ? '#FFFFFF' : colors.textTertiary} />
        </Pressable>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    minHeight: 40,
  },
  input: {
    minHeight: 40,
    maxHeight: 100,
    fontSize: 15,
    lineHeight: 20,
  },
  emojiInsideBtn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
