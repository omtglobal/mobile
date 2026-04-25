import React, { useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MessageCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import { useCreateConversationMutation } from '~/lib/hooks/useMessaging';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';

type ProfileRoute = RouteProp<MessengerStackParamList, 'MessengerContactProfile'>;
type Nav = NativeStackNavigationProp<MessengerStackParamList, 'MessengerContactProfile'>;

const AVATAR_COLORS = ['#FF6B00', '#667eea', '#f5576c', '#4facfe', '#43e97b', '#5856D6'];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function ContactProfileScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ProfileRoute>();
  const { userId } = route.params;

  const createConversation = useCreateConversationMutation();

  const openChat = useCallback(async () => {
    try {
      const res = await createConversation.mutateAsync({
        participant_user_id: userId,
        type: 'direct',
      });
      const conv = res?.data;
      if (conv?.id) {
        navigation.navigate('MessengerChat', { conversationId: conv.id });
      }
    } catch {
      /* react-query */
    }
  }, [createConversation, navigation, userId]);

  const avatarBg = getAvatarColor(userId);
  const initial = userId.charAt(0).toUpperCase();
  const displayName = `User ${userId.slice(0, 6)}`;
  const username = `user_${userId.slice(0, 8)}`;

  return (
    <View style={[styles.flex, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.sm,
            borderBottomColor: colors.borderDefault,
          },
        ]}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text variant="headingSm" color="primary">
            {t('messenger.contact', 'Contact')}
          </Text>
          <Text variant="caption" color="secondary">
            {t('messenger.user_info', 'User information')}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Background panel + Avatar */}
        <View style={styles.profileSection}>
          <View
            style={[
              styles.bgPanel,
              { backgroundColor: avatarBg, borderRadius: 0 },
            ]}
          />
          <View style={[styles.avatarRing, { backgroundColor: colors.bgPrimary }]}>
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
            <View
              style={[
                styles.onlineDot,
                { backgroundColor: colors.success, borderColor: colors.bgPrimary },
              ]}
            />
          </View>
        </View>

        {/* Name + username + status */}
        <View style={[styles.nameSection, { marginTop: spacing.md }]}>
          <Text variant="headingLg" color="primary">
            {displayName}
          </Text>
          <Text variant="bodySm" color="secondary" style={{ marginTop: 2 }}>
            @{username}
          </Text>
          <Text variant="bodySm" style={{ color: colors.brandPrimary, marginTop: spacing.xs }}>
            {t('messenger.online', 'Online')}
          </Text>
        </View>

        {/* Message — only action wired to chat */}
        <View style={[styles.actionsRow, { paddingHorizontal: spacing.lg, marginTop: spacing.xl }]}>
          <Pressable
            onPress={() => void openChat()}
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.brandPrimary + '15',
                borderColor: colors.brandPrimary + '30',
                borderRadius: radius.lg,
                paddingVertical: spacing.lg,
              },
            ]}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: colors.brandPrimary + '25' }]}>
              <MessageCircle size={20} color={colors.brandPrimary} />
            </View>
            <Text
              variant="caption"
              color="primary"
              style={{ fontWeight: '500', marginTop: spacing.sm }}
            >
              {t('messenger.message', 'Message')}
            </Text>
          </Pressable>
        </View>

        {/* Info cards */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl, gap: spacing.md }}>
          {/* Bio */}
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
            <Text variant="caption" color="secondary">
              {t('messenger.bio', 'Bio')}
            </Text>
            <Text variant="bodyMd" color="primary" style={{ marginTop: spacing.xs }}>
              {t('messenger.bio_placeholder', 'No bio yet')}
            </Text>
          </View>

          {/* Phone */}
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
            <Text variant="caption" color="secondary">
              {t('messenger.phone', 'Phone')}
            </Text>
            <Text variant="bodyMd" color="primary" style={{ marginTop: spacing.xs, fontWeight: '500' }}>
              {t('messenger.phone_placeholder', 'Not available')}
            </Text>
          </View>
        </View>
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
  backButton: {
    padding: 4,
  },
  profileSection: {
    alignItems: 'center',
  },
  bgPanel: {
    width: '100%',
    height: 130,
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
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
  },
  nameSection: {
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
