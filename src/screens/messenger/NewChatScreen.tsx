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
import {
  useContactSearchQuery,
  useCreateConversationMutation,
} from '~/lib/hooks/useMessaging';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MessengerStackParamList } from '~/navigation/MessengerNavigator';
import type { ContactSearchResult } from '~/types/messaging';

type Nav = NativeStackNavigationProp<MessengerStackParamList, 'MessengerNewChat'>;

export function NewChatScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);

  const {
    data: results,
    isLoading,
    isFetching,
  } = useContactSearchQuery(query);

  const createConversation = useCreateConversationMutation();

  const handleSelect = useCallback(
    async (contact: ContactSearchResult) => {
      if (creating) return;
      setCreating(true);
      try {
        const res = await createConversation.mutateAsync({
          participant_user_id: contact.id,
          type: 'direct',
        });
        const conv = res?.data;
        if (conv?.id) {
          navigation.replace('MessengerChat', { conversationId: conv.id });
        }
      } catch {
        // mutation error handled by react-query
      } finally {
        setCreating(false);
      }
    },
    [createConversation, creating, navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: ContactSearchResult }) => (
      <ContactRow
        contact={item}
        onPress={() => handleSelect(item)}
      />
    ),
    [handleSelect],
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
        <Text variant="headingSm" color="primary" style={styles.title}>
          {t('messenger.new_chat')}
        </Text>
      </View>

      {/* Search input */}
      <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
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

      {/* Creating overlay */}
      {creating && (
        <View style={styles.creatingOverlay}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      )}

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
    marginRight: 4,
  },
  title: {
    flex: 1,
  },
  searchInput: {
    fontSize: 15,
    lineHeight: 20,
  },
  creatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
