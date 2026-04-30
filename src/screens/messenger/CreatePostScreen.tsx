import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image as ImageIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { HeaderBackButton, Text } from '~/components/ui';
import { useCreateChannelPostMutation } from '~/lib/hooks/useMessaging';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';

type PostRoute = RouteProp<MessengerStackParamList, 'MessengerCreatePost'>;
type Nav = NativeStackNavigationProp<MessengerStackParamList, 'MessengerCreatePost'>;

const CONTENT_MAX = 5000;

export function CreatePostScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<PostRoute>();
  const { channelId } = route.params;

  const [content, setContent] = useState('');

  const createPost = useCreateChannelPostMutation(channelId);
  const canPublish = content.trim().length > 0 && !createPost.isPending;

  const handlePublish = useCallback(async () => {
    if (!canPublish) return;
    try {
      await createPost.mutateAsync({ content: content.trim() });
      navigation.goBack();
    } catch {
      // handled by react-query
    }
  }, [canPublish, createPost, content, navigation]);

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
        <HeaderBackButton onPress={() => navigation.goBack()} style={styles.backButton} />
        <Text variant="headingSm" color="primary" style={styles.flex}>
          {t('messenger.new_post', 'New Post')}
        </Text>
        <Pressable
          onPress={handlePublish}
          disabled={!canPublish}
          style={[
            styles.publishBtn,
            {
              backgroundColor: canPublish ? colors.brandPrimary : colors.bgTertiary,
              borderRadius: radius.md,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
            },
          ]}
        >
          <Text
            variant="bodyMd"
            style={{ color: canPublish ? '#FFFFFF' : colors.textTertiary, fontWeight: '600' }}
          >
            {t('messenger.publish', 'Publish')}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Content input */}
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <TextInput
            value={content}
            onChangeText={(v) => setContent(v.slice(0, CONTENT_MAX))}
            placeholder={t('messenger.post_placeholder', "What's on your mind?")}
            placeholderTextColor={colors.textTertiary}
            maxLength={CONTENT_MAX}
            multiline
            textAlignVertical="top"
            autoFocus
            style={[styles.contentInput, { color: colors.textPrimary, minHeight: 200 }]}
          />

          {/* Character counter */}
          <View style={[styles.counterRow, { marginTop: spacing.sm }]}>
            <Text
              variant="caption"
              style={{ color: content.length >= CONTENT_MAX ? colors.error : colors.textTertiary }}
            >
              {content.length}/{CONTENT_MAX}
            </Text>
          </View>
        </View>

        {/* Add image button */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Pressable
            style={[
              styles.addImageBtn,
              {
                backgroundColor: colors.bgSecondary,
                borderColor: colors.borderDefault,
                borderRadius: radius.lg,
                padding: spacing.lg,
              },
            ]}
          >
            <ImageIcon size={22} color={colors.textSecondary} />
            <Text variant="bodyMd" color="secondary" style={{ marginLeft: spacing.sm }}>
              {t('messenger.add_image', 'Add image')}
            </Text>
          </Pressable>
        </View>

        {/* Preview section */}
        {content.trim().length > 0 && (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
            <Text variant="headingSm" color="secondary" style={{ marginBottom: spacing.md }}>
              {t('messenger.preview', 'Preview')}
            </Text>
            <View
              style={[
                styles.previewCard,
                { backgroundColor: colors.bgSecondary, borderRadius: radius.lg, padding: spacing.lg },
              ]}
            >
              <Text variant="bodyMd" color="primary">{content}</Text>
              <View style={[styles.previewFooter, { marginTop: spacing.md, borderTopColor: colors.borderDefault }]}>
                <Text variant="caption" color="tertiary" style={{ paddingTop: spacing.md }}>
                  {t('messenger.just_now', 'Just now')}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  backButton: { padding: 4, marginRight: 4 },
  publishBtn: { alignItems: 'center', justifyContent: 'center' },
  contentInput: { fontSize: 16, lineHeight: 24 },
  counterRow: { alignItems: 'flex-end' },
  addImageBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderStyle: 'dashed' },
  previewCard: { overflow: 'hidden' },
  previewFooter: { borderTopWidth: StyleSheet.hairlineWidth },
});
