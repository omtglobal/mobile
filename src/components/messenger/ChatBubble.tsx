import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Check, CheckCheck, Languages } from 'lucide-react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import { ProductMessageCard } from './ProductMessageCard';
import type { Message } from '~/types/messaging';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const { colors, spacing, radius } = useTheme();
  const [showOriginal, setShowOriginal] = useState(false);

  const hasTranslation = !isOwn && !!message.translated_content && message.translated_content !== message.content;
  const displayContent = hasTranslation && !showOriginal
    ? message.translated_content!
    : (message.content ?? '');

  if (message.type === 'system') {
    return (
      <View style={[styles.systemContainer, { paddingVertical: spacing.sm }]}>
        <View
          style={[
            styles.systemPill,
            { backgroundColor: colors.bgSecondary, borderRadius: radius.full },
          ]}
        >
          <Text variant="caption" color="tertiary" style={styles.systemText}>
            {message.content ?? ''}
          </Text>
        </View>
      </View>
    );
  }

  if (message.type === 'sticker') {
    const emoji = message.metadata?.sticker_emoji ?? message.content ?? '';
    return (
      <View
        style={[
          styles.row,
          { justifyContent: isOwn ? 'flex-end' : 'flex-start', paddingHorizontal: spacing.lg },
        ]}
      >
        <View style={styles.bubbleOuter}>
          <View style={styles.stickerBubble}>
            <Text style={styles.stickerEmoji}>{emoji}</Text>
          </View>
          <View style={[styles.meta, isOwn ? styles.metaOwn : styles.metaOther]}>
            <Text variant="caption" color="tertiary">
              {formatTime(message.created_at)}
            </Text>
            {isOwn && message.status !== 'sending' && (
              message.status === 'read' ? (
                <CheckCheck size={14} color={colors.brandPrimary} style={{ marginLeft: 4 }} />
              ) : (
                <Check size={14} color={colors.textTertiary} style={{ marginLeft: 4 }} />
              )
            )}
          </View>
        </View>
      </View>
    );
  }

  if (message.type === 'gif') {
    const gifUrl = message.metadata?.gif_url;
    const previewUrl = message.metadata?.gif_preview_url;
    const w = message.metadata?.gif_width ?? 200;
    const h = message.metadata?.gif_height ?? 150;
    const aspect = w / h;
    const displayW = Math.min(220, w);
    const displayH = displayW / aspect;

    return (
      <View
        style={[
          styles.row,
          { justifyContent: isOwn ? 'flex-end' : 'flex-start', paddingHorizontal: spacing.lg },
        ]}
      >
        <View style={styles.bubbleOuter}>
          {gifUrl ? (
            <Image
              source={{ uri: previewUrl ?? gifUrl }}
              style={{ width: displayW, height: displayH, borderRadius: radius.lg }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: displayW,
                height: displayH,
                borderRadius: radius.lg,
                backgroundColor: colors.bgSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="caption" color="tertiary">GIF</Text>
            </View>
          )}
          <View style={[styles.meta, isOwn ? styles.metaOwn : styles.metaOther]}>
            <Text variant="caption" color="tertiary">
              {formatTime(message.created_at)}
            </Text>
            {isOwn && message.status !== 'sending' && (
              message.status === 'read' ? (
                <CheckCheck size={14} color={colors.brandPrimary} style={{ marginLeft: 4 }} />
              ) : (
                <Check size={14} color={colors.textTertiary} style={{ marginLeft: 4 }} />
              )
            )}
          </View>
        </View>
      </View>
    );
  }

  const ownBubbleBg = colors.brandPrimary;
  const otherBubbleBg = colors.bgSecondary;
  const bubbleBg = isOwn ? ownBubbleBg : otherBubbleBg;

  return (
    <View
      style={[
        styles.row,
        { justifyContent: isOwn ? 'flex-end' : 'flex-start', paddingHorizontal: spacing.lg },
      ]}
    >
      <View style={[styles.bubbleOuter, { maxWidth: '78%' }]}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: bubbleBg,
              borderRadius: radius.lg,
              padding: spacing.md,
              borderBottomRightRadius: isOwn ? radius.sm : radius.lg,
              borderBottomLeftRadius: isOwn ? radius.lg : radius.sm,
            },
          ]}
        >
          {message.type === 'text' && (
            <>
              <Text
                variant="bodyMd"
                style={{ color: isOwn ? '#FFFFFF' : colors.textPrimary }}
              >
                {displayContent}
              </Text>
              {hasTranslation && (
                <Pressable
                  onPress={() => setShowOriginal((v) => !v)}
                  style={styles.translatedLabel}
                  hitSlop={8}
                >
                  <Languages size={11} color={isOwn ? 'rgba(255,255,255,0.6)' : colors.textTertiary} />
                  <Text
                    variant="caption"
                    style={{ color: isOwn ? 'rgba(255,255,255,0.6)' : colors.textTertiary, marginLeft: 3, fontSize: 10 }}
                  >
                    {showOriginal ? 'Show translation' : 'Translated'}
                  </Text>
                </Pressable>
              )}
            </>
          )}

          {message.type === 'image' && message.metadata?.image_url && (
            <Image
              source={{ uri: message.metadata.image_url }}
              style={[styles.messageImage, { borderRadius: radius.md }]}
              resizeMode="cover"
            />
          )}

          {message.type === 'product' && message.metadata && (
            <ProductMessageCard metadata={message.metadata} />
          )}
        </View>

        <View
          style={[
            styles.meta,
            isOwn ? styles.metaOwn : styles.metaOther,
            { marginTop: spacing.xs, paddingHorizontal: spacing.sm },
          ]}
        >
          <Text variant="caption" color="tertiary">
            {formatTime(message.created_at)}
          </Text>
          {isOwn && message.status !== 'sending' && (
            message.status === 'read' ? (
              <CheckCheck size={14} color={colors.brandPrimary} style={{ marginLeft: 4 }} />
            ) : (
              <Check size={14} color={colors.textTertiary} style={{ marginLeft: 4 }} />
            )
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 3,
    width: '100%',
  },
  bubbleOuter: {},
  bubble: {
    overflow: 'hidden',
  },
  systemContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  systemPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  systemText: {
    textAlign: 'center',
  },
  stickerBubble: {
    alignItems: 'center',
  },
  stickerEmoji: {
    fontSize: 56,
  },
  messageImage: {
    width: 200,
    height: 150,
  },
  translatedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaOwn: {
    justifyContent: 'flex-end',
  },
  metaOther: {
    justifyContent: 'flex-start',
  },
});
