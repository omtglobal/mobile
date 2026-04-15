import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Camera, User, AtSign, FileText, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import { useAuth } from '~/lib/hooks/useAuth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';

type Nav = NativeStackNavigationProp<MessengerStackParamList, 'MessengerAccountSettings'>;

const BIO_MAX = 150;

const AVATAR_BG_COLORS = [
  { id: 1, color: '#FF6B00' },
  { id: 2, color: '#667eea' },
  { id: 3, color: '#f5576c' },
  { id: 4, color: '#4facfe' },
  { id: 5, color: '#43e97b' },
  { id: 6, color: '#fa709a' },
  { id: 7, color: '#30cfd0' },
  { id: 8, color: '#1f2937' },
];

function getInitial(name: string | undefined): string {
  return (name ?? '?').charAt(0).toUpperCase();
}

export function AccountSettingsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedBgId, setSelectedBgId] = useState(1);
  const [showBgPicker, setShowBgPicker] = useState(false);

  const selectedBg = AVATAR_BG_COLORS.find((b) => b.id === selectedBgId) ?? AVATAR_BG_COLORS[0];

  const handleSave = () => {
    navigation.goBack();
  };

  const isSaveDisabled = displayName.trim().length === 0;

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
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text variant="headingLg" color="primary">
            {t('messenger.account_settings', 'Account Settings')}
          </Text>
          <Text variant="bodySm" color="secondary">
            {t('messenger.edit_profile', 'Edit profile')}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl + 80,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background panel + Avatar */}
        <View style={[styles.avatarSection, { marginTop: spacing.lg }]}>
          <View
            style={[
              styles.bgPanel,
              { backgroundColor: selectedBg.color, borderRadius: radius.lg },
            ]}
          />
          <View style={[styles.avatarRing, { backgroundColor: colors.bgPrimary }]}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: selectedBg.color, borderRadius: radius.full },
              ]}
            >
              <Text style={styles.avatarInitial}>
                {getInitial(user?.name)}
              </Text>
            </View>
            <Pressable
              style={[
                styles.cameraButton,
                {
                  backgroundColor: colors.brandPrimary,
                  borderRadius: radius.full,
                },
              ]}
            >
              <Camera size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Background picker toggle */}
        <Pressable
          onPress={() => setShowBgPicker(!showBgPicker)}
          style={[
            styles.bgPickerToggle,
            {
              backgroundColor: colors.bgSecondary,
              borderRadius: radius.lg,
              paddingVertical: spacing.md,
              marginTop: spacing.md,
            },
          ]}
        >
          <Text variant="bodySm" color="secondary" style={{ fontWeight: '500' }}>
            {t('messenger.change_panel_bg', 'Change panel background')}
          </Text>
        </Pressable>

        {showBgPicker && (
          <View
            style={[
              styles.bgPickerGrid,
              {
                backgroundColor: colors.bgSecondary,
                borderRadius: radius.lg,
                borderColor: colors.borderDefault,
                padding: spacing.lg,
                marginTop: spacing.sm,
              },
            ]}
          >
            {AVATAR_BG_COLORS.map((bg) => {
              const isSelected = bg.id === selectedBgId;
              return (
                <Pressable
                  key={bg.id}
                  onPress={() => {
                    setSelectedBgId(bg.id);
                    setShowBgPicker(false);
                  }}
                  style={[
                    styles.bgCell,
                    {
                      backgroundColor: bg.color,
                      borderRadius: radius.md,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: colors.brandPrimary,
                    },
                  ]}
                >
                  {isSelected && <Check size={18} color="#FFFFFF" strokeWidth={3} />}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Name field */}
        <View
          style={[
            styles.fieldCard,
            {
              backgroundColor: colors.bgSecondary,
              borderRadius: radius.lg,
              borderColor: colors.borderDefault,
              padding: spacing.lg,
              marginTop: spacing.xl,
            },
          ]}
        >
          <View style={styles.fieldHeader}>
            <User size={18} color={colors.brandPrimary} />
            <Text variant="caption" color="secondary" style={{ marginLeft: spacing.sm }}>
              {t('messenger.display_name', 'Name')}
            </Text>
          </View>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t('messenger.display_name_placeholder', 'Your name')}
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                backgroundColor: colors.bgPrimary,
                borderRadius: radius.md,
                borderColor: colors.borderDefault,
                padding: spacing.md,
                marginTop: spacing.sm,
              },
            ]}
          />
        </View>

        {/* Username field */}
        <View
          style={[
            styles.fieldCard,
            {
              backgroundColor: colors.bgSecondary,
              borderRadius: radius.lg,
              borderColor: colors.borderDefault,
              padding: spacing.lg,
              marginTop: spacing.md,
            },
          ]}
        >
          <View style={styles.fieldHeader}>
            <AtSign size={18} color={colors.brandPrimary} />
            <Text variant="caption" color="secondary" style={{ marginLeft: spacing.sm }}>
              {t('messenger.username', 'Username')}
            </Text>
          </View>
          <View style={[styles.usernameRow, { marginTop: spacing.sm }]}>
            <Text
              variant="bodyMd"
              color="tertiary"
              style={{
                position: 'absolute',
                left: spacing.md,
                zIndex: 1,
              }}
            >
              @
            </Text>
            <TextInput
              value={username}
              onChangeText={(v) => setUsername(v.replace(/[^a-z0-9_]/gi, ''))}
              placeholder="username"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              style={[
                styles.input,
                {
                  flex: 1,
                  color: colors.textPrimary,
                  backgroundColor: colors.bgPrimary,
                  borderRadius: radius.md,
                  borderColor: colors.borderDefault,
                  padding: spacing.md,
                  paddingLeft: spacing.xl + spacing.sm,
                },
              ]}
            />
          </View>
        </View>

        {/* Bio textarea */}
        <View
          style={[
            styles.fieldCard,
            {
              backgroundColor: colors.bgSecondary,
              borderRadius: radius.lg,
              borderColor: colors.borderDefault,
              padding: spacing.lg,
              marginTop: spacing.md,
            },
          ]}
        >
          <View style={styles.fieldHeader}>
            <FileText size={18} color={colors.brandPrimary} />
            <Text variant="caption" color="secondary" style={{ marginLeft: spacing.sm }}>
              {t('messenger.bio', 'Bio')}
            </Text>
            <Text variant="caption" color="tertiary" style={{ marginLeft: 'auto' }}>
              {bio.length}/{BIO_MAX}
            </Text>
          </View>
          <TextInput
            value={bio}
            onChangeText={(v) => setBio(v.slice(0, BIO_MAX))}
            placeholder={t('messenger.bio_placeholder', 'Write something about yourself...')}
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={BIO_MAX}
            textAlignVertical="top"
            style={[
              styles.textarea,
              {
                color: colors.textPrimary,
                backgroundColor: colors.bgPrimary,
                borderRadius: radius.md,
                borderColor: colors.borderDefault,
                padding: spacing.md,
                marginTop: spacing.sm,
              },
            ]}
          />
        </View>
      </ScrollView>

      {/* Fixed bottom save button */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.bgPrimary,
            borderTopColor: colors.borderDefault,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.lg,
          },
        ]}
      >
        <Pressable
          onPress={handleSave}
          disabled={isSaveDisabled}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: isSaveDisabled
                ? colors.bgTertiary
                : pressed
                  ? colors.brandPrimary + 'DD'
                  : colors.brandPrimary,
              borderRadius: radius.lg,
              paddingVertical: spacing.lg,
              gap: spacing.sm,
            },
          ]}
        >
          <Check size={20} color={isSaveDisabled ? colors.textTertiary : '#FFFFFF'} />
          <Text
            variant="bodyMd"
            style={{
              color: isSaveDisabled ? colors.textTertiary : '#FFFFFF',
              fontWeight: '600',
            }}
          >
            {t('messenger.confirm_changes', 'Confirm changes')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarSection: {
    alignItems: 'center',
  },
  bgPanel: {
    width: '100%',
    height: 120,
  },
  avatarRing: {
    marginTop: -56,
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatar: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  bgPickerToggle: {
    alignItems: 'center',
  },
  bgPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bgCell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldCard: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
  },
  textarea: {
    fontSize: 16,
    minHeight: 80,
    borderWidth: 1,
  },
  bottomBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
