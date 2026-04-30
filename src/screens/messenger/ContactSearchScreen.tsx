import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { HeaderBackButton, Text } from '~/components/ui';
import { ContactRow } from '~/components/messenger';
import {
  useContactSearchQuery,
  useContactsQuery,
  useCreateConversationMutation,
  useRequestContactMutation,
  useDeleteContactMutation,
} from '~/lib/hooks/useMessaging';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';
import type { ContactSearchResult } from '~/types/messaging';

type Nav = NativeStackNavigationProp<MessengerStackParamList, 'MessengerContactSearch'>;

export function ContactSearchScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [query, setQuery] = useState('');

  const {
    data: results,
    isLoading,
    isFetching,
  } = useContactSearchQuery(query);

  const requestContact = useRequestContactMutation();
  const deleteContact = useDeleteContactMutation();
  const { data: contacts } = useContactsQuery();
  const createConversation = useCreateConversationMutation();

  const openChat = useCallback(
    async (result: ContactSearchResult) => {
      try {
        const res = await createConversation.mutateAsync({
          participant_user_id: result.id,
          type: 'direct',
        });
        const conv = res?.data;
        if (conv?.id) {
          navigation.navigate('MessengerChat', { conversationId: conv.id });
        }
      } catch {
        // react-query / toast
      }
    },
    [createConversation, navigation],
  );

  const handleAdd = useCallback(
    (result: ContactSearchResult) => {
      requestContact.mutate({ contact_user_id: result.id });
    },
    [requestContact],
  );

  const handleRemoveSearchRow = useCallback(
    (row: ContactSearchResult) => {
      const linked = contacts?.find((c) => c.user_id === row.id);
      if (linked) deleteContact.mutate(linked.id);
    },
    [contacts, deleteContact],
  );

  const renderItem = useCallback(
    ({ item }: { item: ContactSearchResult }) => {
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
          onPress={() => void openChat(item)}
          onAction={
            isLinked ? () => handleRemoveSearchRow(item) : () => handleAdd(item)
          }
          actionLabel={
            isLinked
              ? t('messenger.remove_contact_short')
              : t('messenger.add_contact')
          }
          actionLoading={adding || removing}
        />
      );
    },
    [
      contacts,
      deleteContact.isPending,
      deleteContact.variables,
      handleAdd,
      handleRemoveSearchRow,
      openChat,
      requestContact.isPending,
      requestContact.variables?.contact_user_id,
      t,
    ],
  );

  const keyExtractor = useCallback((item: ContactSearchResult) => item.id, []);

  const showEmpty = query.trim().length >= 2 && !isFetching && (!results || results.length === 0);

  return (
    <View style={[styles.flex, { backgroundColor: colors.bgPrimary }]}>
      {/* Header with search */}
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
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('messenger.search_contacts_placeholder')}
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.bgSecondary,
              color: colors.textPrimary,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            },
          ]}
        />
      </View>

      {/* Results */}
      {(isLoading || isFetching) &&
      query.trim().length >= 2 &&
      !requestContact.isPending &&
      !deleteContact.isPending ? (
        <View style={[styles.centered, { paddingTop: spacing['3xl'] }]}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      ) : showEmpty ? (
        <View style={[styles.centered, { paddingTop: spacing['3xl'] }]}>
          <Text variant="bodyMd" color="secondary">
            {t('messenger.search_not_found')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results ?? []}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
        />
      )}

      {/* Invite link */}
      <View
        style={[
          styles.inviteContainer,
          {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            paddingBottom: insets.bottom + spacing.md,
            borderTopColor: colors.borderDefault,
          },
        ]}
      >
        <Text variant="bodySm" color="secondary" style={styles.inviteText}>
          {t('messenger.invite_link')}
        </Text>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  inviteContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inviteText: {
    textAlign: 'center',
  },
});
