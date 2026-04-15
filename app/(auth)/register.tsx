import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '~/lib/hooks/useAuth';
import { Button, Input, Text } from '~/components/ui';
import { useTheme } from '~/lib/contexts/ThemeContext';

function validateName(name: string): string | null {
  if (!name.trim()) return 'auth.name_required';
  if (name.trim().length < 2) return 'auth.name_min_length';
  return null;
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'auth.email_required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'auth.invalid_email';
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return 'auth.password_required';
  if (password.length < 8) return 'auth.password_min_length';
  return null;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmError =
      passwordConfirmation !== password ? 'auth.passwords_dont_match' : !passwordConfirmation ? 'auth.required' : null;

    if (nameError || emailError || passwordError || confirmError) {
      setErrors({
        name: nameError ? t(nameError) : undefined,
        email: emailError ? t(emailError) : undefined,
        password: passwordError ? t(passwordError) : undefined,
        password_confirmation: confirmError ? t(confirmError) : undefined,
      });
      return;
    }
    setErrors({});

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(main)');
      }
    } catch (err: unknown) {
      const res = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { error?: { message?: string; details?: Record<string, string[]> } } } }).response
        : null;
      const details = res?.data?.error?.details as Record<string, string[]> | undefined;
      setErrors({
        name: details?.name?.[0],
        email: details?.email?.[0],
        password: details?.password?.[0],
        password_confirmation: details?.password_confirmation?.[0],
        general: res?.data?.error?.message ?? t('auth.register_failed'),
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bgSecondary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { padding: spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text variant="headingMd" style={[styles.title, { color: colors.textPrimary }]}>
          {t('auth.register')}
        </Text>

        {errors.general ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.error + '20' }]}>
            <Text variant="bodySm" style={{ color: colors.error }}>{errors.general}</Text>
          </View>
        ) : null}

        <Input
          label={t('auth.name')}
          placeholder={t('auth.placeholder_name')}
          value={name}
          onChangeText={(t) => { setName(t); setErrors((e) => ({ ...e, name: undefined })); }}
          error={errors.name}
          autoCapitalize="words"
        />

        <Input
          label={t('auth.email')}
          placeholder={t('auth.placeholder_email')}
          value={email}
          onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordWrapper}>
          <Input
            label={t('auth.password')}
            placeholder={t('auth.placeholder_password')}
            value={password}
            onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
            error={errors.password}
            secureTextEntry={!showPassword}
            style={{ paddingRight: 44 }}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} style={[styles.eyeBtn, { top: 40 }]} hitSlop={12}>
            {showPassword ? <EyeOff color={colors.textTertiary} size={22} /> : <Eye color={colors.textTertiary} size={22} />}
          </Pressable>
        </View>
        <Text variant="caption" color="secondary" style={styles.hint}>{t('auth.password_min_length')}</Text>

        <View style={styles.passwordWrapper}>
          <Input
            label={t('auth.confirm_password')}
            placeholder={t('auth.placeholder_password')}
            value={passwordConfirmation}
            onChangeText={(t) => { setPasswordConfirmation(t); setErrors((e) => ({ ...e, password_confirmation: undefined })); }}
            error={errors.password_confirmation}
            secureTextEntry={!showPasswordConfirm}
            style={{ paddingRight: 44 }}
          />
          <Pressable onPress={() => setShowPasswordConfirm(!showPasswordConfirm)} style={[styles.eyeBtn, { top: 40 }]} hitSlop={12}>
            {showPasswordConfirm ? <EyeOff color={colors.textTertiary} size={22} /> : <Eye color={colors.textTertiary} size={22} />}
          </Pressable>
        </View>

        <Button variant="primary" onPress={handleSubmit} disabled={isLoading} style={styles.submitBtn}>
          {isLoading ? t('auth.creating_account') : t('auth.register')}
        </Button>

        <View style={styles.footer}>
          <Text variant="bodyMd" color="secondary">{t('auth.has_account')}</Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text variant="bodyMd" style={{ color: colors.brandPrimary, fontWeight: '600' }}>{t('auth.login')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  title: { marginBottom: 24 },
  errorBanner: { padding: 12, borderRadius: 8, marginBottom: 16 },
  passwordWrapper: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 12 },
  hint: { marginTop: -8, marginBottom: 12 },
  submitBtn: { marginBottom: 24 },
  footer: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
});
