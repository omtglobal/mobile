import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SectionList,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Plus,
  Search,
  Radio,
  TrendingUp,
  Users,
  FileText,
  X,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import { useChannelsQuery } from '~/lib/hooks/useMessaging';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';
import type { Channel } from '~/types/messaging';

type Nav = NativeStackNavigationProp<MessengerStackParamList, 'MessengerChannels'>;

interface ChannelSection {
  key: string;
  title: string;
  data: Channel[];
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function ChannelsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [searchText, setSearchText] = useState('');

  const { data: channels, isLoading, isError, refetch } = useChannelsQuery();

  const sections = useMemo<ChannelSection[]>(() => {
    if (!channels) return [];
    const q = searchText.toLowerCase().trim();
    const filtered = q
      ? channels.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.description ?? '').toLowerCase().includes(q),
        )
      : channels;

    const mine = filtered.filter((c) => c.is_owner);
    const subscribed = filtered.filter((c) => c.is_subscribed && !c.is_owner);
    const other = filtered.filter((c) => !c.is_subscribed && !c.is_owner);

    const result: ChannelSection[] = [];
    if (mine.length > 0) result.push({ key: 'mine', title: t('messenger.my_channels', 'My channels'), data: mine });
    if (subscribed.length > 0) result.push({ key: 'subscribed', title: t('messenger.subscriptions', 'Subscriptions'), data: subscribed });
    if (other.length > 0) result.push({ key: 'discover', title: t('messenger.discover', 'Discover'), data: other });
    return result;
  }, [channels, searchText, t]);

  const myCount = channels?.filter((c) => c.is_owner).length ?? 0;
  const subCount = channels?.filter((c) => c.is_subscribed && !c.is_owner).length ?? 0;

  const renderItem = useCallback(
    ({ item }: { item: Channel }) => (
      <Pressable
        onPress={() => navigation.navigate('MessengerChannelView', { channelId: item.id })}
        style={({ pressed }) => [
          styles.channelRow,
          {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomColor: colors.borderDefault,
            backgroundColor: pressed ? colors.bgSecondary : colors.bgPrimary,
          },
        ]}
      >
        <View style={[styles.channelAvatar, { backgroundColor: colors.brandPrimary + '20', borderRadius: radius.lg }]}>
          <Text variant="headingSm" style={{ color: colors.brandPrimary }}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
          {item.is_owner && (
            <View style={[styles.ownerBadge, { backgroundColor: colors.brandPrimary, borderColor: colors.bgPrimary }]}>
              <Radio size={8} color="#FFFFFF" />
            </View>
          )}
        </View>
        <View style={styles.flex}>
          <Text variant="headingSm" color="primary" numberOfLines={1}>{item.name}</Text>
          <Text variant="bodySm" color="secondary" numberOfLines={1} style={{ marginTop: 2 }}>
            {item.description ?? ''}
          </Text>
          <View style={[styles.channelStats, { marginTop: spacing.xs, gap: spacing.md }]}>
            <View style={styles.statItem}>
              <Users size={12} color={colors.textTertiary} />
              <Text variant="caption" color="tertiary">{formatNumber(item.subscribers_count)}</Text>
            </View>
            <View style={styles.statItem}>
              <FileText size={12} color={colors.textTertiary} />
              <Text variant="caption" color="tertiary">{item.posts_count} posts</Text>
            </View>
          </View>
        </View>
      </Pressable>
    ),
    [colors, spacing, radius, navigation],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: ChannelSection }) => (
      <View
        style={[
          styles.sectionHeader,
          {
            backgroundColor: colors.bgPrimary + 'EE',
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <Text
          variant="caption"
          style={{
            fontWeight: '600',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: colors.textSecondary,
          }}
        >
          {section.title}
        </Text>
      </View>
    ),
    [colors, spacing],
  );

  const keyExtractor = useCallback((item: Channel) => item.id, []);

  const ListHeader = useMemo(
    () => (
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
        <View style={styles.headerTop}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{ padding: 4 }}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </Pressable>
          <Text variant="headingLg" color="primary" style={{ flex: 1, marginLeft: spacing.sm }}>
            {t('messenger.channels', 'Channels')}
          </Text>
          <Pressable
            onPress={() => navigation.navigate('MessengerCreateChannel')}
            hitSlop={8}
            style={[styles.addButton, { backgroundColor: colors.brandPrimary + '15', borderRadius: radius.lg }]}
          >
            <Plus size={20} color={colors.brandPrimary} />
          </Pressable>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.bgSecondary, borderRadius: radius.lg, marginTop: spacing.md },
          ]}
        >
          <Search size={20} color={colors.textTertiary} style={{ marginLeft: spacing.md }} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('messenger.search_channels', 'Search channels...')}
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.searchInput,
              { color: colors.textPrimary, paddingHorizontal: spacing.sm, paddingVertical: spacing.md },
            ]}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} style={{ paddingRight: spacing.md }}>
              <X size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {/* Stats chips */}
        <View style={[styles.statsRow, { marginTop: spacing.md, gap: spacing.sm }]}>
          <View style={[styles.chip, { backgroundColor: colors.bgSecondary, borderRadius: radius.full }]}>
            <Radio size={14} color={colors.brandPrimary} />
            <Text variant="bodySm" color="primary" style={{ fontWeight: '500', marginLeft: 6 }}>
              {myCount} {t('messenger.mine', 'mine')}
            </Text>
          </View>
          <View style={[styles.chip, { backgroundColor: colors.bgSecondary, borderRadius: radius.full }]}>
            <TrendingUp size={14} color={colors.success} />
            <Text variant="bodySm" color="primary" style={{ fontWeight: '500', marginLeft: 6 }}>
              {subCount} {t('messenger.subscriptions', 'subscriptions')}
            </Text>
          </View>
        </View>
      </View>
    ),
    [insets.top, spacing, colors, radius, searchText, navigation, t, myCount, subCount],
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.bgPrimary }]}>
      {isLoading ? (
        <>
          {ListHeader}
          <View style={styles.centered}>
            <ActivityIndicator color={colors.brandPrimary} />
          </View>
        </>
      ) : isError ? (
        <>
          {ListHeader}
          <View style={styles.centered}>
            <Text variant="bodyMd" color="secondary" style={{ marginBottom: spacing.md }}>
              {t('messenger.error_loading')}
            </Text>
            <Pressable onPress={() => refetch()}>
              <Text variant="bodyMd" color="brand">{t('messenger.retry')}</Text>
            </Pressable>
          </View>
        </>
      ) : sections.length === 0 ? (
        <>
          {ListHeader}
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.bgSecondary, borderRadius: radius.xl }]}>
              <Radio size={40} color={colors.textTertiary} />
            </View>
            <Text variant="headingSm" color="primary" style={{ marginTop: spacing.lg }}>
              {t('messenger.no_channels', 'No channels yet')}
            </Text>
            <Text
              variant="bodyMd"
              color="secondary"
              style={{ marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: spacing['2xl'] }}
            >
              {t('messenger.no_channels_desc', 'Create your first channel to share updates with your audience.')}
            </Text>
            <Pressable
              onPress={() => navigation.navigate('MessengerCreateChannel')}
              style={[
                styles.createButton,
                {
                  backgroundColor: colors.brandPrimary,
                  borderRadius: radius.lg,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.xl,
                  marginTop: spacing.xl,
                },
              ]}
            >
              <Plus size={18} color="#FFFFFF" />
              <Text variant="bodyMd" style={{ color: '#FFFFFF', fontWeight: '600', marginLeft: spacing.sm }}>
                {t('messenger.create_channel', 'Create Channel')}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeader}
          stickySectionHeadersEnabled
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { borderBottomWidth: StyleSheet.hairlineWidth },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  addButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, fontSize: 15, lineHeight: 20 },
  statsRow: { flexDirection: 'row' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6 },
  sectionHeader: {},
  channelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  channelAvatar: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ownerBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelStats: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  createButton: { flexDirection: 'row', alignItems: 'center' },
});
