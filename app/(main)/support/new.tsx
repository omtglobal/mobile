import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCreateTicket } from '~/lib/hooks/useTickets';
import { Button, Input, Text } from '~/components/ui';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { TicketChannel, TicketCategory, TicketPriority } from '~/types/models';

const CHANNEL_KEYS: Record<TicketChannel, string> = {
  seller: 'support.seller',
  platform: 'support.platform',
};

const CATEGORY_KEYS: Record<TicketCategory, string> = {
  general_question: 'support.general_question',
  order_issue: 'support.order_issue',
  technical_issue: 'support.technical_issue',
  product_moderation: 'support.product_moderation',
  company_verification: 'support.company_verification',
  import_errors: 'support.import_errors',
};

const PRIORITY_KEYS: Record<TicketPriority, string> = {
  low: 'support.low',
  medium: 'support.medium',
  high: 'support.high',
  urgent: 'support.urgent',
};

export default function NewTicketScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ companyId?: string; orderId?: string }>();
  const { colors, spacing, radius } = useTheme();
  const createTicket = useCreateTicket();

  const channelOptions = (['seller', 'platform'] as const).map((v) => ({ value: v, label: t(CHANNEL_KEYS[v]) }));
  const categoryOptions = (['general_question', 'order_issue', 'technical_issue', 'product_moderation', 'company_verification', 'import_errors'] as const).map((v) => ({ value: v, label: t(CATEGORY_KEYS[v]) }));
  const priorityOptions = (['low', 'medium', 'high', 'urgent'] as const).map((v) => ({ value: v, label: t(PRIORITY_KEYS[v]) }));

  const [channel, setChannel] = useState<TicketChannel>('platform');
  const [category, setCategory] = useState<TicketCategory>('general_question');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [companyId, setCompanyId] = useState(params.companyId ?? '');
  const [orderId, setOrderId] = useState(params.orderId ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!subject.trim()) e.subject = t('auth.required');
    if (!message.trim()) e.message = t('auth.required');
    if (channel === 'seller' && !companyId.trim()) e.company_id = t('support.company_required');

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      const res = await createTicket.mutateAsync({
        channel,
        subject: subject.trim(),
        message: message.trim(),
        category,
        priority,
        company_id: companyId || undefined,
        order_id: orderId || undefined,
      });
      router.replace(`/support/${res.data.id}`);
    } catch (err: unknown) {
      const res = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: { details?: Record<string, string[]> } } } }).response
        : null;
      const details = res?.data?.error?.details as Record<string, string[]> | undefined;
      if (details) {
        const e: Record<string, string> = {};
        for (const [k, v] of Object.entries(details)) {
          if (v?.[0]) e[k] = v[0];
        }
        setErrors(e);
      }
    }
  };

  const Chip = ({
    options,
    value,
    onChange,
  }: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (v: TicketChannel | TicketCategory | TicketPriority) => void;
  }) => (
    <View style={styles.chips}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value as TicketChannel | TicketCategory | TicketPriority)}
          style={({ pressed }) => [
            styles.chip,
            { backgroundColor: value === opt.value ? colors.brandPrimary : colors.bgTertiary, borderRadius: radius.md, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text variant="bodySm" style={{ color: value === opt.value ? '#fff' : colors.textSecondary }}>{opt.label}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bgSecondary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={[styles.scroll, { padding: spacing.lg }]} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text variant="bodyMd" color="secondary" style={styles.label}>{t('support.channel')}</Text>
          <Chip options={channelOptions} value={channel} onChange={setChannel} />
        </View>

        <View style={styles.section}>
          <Text variant="bodyMd" color="secondary" style={styles.label}>{t('support.category')}</Text>
          <Chip options={categoryOptions} value={category} onChange={setCategory} />
        </View>

        <View style={styles.section}>
          <Text variant="bodyMd" color="secondary" style={styles.label}>{t('support.priority')}</Text>
          <Chip options={priorityOptions} value={priority} onChange={setPriority} />
        </View>

        <Input label={t('support.subject')} placeholder={t('support.brief_description')} value={subject} onChangeText={setSubject} error={errors.subject} />
        <Input label={t('support.description')} placeholder={t('support.describe_issue')} value={message} onChangeText={setMessage} error={errors.message} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: 'top' }} />

        {channel === 'seller' && (
          <Input label={t('support.company_id')} placeholder={t('support.company_id_placeholder')} value={companyId} onChangeText={setCompanyId} error={errors.company_id} editable={!params.companyId} />
        )}
        {params.orderId && (
          <Text variant="bodySm" color="secondary">{t('orders.order_ref', { id: params.orderId.slice(0, 8) })}</Text>
        )}

        <Button variant="primary" onPress={handleSubmit} disabled={createTicket.isPending} style={styles.submitBtn}>
          {createTicket.isPending ? t('support.sending') : t('support.submit')}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 32 },
  section: { marginBottom: 20 },
  label: { marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14 },
  submitBtn: { marginTop: 8 },
});
