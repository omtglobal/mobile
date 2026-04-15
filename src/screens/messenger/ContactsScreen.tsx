import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Search, UserPlus, Users, Radio, MoreVertical, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import { ContactRow } from '~/components/messenger';
import {
  useContactsQuery,
  useContactGroupsQuery,
  useCreateConversationMutation,
} from '~/lib/hooks/useMessaging';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';
import type { Contact, ContactGroup } from '~/types/messaging';

type Nav = NativeStackNavigationProp<MessengerStackParamList, 'MessengerContacts'>;

interface GroupedSection {
  key: string;
  title: string;
  icon: string | null;
  count: number;
  data: Contact[];
}

function buildSections(
  contacts: Contact[] | undefined,
  groups: ContactGroup[] | undefined,
  searchText: string,
): GroupedSection[] {
  if (!contacts) return [];

  const q = searchText.toLowerCase().trim();
  const filtered = q
    ? contacts.filter((c) => c.name.toLowerCase().includes(q))
    : contacts;

  if (!groups || groups.length === 0) {
    if (filtered.length === 0) return [];
    return [{ key: '__all', title: '', icon: null, count: filtered.length, data: filtered }];
  }

  const groupMap = new Map<string, ContactGroup>();
  for (const g of groups) groupMap.set(g.id, g);

  const buckets = new Map<string, Contact[]>();
  const ungrouped: Contact[] = [];

  for (const c of filtered) {
    if (c.group_id && groupMap.has(c.group_id)) {
      const existing = buckets.get(c.group_id) ?? [];
      existing.push(c);
      buckets.set(c.group_id, existing);
    } else {
      ungrouped.push(c);
    }
  }

  const sections: GroupedSection[] = [];

  for (const g of groups) {
    const data = buckets.get(g.id);
    if (data && data.length > 0) {
      sections.push({
        key: g.id,
        title: g.name,
        icon: g.icon,
        count: data.length,
        data,
      });
    }
  }

  if (ungrouped.length > 0) {
    sections.push({
      key: '__ungrouped',
      title: 'Other',
      icon: null,
      count: ungrouped.length,
      data: ungrouped,
    });
  }

  return sections;
}

export function ContactsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [searchText, setSearchText] = useState('');

  const {
    data: contacts,
    isLoading: loadingContacts,
    isError,
    refetch,
  } = useContactsQuery();
  const { data: groups, isLoading: loadingGroups } = useContactGroupsQuery();

  const createConversation = useCreateConversationMutation();

  const sections = useMemo(
    () => buildSections(contacts, groups, searchText),
    [contacts, groups, searchText],
  );

  const isLoading = loadingContacts || loadingGroups;

  const handleContactPress = useCallback(
    async (contact: Contact) => {
      try {
        const res = await createConversation.mutateAsync({
          participant_user_id: contact.user_id,
          type: 'direct',
        });
        const conv = res?.data;
        if (conv?.id) {
          navigation.navigate('MessengerChat', { conversationId: conv.id });
        }
      } catch {
        // handled by react-query
      }
    },
    [createConversation, navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Contact }) => (
      <ContactRow contact={item} onPress={() => handleContactPress(item)} />
    ),
    [handleContactPress],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: GroupedSection }) => {
      if (!section.title) return null;
      return (
        <View
          style={[
            styles.sectionHeader,
            {
              backgroundColor: colors.bgPrimary + 'EE',
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              borderBottomColor: colors.borderDefault,
            },
          ]}
        >
          {section.icon ? (
            <Text style={styles.sectionIcon}>{section.icon}</Text>
          ) : null}
          <Text variant="caption" style={{ fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: colors.textPrimary }}>
            {section.title}
          </Text>
          <Text variant="caption" color="tertiary" style={{ marginLeft: 'auto' }}>
            {section.count}
          </Text>
        </View>
      );
    },
    [colors, spacing],
  );

  const keyExtractor = useCallback((item: Contact) => item.id, []);

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
          <Text variant="headingLg" color="primary" style={{ flex: 1 }}>
            {t('messenger.contacts')}
          </Text>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate('MessengerContactSearch')}
              hitSlop={8}
              style={[styles.headerButton, { borderRadius: radius.lg }]}
            >
              <Users size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable
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
            placeholder={t('messenger.search_contacts', 'Search contacts...')}
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

        {/* Quick actions */}
        <View style={[styles.quickActions, { marginTop: spacing.md, gap: spacing.sm }]}>
          <Pressable
            onPress={() => navigation.navigate('MessengerContactSearch')}
            style={[
              styles.quickAction,
              {
                backgroundColor: colors.brandPrimary + '15',
                borderColor: colors.brandPrimary + '30',
                borderRadius: radius.lg,
                padding: spacing.md,
              },
            ]}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: colors.brandPrimary + '25', borderRadius: radius.md },
              ]}
            >
              <UserPlus size={16} color={colors.brandPrimary} />
            </View>
            <Text variant="caption" color="primary" style={{ fontWeight: '500' }}>
              {t('messenger.add_contact', 'Add')}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.quickAction,
              {
                backgroundColor: colors.bgSecondary,
                borderColor: colors.borderDefault,
                borderRadius: radius.lg,
                padding: spacing.md,
              },
            ]}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: colors.bgTertiary, borderRadius: radius.md },
              ]}
            >
              <Users size={16} color={colors.textSecondary} />
            </View>
            <Text variant="caption" color="primary" style={{ fontWeight: '500' }}>
              {t('messenger.groups', 'Groups')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('MessengerChannels' as any)}
            style={[
              styles.quickAction,
              {
                backgroundColor: colors.bgSecondary,
                borderColor: colors.borderDefault,
                borderRadius: radius.lg,
                padding: spacing.md,
              },
            ]}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: colors.bgTertiary, borderRadius: radius.md },
              ]}
            >
              <Radio size={16} color={colors.textSecondary} />
            </View>
            <Text variant="caption" color="primary" style={{ fontWeight: '500' }}>
              {t('messenger.channels', 'Channels')}
            </Text>
          </Pressable>
        </View>
      </View>
    ),
    [insets.top, spacing, colors, radius, searchText, navigation, t],
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
              <Text variant="bodyMd" color="brand">
                {t('messenger.retry')}
              </Text>
            </Pressable>
          </View>
        </>
      ) : sections.length === 0 ? (
        <>
          {ListHeader}
          <View style={styles.centered}>
            {searchText.trim() ? (
              <>
                <View
                  style={[
                    styles.emptyIcon,
                    { backgroundColor: colors.bgSecondary, borderRadius: radius.lg },
                  ]}
                >
                  <Search size={32} color={colors.textTertiary} />
                </View>
                <Text variant="bodyMd" color="secondary" style={{ marginTop: spacing.md }}>
                  {t('messenger.contacts_not_found', 'No contacts found')}
                </Text>
              </>
            ) : (
              <Text variant="bodyMd" color="secondary">
                {t('messenger.no_contacts')}
              </Text>
            )}
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
          contentContainerStyle={{ paddingBottom: spacing.lg + 80 }}
        />
      )}

      {/* FAB -- Add contact */}
      <Pressable
        onPress={() => navigation.navigate('MessengerContactSearch')}
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
        <UserPlus size={22} color="#FFFFFF" />
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
  quickActions: {
    flexDirection: 'row',
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  quickActionIcon: {
    padding: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionIcon: {
    fontSize: 18,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
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
