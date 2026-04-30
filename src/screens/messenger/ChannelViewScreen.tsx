import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Share2,
  MoreVertical,
  Users,
  FileText,
  Heart,
  Eye,
  MessageCircle,
  Radio,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { HeaderBackButton, Text } from '~/components/ui';
import {
  useChannelQuery,
  useChannelPostsQuery,
  useToggleChannelSubscriptionMutation,
  useLikeChannelPostMutation,
} from '~/lib/hooks/useMessaging';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';
import type { ChannelPost } from '~/types/messaging';

type ChannelRoute = RouteProp<MessengerStackParamList, 'MessengerChannelView'>;
type Nav = NativeStackNavigationProp<MessengerStackParamList, 'MessengerChannelView'>;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function ChannelViewScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<ChannelRoute>();
  const { channelId } = route.params;

  const { data: channel, isLoading: channelLoading } = useChannelQuery(channelId);
  const { data: posts, isLoading: postsLoading } = useChannelPostsQuery(channelId);
  const toggleSub = useToggleChannelSubscriptionMutation();
  const likePost = useLikeChannelPostMutation(channelId);

  const isLoading = channelLoading || postsLoading;
  const channelName = channel?.name ?? `Channel`;

  const handleSubscribe = useCallback(() => {
    toggleSub.mutate(channelId);
  }, [toggleSub, channelId]);

  const renderPostCard = useCallback(
    ({ item }: { item: ChannelPost }) => (
      <View
        style={[
          styles.postCard,
          {
            backgroundColor: colors.bgSecondary,
            borderRadius: radius.lg,
            marginHorizontal: spacing.lg,
            marginBottom: spacing.md,
            padding: spacing.lg,
          },
        ]}
      >
        <Text variant="bodyMd" color="primary">{item.content}</Text>

        <View style={[styles.postFooter, { marginTop: spacing.md, gap: spacing.lg }]}>
          <Pressable onPress={() => likePost.mutate(item.id)} style={styles.postStat}>
            <Heart size={14} color={colors.textTertiary} />
            <Text variant="caption" color="tertiary">{item.likes_count}</Text>
          </Pressable>
          <View style={styles.postStat}>
            <Eye size={14} color={colors.textTertiary} />
            <Text variant="caption" color="tertiary">{item.views_count}</Text>
          </View>
          <View style={styles.postStat}>
            <MessageCircle size={14} color={colors.textTertiary} />
            <Text variant="caption" color="tertiary">{item.comments_count}</Text>
          </View>
          <Text variant="caption" color="tertiary" style={{ marginLeft: 'auto' }}>
            {timeAgo(item.created_at)}
          </Text>
        </View>
      </View>
    ),
    [colors, spacing, radius, likePost],
  );

  const ListHeader = useCallback(
    () => (
      <View style={{ paddingBottom: spacing.lg }}>
        {/* Channel info */}
        <View style={[styles.channelInfo, { padding: spacing.xl, gap: spacing.md }]}>
          <View style={[styles.channelAvatar, { backgroundColor: colors.brandPrimary + '20', borderRadius: radius.xl }]}>
            <Text variant="headingXl" style={{ color: colors.brandPrimary, fontSize: 32 }}>
              {channelName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text variant="headingLg" color="primary">{channelName}</Text>
          <Text variant="bodyMd" color="secondary" style={{ textAlign: 'center' }}>
            {channel?.description ?? t('messenger.channel_placeholder_desc', 'Channel description will appear here.')}
          </Text>

          <View style={[styles.statsRow, { gap: spacing.xl, marginTop: spacing.sm }]}>
            <View style={styles.statBlock}>
              <Users size={16} color={colors.textTertiary} />
              <Text variant="headingSm" color="primary">{channel?.subscribers_count ?? 0}</Text>
              <Text variant="caption" color="tertiary">{t('messenger.subscribers', 'subscribers')}</Text>
            </View>
            <View style={styles.statBlock}>
              <FileText size={16} color={colors.textTertiary} />
              <Text variant="headingSm" color="primary">{channel?.posts_count ?? 0}</Text>
              <Text variant="caption" color="tertiary">{t('messenger.posts', 'posts')}</Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          {channel?.is_owner ? (
            <Pressable
              onPress={() => navigation.navigate('MessengerCreatePost', { channelId })}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: colors.brandPrimary,
                  borderRadius: radius.lg,
                  paddingVertical: spacing.md,
                },
              ]}
            >
              <Text variant="bodyMd" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                {t('messenger.create_post', 'Create Post')}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSubscribe}
              disabled={toggleSub.isPending}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: channel?.is_subscribed ? colors.bgSecondary : colors.brandPrimary,
                  borderRadius: radius.lg,
                  paddingVertical: spacing.md,
                },
              ]}
            >
              <Text
                variant="bodyMd"
                style={{
                  color: channel?.is_subscribed ? colors.textPrimary : '#FFFFFF',
                  fontWeight: '600',
                }}
              >
                {channel?.is_subscribed
                  ? t('messenger.unsubscribe', 'Unsubscribe')
                  : t('messenger.subscribe', 'Subscribe')}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Posts section label */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.md }}>
          <Text variant="headingSm" color="secondary">
            {t('messenger.recent_posts', 'Recent Posts')}
          </Text>
        </View>
      </View>
    ),
    [channel, channelName, channelId, colors, spacing, radius, navigation, t, handleSubscribe, toggleSub.isPending],
  );

  const ListEmpty = useCallback(
    () => (
      <View style={[styles.emptyState, { paddingHorizontal: spacing.xl }]}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.bgSecondary, borderRadius: radius.xl }]}>
          <FileText size={32} color={colors.textTertiary} />
        </View>
        <Text variant="bodyMd" color="secondary" style={{ marginTop: spacing.md, textAlign: 'center' }}>
          {t('messenger.no_posts', 'No posts yet. Be the first to share something!')}
        </Text>
      </View>
    ),
    [colors, spacing, radius, t],
  );

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
        <View style={styles.headerCenter}>
          <Radio size={16} color={colors.brandPrimary} />
          <Text variant="headingSm" color="primary" numberOfLines={1} style={{ marginLeft: spacing.xs }}>
            {channelName}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable hitSlop={8} style={[styles.headerActionBtn, { borderRadius: radius.lg }]}>
            <Share2 size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable hitSlop={8} style={[styles.headerActionBtn, { borderRadius: radius.lg }]}>
            <MoreVertical size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      ) : (
        <FlatList
          data={posts ?? []}
          renderItem={renderPostCard}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  backButton: { padding: 4, marginRight: 4 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerActionBtn: { padding: 8 },
  channelInfo: { alignItems: 'center' },
  channelAvatar: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statBlock: { alignItems: 'center', gap: 2 },
  primaryButton: { alignItems: 'center', justifyContent: 'center' },
  postCard: { overflow: 'hidden' },
  postFooter: { flexDirection: 'row', alignItems: 'center' },
  postStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  emptyState: { alignItems: 'center', paddingTop: 24 },
  emptyIcon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
});
