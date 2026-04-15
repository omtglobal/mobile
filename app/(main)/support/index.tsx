import { ScrollView, StyleSheet, View, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Plus } from 'lucide-react-native';
import { useAuth } from '~/lib/hooks/useAuth';
import { AuthPrompt } from '~/components/layout/AuthPrompt';
import { useTickets } from '~/lib/hooks/useTickets';
import { Text } from '~/components/ui';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { TicketResource } from '~/types/models';

function formatDate(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return s;
  }
}

function TicketCard({ ticket, onPress }: { ticket: TicketResource; onPress: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isOpen = ticket.status !== 'closed';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.bgPrimary, borderColor: colors.borderDefault, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Text variant="headingSm" style={{ color: colors.textPrimary }} numberOfLines={2}>
        {ticket.subject}
      </Text>
      <Text variant="caption" color="secondary">#{ticket.id.slice(0, 8)}</Text>
      <View style={styles.meta}>
        <View style={[styles.statusBadge, { backgroundColor: isOpen ? colors.success + '20' : colors.bgTertiary }]}>
          <Text variant="caption" style={{ color: isOpen ? colors.success : colors.textSecondary }}>
            {ticket.status_label ?? ticket.status}
          </Text>
        </View>
        <Text variant="caption" color="secondary">• {formatDate(ticket.created_at)}</Text>
      </View>
      <Text variant="bodySm" color="secondary">
        {t('support.messages_count', { count: ticket.message_count ?? ticket.messages?.length ?? 0 })}
      </Text>
    </Pressable>
  );
}

export default function SupportListScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { isAuthenticated } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useTickets({ per_page: 20 });

  const tickets = data?.data ?? [];

  if (!isAuthenticated) {
    return <AuthPrompt title={t('support.title')} message={t('auth.login_prompt_support')} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <Text variant="headingMd" style={{ color: colors.textPrimary }}>{t('support.my_tickets')}</Text>
        <Pressable
          onPress={() => router.push('/support/new')}
          style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Plus color={colors.brandPrimary} size={22} />
          <Text variant="bodyMd" style={{ color: colors.brandPrimary, fontWeight: '600' }}>{t('support.new')}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isLoading}
            onRefresh={refetch}
            tintColor={colors.brandPrimary}
          />
        }
      >
        {isLoading ? (
          <Text variant="bodyMd" color="secondary">{t('common.loading')}</Text>
        ) : tickets.length === 0 ? (
          <View style={styles.empty}>
            <MessageSquare color={colors.textTertiary} size={48} />
            <Text variant="bodyMd" color="secondary" style={styles.emptyText}>{t('support.no_tickets')}</Text>
            <Pressable onPress={() => router.push('/support/new')} style={[styles.emptyBtn, { backgroundColor: colors.brandPrimary }]}>
              <Text variant="bodyMd" style={{ color: '#fff', fontWeight: '600' }}>{t('support.create_ticket')}</Text>
            </Pressable>
          </View>
        ) : (
          tickets.map((t) => (
            <TicketCard key={t.id} ticket={t} onPress={() => router.push(`/support/${t.id}`)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { marginTop: 16, marginBottom: 24 },
  emptyBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
});
