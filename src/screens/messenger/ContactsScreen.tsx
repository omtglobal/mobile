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
import { Search, UserPlus, Users, Radio, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import { ContactRow } from '~/components/messenger';
import {
  useContactsQuery,
  useContactSearchQuery,
  useCreateConversationMutation,
  useRequestContactMutation,
  useAcceptContactMutation,
  useDeleteContactMutation,
} from '~/lib/hooks/useMessaging';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';
import type { Contact, ContactSearchResult } from '~/types/messaging';

type Nav = NativeStackNavigationProp<MessengerStackParamList, 'MessengerContacts'>;

interface GroupedSection {
  key: string;
  title: string;
  icon: string | null;
  count: number;
  data: (Contact | ContactSearchResult)[];
}

function buildSections(
  contacts: Contact[] | undefined,
  searchText: string,
  globalFromApi: ContactSearchResult[] | undefined,
  searchGlobalTitle: string,
  incomingSectionTitle: string,
): GroupedSection[] {
  if (!contacts) return [];

  const q = searchText.toLowerCase().trim();
  const trimmed = searchText.trim();
  const existingUserIds = new Set((contacts ?? []).map((c) => c.user_id));

  const global =
    trimmed.length >= 2 && globalFromApi
      ? globalFromApi.filter((r) => !existingUserIds.has(r.id))
      : [];

  const incomingPending = contacts.filter(
    (c) => c.direction === 'incoming' && c.status === 'pending',
  );
  const rest = contacts.filter(
    (c) => !(c.direction === 'incoming' && c.status === 'pending'),
  );

  const filterByQ = (arr: Contact[]) =>
    q ? arr.filter((c) => c.name.toLowerCase().includes(q)) : arr;

  const filteredIncoming = filterByQ(incomingPending);
  const filteredRest = filterByQ(rest);

  const out: GroupedSection[] = [];

  if (global.length > 0) {
    out.push({
      key: '__global_search',
      title: searchGlobalTitle,
      icon: null,
      count: global.length,
      data: global,
    });
  }

  if (filteredIncoming.length > 0) {
    out.push({
      key: '__incoming',
      title: incomingSectionTitle,
      icon: null,
      count: filteredIncoming.length,
      data: filteredIncoming,
    });
  }

  if (filteredRest.length === 0) {
    return out;
  }

  return [
    ...out,
    {
      key: '__all',
      title: '',
      icon: null,
      count: filteredRest.length,
      data: filteredRest,
    },
  ];
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
  const {
    data: globalFromApi,
    isFetching: searchGlobalFetching,
  } = useContactSearchQuery(searchText);

  const createConversation = useCreateConversationMutation();
  const requestContact = useRequestContactMutation();
  const acceptContact = useAcceptContactMutation();
  const deleteContact = useDeleteContactMutation();

  const sections = useMemo(
    () =>
      buildSections(
        contacts,
        searchText,
        globalFromApi,
        t('messenger.search_global_section'),
        t('messenger.incoming_requests'),
      ),
    [contacts, searchText, globalFromApi, t],
  );

  const isLoading = loadingContacts;

  const openChatWithUser = useCallback(
    async (userId: string) => {
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
        // handled by react-query
      }
    },
    [createConversation, navigation],
  );

  const handleContactPress = useCallback(
    (contact: Contact) => {
      void openChatWithUser(contact.user_id);
    },
    [openChatWithUser],
  );

  const handleAddFromSearch = useCallback(
    (row: ContactSearchResult) => {
      requestContact.mutate({ contact_user_id: row.id });
    },
    [requestContact],
  );

  const handleRemoveContactById = useCallback(
    (contactId: string) => {
      deleteContact.mutate(contactId);
    },
    [deleteContact],
  );

  const handleRemoveSearchRow = useCallback(
    (row: ContactSearchResult) => {
      const linked = contacts?.find((c) => c.user_id === row.id);
      if (linked) {
        deleteContact.mutate(linked.id);
      }
    },
    [contacts, deleteContact],
  );

  const renderItem = useCallback(
    ({ item }: { item: Contact | ContactSearchResult }) => {
      if ('user_id' in item) {
        const incomingPending =
          item.direction === 'incoming' && item.status === 'pending';
        if (incomingPending) {
          return (
            <ContactRow
              contact={item}
              onPress={() => handleContactPress(item)}
              onAction={() => acceptContact.mutate(item.id)}
              actionLabel={t('messenger.accept_contact')}
              actionLoading={
                acceptContact.isPending && acceptContact.variables === item.id
              }
              onSecondaryAction={() => handleRemoveContactById(item.id)}
              secondaryLabel={t('messenger.decline_contact')}
              secondaryLoading={
                deleteContact.isPending && deleteContact.variables === item.id
              }
            />
          );
        }
        const removing =
          deleteContact.isPending && deleteContact.variables === item.id;
        return (
          <ContactRow
            contact={item}
            onPress={() => handleContactPress(item)}
            onAction={() => handleRemoveContactById(item.id)}
            actionLabel={t('messenger.remove_contact_short')}
            actionLoading={removing}
          />
        );
      }

      const linked = contacts?.find((c) => c.user_id === item.id);
      const isLinked = !!linked || item.is_contact;
      const adding =
        requestContact.isPending &&
        requestContact.variables?.contact_user_id === item.id;
      const removing =
        deleteContact.isPending &&
        linked != null &&
        deleteContact.variables === linked.id;

      return (
        <ContactRow
          contact={item}
          onPress={() => void openChatWithUser(item.id)}
          onAction={
            isLinked
              ? () => handleRemoveSearchRow(item)
              : () => handleAddFromSearch(item)
          }
          actionLabel={
            isLinked
              ? t('messenger.remove_contact_short')
              : t('messenger.add_contact_short')
          }
          actionLoading={adding || removing}
        />
      );
    },
    [
      acceptContact.isPending,
      acceptContact.variables,
      contacts,
      deleteContact.isPending,
      deleteContact.variables,
      handleAddFromSearch,
      handleContactPress,
      handleRemoveContactById,
      handleRemoveSearchRow,
      openChatWithUser,
      requestContact.isPending,
      requestContact.variables?.contact_user_id,
      t,
    ],
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

  const keyExtractor = useCallback(
    (item: Contact | ContactSearchResult) =>
      'user_id' in item ? `c:${item.id}` : `s:${item.id}`,
    [],
  );

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
              accessibilityRole="button"
              accessibilityLabel={t('messenger.search_contacts')}
            >
              <Users size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('MessengerChannels' as never)}
              hitSlop={8}
              style={[styles.headerButton, { borderRadius: radius.lg }]}
              accessibilityRole="button"
              accessibilityLabel={t('messenger.channels', 'Channels')}
            >
              <Radio size={20} color={colors.textSecondary} />
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
            placeholder={t('messenger.search_contacts_placeholder')}
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
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
        {searchText.trim().length >= 2 &&
        searchGlobalFetching &&
        !requestContact.isPending &&
        !deleteContact.isPending ? (
          <View style={{ marginTop: spacing.sm, paddingHorizontal: spacing.lg, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.brandPrimary} />
          </View>
        ) : null}
      </View>
    ),
    [
      insets.top,
      spacing,
      colors,
      radius,
      searchText,
      searchGlobalFetching,
      requestContact.isPending,
      deleteContact.isPending,
      navigation,
      t,
    ],
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
              searchText.trim().length >= 2 &&
              searchGlobalFetching &&
              !requestContact.isPending &&
              !deleteContact.isPending ? (
                <ActivityIndicator color={colors.brandPrimary} size="large" />
              ) : (
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
                    {t('messenger.contacts_not_found')}
                  </Text>
                </>
              )
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
