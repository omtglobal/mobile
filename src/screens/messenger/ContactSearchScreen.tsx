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
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import { ContactRow } from '~/components/messenger';
import { useContactSearchQuery, useRequestContactMutation } from '~/lib/hooks/useMessaging';
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

  const handleAdd = useCallback(
    (result: ContactSearchResult) => {
      requestContact.mutate({ contact_user_id: result.id });
    },
    [requestContact],
  );

  const renderItem = useCallback(
    ({ item }: { item: ContactSearchResult }) => (
      <ContactRow
        contact={item}
        onPress={() => {}}
        onAction={item.is_contact ? undefined : () => handleAdd(item)}
        actionLabel={item.is_contact ? undefined : t('messenger.add_contact')}
      />
    ),
    [handleAdd, t],
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
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <ChevronLeft size={28} color={colors.textPrimary} />
        </Pressable>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('messenger.search_contacts_placeholder')}
          placeholderTextColor={colors.textTertiary}
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
      {(isLoading || isFetching) && query.trim().length >= 2 ? (
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
