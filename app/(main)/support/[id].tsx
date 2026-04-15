import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTicket } from '~/lib/hooks/useTickets';
import { Text } from '~/components/ui';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { TicketMessage } from '~/types/models';

function formatDateTime(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return s;
  }
}

function MessageBubble({ msg, isOwn }: { msg: TicketMessage; isOwn: boolean }) {
  const { colors } = useTheme();
  const authorLabel = isOwn ? 'You' : (msg.author_name ?? 'Support');

  return (
    <View style={[styles.bubbleWrap, isOwn && styles.bubbleWrapRight]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isOwn ? colors.brandPrimary : colors.bgTertiary,
            alignSelf: isOwn ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        <Text variant="caption" style={{ color: isOwn ? 'rgba(255,255,255,0.8)' : colors.textTertiary, marginBottom: 4 }}>
          {authorLabel} ({formatDateTime(msg.created_at)})
        </Text>
        <Text variant="bodyMd" style={{ color: isOwn ? '#fff' : colors.textPrimary }}>
          {msg.content}
        </Text>
      </View>
    </View>
  );
}

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const { data, isLoading } = useTicket(id);

  const ticket = data?.data;
  const messages = ticket?.messages ?? [];

  if (isLoading || !ticket) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgSecondary, justifyContent: 'center', alignItems: 'center' }]}>
        <Text variant="bodyMd" color="secondary">{isLoading ? 'Loading...' : 'Ticket not found'}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <Text variant="headingMd" style={{ color: colors.textPrimary }} numberOfLines={2}>
          {ticket.subject}
        </Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: colors.bgTertiary }]}>
            <Text variant="caption" color="secondary">{ticket.status_label ?? ticket.status}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.bgTertiary }]}>
            <Text variant="caption" color="secondary">{ticket.category_label ?? ticket.category}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.bgTertiary }]}>
            <Text variant="caption" color="secondary">{ticket.priority_label ?? ticket.priority}</Text>
          </View>
        </View>
        {ticket.company && (
          <Text variant="bodySm" color="secondary">Seller: {ticket.company.name}</Text>
        )}
        <Text variant="caption" color="secondary">{formatDateTime(ticket.created_at)}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.messages, { padding: spacing.lg }]}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isOwn={msg.author_type === 'buyer' || msg.author_type === 'customer' || msg.author_type === 'user'}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  badges: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  scroll: { flex: 1 },
  messages: { paddingBottom: 32 },
  bubbleWrap: { marginBottom: 12 },
  bubbleWrapRight: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
  },
});
