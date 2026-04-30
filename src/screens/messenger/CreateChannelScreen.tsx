import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { HeaderBackButton, Text } from '~/components/ui';
import { useCreateChannelMutation } from '~/lib/hooks/useMessaging';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';

type Nav = NativeStackNavigationProp<MessengerStackParamList, 'MessengerCreateChannel'>;

interface Category {
  id: string;
  emoji: string;
  label: string;
}

const CATEGORIES: Category[] = [
  { id: 'general', emoji: '💬', label: 'General' },
  { id: 'tech', emoji: '💻', label: 'Tech' },
  { id: 'design', emoji: '🎨', label: 'Design' },
  { id: 'business', emoji: '💼', label: 'Business' },
  { id: 'education', emoji: '📚', label: 'Education' },
  { id: 'entertainment', emoji: '🎮', label: 'Entertainment' },
];

const NAME_MAX = 50;
const DESC_MAX = 200;

export function CreateChannelScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const createChannel = useCreateChannelMutation();
  const canCreate = name.trim().length > 0 && !createChannel.isPending;

  const handleCreate = useCallback(async () => {
    if (!canCreate) return;
    try {
      const res = await createChannel.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        category: selectedCategory ?? undefined,
      });
      const ch = res?.data;
      if (ch?.id) {
        navigation.replace('MessengerChannelView', { channelId: ch.id });
      } else {
        navigation.goBack();
      }
    } catch {
      // handled by react-query
    }
  }, [canCreate, createChannel, name, description, selectedCategory, navigation]);

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
          {t('messenger.new_channel', 'New Channel')}
        </Text>
        <Pressable
          onPress={handleCreate}
          disabled={!canCreate}
          style={[
            styles.createBtn,
            {
              backgroundColor: canCreate ? colors.brandPrimary : colors.bgTertiary,
              borderRadius: radius.md,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
            },
          ]}
        >
          <Text
            variant="bodyMd"
            style={{ color: canCreate ? '#FFFFFF' : colors.textTertiary, fontWeight: '600' }}
          >
            {t('messenger.create', 'Create')}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar placeholder */}
        <View style={[styles.avatarSection, { paddingTop: spacing['2xl'] }]}>
          <Pressable
            style={[
              styles.avatarPlaceholder,
              {
                backgroundColor: colors.bgSecondary,
                borderColor: colors.borderDefault,
                borderRadius: radius.xl,
              },
            ]}
          >
            <Camera size={28} color={colors.textTertiary} />
            <Text variant="bodySm" color="tertiary" style={{ marginTop: spacing.xs }}>
              {t('messenger.add_photo', 'Add photo')}
            </Text>
          </Pressable>
        </View>

        {/* Name input */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <View style={styles.labelRow}>
            <Text variant="headingSm" color="primary">
              {t('messenger.channel_name', 'Name')}
            </Text>
            <Text
              variant="caption"
              style={{ color: name.length >= NAME_MAX ? colors.error : colors.textTertiary }}
            >
              {name.length}/{NAME_MAX}
            </Text>
          </View>
          <TextInput
            value={name}
            onChangeText={(v) => setName(v.slice(0, NAME_MAX))}
            placeholder={t('messenger.channel_name_placeholder', 'Channel name')}
            placeholderTextColor={colors.textTertiary}
            maxLength={NAME_MAX}
            style={[
              styles.input,
              {
                backgroundColor: colors.bgSecondary,
                color: colors.textPrimary,
                borderRadius: radius.lg,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                marginTop: spacing.sm,
              },
            ]}
          />
        </View>

        {/* Description textarea */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <View style={styles.labelRow}>
            <Text variant="headingSm" color="primary">
              {t('messenger.channel_description', 'Description')}
            </Text>
            <Text
              variant="caption"
              style={{ color: description.length >= DESC_MAX ? colors.error : colors.textTertiary }}
            >
              {description.length}/{DESC_MAX}
            </Text>
          </View>
          <TextInput
            value={description}
            onChangeText={(v) => setDescription(v.slice(0, DESC_MAX))}
            placeholder={t('messenger.channel_desc_placeholder', 'What is this channel about?')}
            placeholderTextColor={colors.textTertiary}
            maxLength={DESC_MAX}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[
              styles.textarea,
              {
                backgroundColor: colors.bgSecondary,
                color: colors.textPrimary,
                borderRadius: radius.lg,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                marginTop: spacing.sm,
              },
            ]}
          />
        </View>

        {/* Category selector */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <Text variant="headingSm" color="primary" style={{ marginBottom: spacing.md }}>
            {t('messenger.category', 'Category')}
          </Text>
          <View style={[styles.categoryGrid, { gap: spacing.sm }]}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(isSelected ? null : cat.id)}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: isSelected ? colors.brandPrimary + '15' : colors.bgSecondary,
                      borderColor: isSelected ? colors.brandPrimary : colors.borderDefault,
                      borderRadius: radius.lg,
                      padding: spacing.md,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
                  <Text
                    variant="bodySm"
                    style={{
                      color: isSelected ? colors.brandPrimary : colors.textPrimary,
                      fontWeight: '500',
                      marginTop: spacing.xs,
                    }}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  backButton: { padding: 4, marginRight: 4 },
  createBtn: { alignItems: 'center', justifyContent: 'center' },
  avatarSection: { alignItems: 'center' },
  avatarPlaceholder: {
    width: 96, height: 96, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderStyle: 'dashed',
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { fontSize: 16, lineHeight: 22 },
  textarea: { fontSize: 16, lineHeight: 22, minHeight: 100 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryItem: { width: '31%', alignItems: 'center', borderWidth: 1 },
});
