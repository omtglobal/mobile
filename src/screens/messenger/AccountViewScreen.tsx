import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Mail, Phone, Calendar, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import { useAuth } from '~/lib/hooks/useAuth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';

type Nav = NativeStackNavigationProp<MessengerStackParamList>;

function getInitial(name: string | undefined): string {
  return (name ?? '?').charAt(0).toUpperCase();
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function AccountViewScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  return (
    <View style={[styles.flex, { backgroundColor: colors.bgPrimary }]}>
      {/* Header — tab-level, no back button */}
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
        <View style={{ flex: 1 }}>
          <Text variant="headingLg" color="primary">
            {t('messenger.my_account', 'My Account')}
          </Text>
          <Text variant="bodySm" color="secondary">
            {t('messenger.view_profile', 'View profile')}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 100,
        }}
      >
        {/* Background panel + Avatar */}
        <View style={[styles.avatarSection, { marginTop: spacing.lg }]}>
          <View
            style={[
              styles.bgPanel,
              { backgroundColor: colors.brandPrimary, borderRadius: radius.lg },
            ]}
          />
          <View style={[styles.avatarRing, { backgroundColor: colors.bgPrimary }]}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.brandPrimary, borderRadius: radius.full },
              ]}
            >
              <Text style={styles.avatarInitial}>
                {getInitial(user?.name)}
              </Text>
            </View>
          </View>
        </View>

        {/* Name + bio */}
        <View style={[styles.nameSection, { marginTop: spacing.md }]}>
          <Text variant="headingLg" color="primary" style={{ textAlign: 'center' }}>
            {user?.name ?? '—'}
          </Text>
          <Text variant="bodySm" color="secondary" style={{ textAlign: 'center', marginTop: 2 }}>
            {user?.email ?? '—'}
          </Text>
        </View>

        {/* Info cards */}
        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          {/* Name */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.bgSecondary,
                borderRadius: radius.lg,
                borderColor: colors.borderDefault,
                padding: spacing.lg,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text variant="caption" color="secondary">
                {t('messenger.name_label', 'Name')}
              </Text>
              <Text variant="bodyMd" color="primary" style={{ marginTop: 2, fontWeight: '500' }}>
                {user?.name ?? '—'}
              </Text>
            </View>
          </View>

          {/* Email */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.bgSecondary,
                borderRadius: radius.lg,
                borderColor: colors.borderDefault,
                padding: spacing.lg,
              },
            ]}
          >
            <Mail size={20} color={colors.textTertiary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text variant="caption" color="secondary">
                {t('messenger.email', 'Email')}
              </Text>
              <Text variant="bodyMd" color="primary" style={{ marginTop: 2, fontWeight: '500' }}>
                {user?.email ?? '—'}
              </Text>
            </View>
          </View>

          {/* Phone */}
          {user?.phone && (
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.bgSecondary,
                  borderRadius: radius.lg,
                  borderColor: colors.borderDefault,
                  padding: spacing.lg,
                },
              ]}
            >
              <Phone size={20} color={colors.textTertiary} />
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text variant="caption" color="secondary">
                  {t('messenger.phone', 'Phone')}
                </Text>
                <Text variant="bodyMd" color="primary" style={{ marginTop: 2, fontWeight: '500' }}>
                  {user.phone}
                </Text>
              </View>
            </View>
          )}

          {/* Registration date */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.bgSecondary,
                borderRadius: radius.lg,
                borderColor: colors.borderDefault,
                padding: spacing.lg,
              },
            ]}
          >
            <Calendar size={20} color={colors.textTertiary} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text variant="caption" color="secondary">
                {t('messenger.registered', 'Registered')}
              </Text>
              <Text variant="bodyMd" color="primary" style={{ marginTop: 2, fontWeight: '500' }}>
                {formatDate(user?.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Settings button */}
        <Pressable
          onPress={() => navigation.navigate('MessengerAccountSettings')}
          style={({ pressed }) => [
            styles.accentButton,
            {
              backgroundColor: pressed
                ? colors.brandPrimary + 'DD'
                : colors.brandPrimary,
              borderRadius: radius.lg,
              marginTop: spacing['2xl'],
              paddingVertical: spacing.md,
              gap: spacing.sm,
            },
          ]}
        >
          <Settings size={18} color="#FFFFFF" />
          <Text variant="bodyMd" style={{ color: '#FFFFFF', fontWeight: '600' }}>
            {t('messenger.account_settings', 'Account Settings')}
          </Text>
        </Pressable>
      </ScrollView>
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
  nameSection: {
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  accentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
