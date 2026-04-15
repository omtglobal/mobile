import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Archive, MoreVertical, PenSquare, Search, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import { ConversationRow, EmptyConversations, MessengerLoginPrompt } from '~/components/messenger';
import { useConversations } from '~/lib/hooks/useMessaging';
import { useAuth } from '~/lib/hooks/useAuth';
import { isAuthHttpError } from '~/lib/utils/authErrors';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';
import type { Conversation } from '~/types/messaging';

type Nav = NativeStackNavigationProp<MessengerStackParamList, 'MessengerHome'>;

const FILTER_TABS = ['all', 'personal', 'groups', 'channels'] as const;
type FilterTab = (typeof FILTER_TABS)[number];

export function ConversationListScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { isAuthenticated, isHydrated } = useAuth();

  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [manualRefreshing, setManualRefreshing] = useState(false);

  const {
    data: conversationsPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useConversations(1);

  const conversations = useMemo<Conversation[]>(() => {
    if (!conversationsPage?.data) return [];
    const d = conversationsPage.data;
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object' && 'data' in d) {
      return (d as unknown as { data: Conversation[] }).data;
    }
    return [];
  }, [conversationsPage]);

  const filtered = useMemo(() => {
    let result = conversations;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter((c) => {
        const name =
          c.company?.name ??
          c.participants.find((p) => p.id !== '__self__')?.name ??
          '';
        return name.toLowerCase().includes(q);
      });
    }
    if (activeFilter === 'personal') {
      result = result.filter((c) => c.type === 'direct');
    } else if (activeFilter === 'channels') {
      result = result.filter((c) => (c as any).type === 'channel');
    }
    return result;
  }, [conversations, searchText, activeFilter]);

  const pinned = useMemo(() => filtered.filter((c) => c.is_pinned), [filtered]);
  const unpinned = useMemo(() => filtered.filter((c) => !c.is_pinned), [filtered]);

  const handlePress = useCallback(
    (id: string) => navigation.navigate('MessengerChat', { conversationId: id }),
    [navigation],
  );

  const handleRefresh = useCallback(() => {
    setManualRefreshing(true);
    void refetch().finally(() => {
      setManualRefreshing(false);
    });
  }, [refetch]);

  const filterLabels: Record<FilterTab, string> = {
    all: t('messenger.filter_all', 'All'),
    personal: t('messenger.filter_personal', 'Personal'),
    groups: t('messenger.filter_groups', 'Groups'),
    channels: t('messenger.filter_channels', 'Channels'),
  };

  if (!isHydrated) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bgPrimary }]}>
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }

  if (!isAuthenticated || (isError && isAuthHttpError(error))) {
    return <MessengerLoginPrompt />;
  }

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
        <View style={styles.headerTop}>
          <Text variant="headingLg" color="primary">
            {t('messenger.title')}
          </Text>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => {}}
              hitSlop={8}
              style={[styles.headerButton, { borderRadius: radius.lg }]}
            >
              <Archive size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => {}}
              hitSlop={8}
              style={[styles.headerButton, { borderRadius: radius.lg }]}
            >
              <MoreVertical size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Search bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.bgSecondary,
              borderRadius: radius.lg,
              marginTop: spacing.md,
            },
          ]}
        >
          <Search size={20} color={colors.textTertiary} style={{ marginLeft: spacing.md }} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('messenger.search_placeholder')}
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.searchInput,
              {
                color: colors.textPrimary,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.md,
              },
            ]}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} style={{ paddingRight: spacing.md }}>
              <X size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing.md }}
          contentContainerStyle={{ gap: spacing.sm }}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveFilter(tab)}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isActive ? colors.brandPrimary : colors.bgSecondary,
                    borderRadius: radius.lg,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.sm,
                  },
                ]}
              >
                <Text
                  variant="bodySm"
                  style={{
                    color: isActive ? '#FFFFFF' : colors.textSecondary,
                    fontWeight: '500',
                  }}
                >
                  {filterLabels[tab]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text variant="bodyMd" color="secondary" style={{ marginBottom: spacing.md }}>
            {t('messenger.error_loading')}
          </Text>
          <Pressable onPress={() => refetch()}>
            <Text variant="bodyMd" color="brand">
              {t('messenger.retry')}
            </Text>
          </Pressable>
        </View>
      ) : conversations.length === 0 ? (
        <EmptyConversations />
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={manualRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.brandPrimary}
            />
          }
        >
          {pinned.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
                <Text
                  variant="caption"
                  style={{ color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}
                >
                  {t('messenger.section_pinned')}
                </Text>
              </View>
              {pinned.map((c) => (
                <ConversationRow key={c.id} conversation={c} onPress={() => handlePress(c.id)} />
              ))}
            </>
          )}

          {unpinned.length > 0 && pinned.length > 0 && (
            <View style={[styles.sectionHeader, { paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
              <Text
                variant="caption"
                style={{ color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {t('messenger.section_all')}
              </Text>
            </View>
          )}
          {unpinned.map((c) => (
            <ConversationRow key={c.id} conversation={c} onPress={() => handlePress(c.id)} />
          ))}

          {filtered.length === 0 && searchText.trim().length > 0 && (
            <View style={[styles.centered, { paddingVertical: spacing['3xl'] }]}>
              <Text variant="bodySm" color="secondary">
                {t('messenger.search_not_found')}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* FAB — New chat */}
      <Pressable
        onPress={() => navigation.navigate('MessengerNewChat')}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: pressed ? colors.brandPrimary + 'DD' : colors.brandPrimary,
            bottom: spacing.lg,
            right: spacing.lg,
            borderRadius: radius.full,
          },
        ]}
      >
        <PenSquare size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  filterTab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    paddingBottom: 4,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
