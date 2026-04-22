import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { AlertTriangle } from 'lucide-react-native';
import { Button, Input, Text } from '~/components/ui';
import { useToast } from '~/components/ui/Toast';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { useAuth } from '~/lib/hooks/useAuth';
import { useBiometric } from '~/lib/hooks/useBiometric';
import { useCartStore } from '~/lib/stores/cart';

/**
 * Account deletion screen — required by Apple App Store Review Guideline 5.1.1(v).
 *
 * The user must:
 *  1. Read what is deleted and what is kept.
 *  2. Confirm with their password (prevents accidental deletion if the phone
 *     is unlocked by someone else).
 *  3. Explicitly tick a confirmation checkbox.
 *
 * On success all local state is wiped (auth, biometric credentials, cart)
 * and the user is navigated back to the app root.
 */
export default function DeleteAccountScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const { colors, spacing } = useTheme();
  const { deleteAccount, user } = useAuth();
  const { disableBiometric } = useBiometric();
  const clearCart = useCartStore((s) => s.clearCart);

  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordRequired = !!user?.email;
  const canSubmit =
    confirmed && !submitting && (!passwordRequired || password.length > 0);

  const performDelete = async () => {
    setPasswordError(null);
    setSubmitting(true);
    try {
      await deleteAccount({
        password: password || undefined,
        reason: reason.trim() || undefined,
      });

      try {
        await disableBiometric();
      } catch {
        // Biometric may not be enabled; ignore.
      }
      clearCart();

      toast.show(t('delete_account.deleted_success'), 'success');
      router.replace('/');
    } catch (err) {
      const status = err instanceof AxiosError ? err.response?.status : undefined;
      if (status === 401 || status === 422) {
        setPasswordError(t('delete_account.failed_wrong_password'));
      } else {
        Alert.alert(t('common.error'), t('delete_account.failed'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = () => {
    if (passwordRequired && !password) {
      setPasswordError(t('delete_account.password_required'));
      return;
    }

    Alert.alert(
      t('delete_account.heading'),
      t('delete_account.warning'),
      [
        { text: t('delete_account.cancel'), style: 'cancel' },
        {
          text: t('delete_account.delete_button'),
          style: 'destructive',
          onPress: performDelete,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Text variant="bodyMd" style={{ color: colors.brandPrimary }}>
            ←
          </Text>
        </Pressable>
        <Text variant="headingMd" style={{ color: colors.textPrimary }}>
          {t('delete_account.title')}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { padding: spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.warningBanner,
            { backgroundColor: colors.error + '15', borderColor: colors.error + '40' },
          ]}
        >
          <AlertTriangle color={colors.error} size={20} />
          <Text variant="bodySm" style={{ color: colors.error, flex: 1 }}>
            {t('delete_account.warning')}
          </Text>
        </View>

        <Text variant="headingSm" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('delete_account.what_is_deleted')}
        </Text>
        <View style={styles.bulletList}>
          <Bullet color={colors.textSecondary}>{t('delete_account.bullet_profile')}</Bullet>
          <Bullet color={colors.textSecondary}>{t('delete_account.bullet_content')}</Bullet>
          <Bullet color={colors.textSecondary}>{t('delete_account.bullet_history')}</Bullet>
          <Bullet color={colors.textSecondary}>{t('delete_account.bullet_sessions')}</Bullet>
        </View>

        <Text variant="headingSm" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('delete_account.what_is_kept')}
        </Text>
        <Text variant="bodySm" color="secondary" style={styles.hint}>
          {t('delete_account.kept_hint')}
        </Text>

        {passwordRequired ? (
          <>
            <Text
              variant="headingSm"
              style={[styles.sectionTitle, { color: colors.textPrimary }]}
            >
              {t('delete_account.confirm_password')}
            </Text>
            <Text variant="bodySm" color="secondary" style={styles.hint}>
              {t('delete_account.password_hint')}
            </Text>
            <Input
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (passwordError) setPasswordError(null);
              }}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              placeholder="••••••••"
              error={passwordError ?? undefined}
            />
          </>
        ) : null}

        <Text variant="headingSm" style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          {t('delete_account.reason')}
        </Text>
        <Input
          value={reason}
          onChangeText={setReason}
          placeholder={t('delete_account.reason_placeholder')}
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top', paddingTop: 12 }}
        />

        <Pressable
          onPress={() => setConfirmed((v) => !v)}
          style={styles.checkboxRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: confirmed }}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: confirmed ? colors.error : colors.borderDefault,
                backgroundColor: confirmed ? colors.error : 'transparent',
              },
            ]}
          >
            {confirmed ? (
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>✓</Text>
            ) : null}
          </View>
          <Text variant="bodySm" style={{ color: colors.textPrimary, flex: 1 }}>
            {t('delete_account.checkbox_label')}
          </Text>
        </Pressable>

        <Button
          variant="destructive"
          size="lg"
          disabled={!canSubmit}
          loading={submitting}
          onPress={onSubmit}
          style={{ marginTop: 8 }}
        >
          {submitting ? t('delete_account.processing') : t('delete_account.delete_button')}
        </Button>

        <Button
          variant="ghost"
          size="md"
          onPress={() => router.back()}
          disabled={submitting}
          style={{ marginTop: 12 }}
        >
          {t('delete_account.cancel')}
        </Button>
      </ScrollView>
    </View>
  );
}

function Bullet({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <View style={styles.bullet}>
      <Text style={[styles.bulletDot, { color }]}>•</Text>
      <Text variant="bodySm" style={{ color, flex: 1 }}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  scroll: { flex: 1 },
  content: { paddingBottom: 48 },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  hint: {
    marginBottom: 12,
    lineHeight: 20,
  },
  bulletList: {
    gap: 6,
    marginBottom: 4,
  },
  bullet: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 16,
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    marginBottom: 4,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
