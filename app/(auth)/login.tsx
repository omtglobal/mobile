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

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'auth.email_required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'auth.invalid_email';
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return 'auth.password_required';
  return null;
}

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleSubmit = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrors({
        email: emailError ? t(emailError) : undefined,
        password: passwordError ? t(passwordError) : undefined,
      });
      return;
    }
    setErrors({});

    try {
      await login({ email: email.trim(), password });
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(main)');
      }
    } catch (err: unknown) {
      const res = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { error?: { message?: string } } } }).response
        : null;
      const status = res?.status;
      const msg = res?.data?.error?.message ?? t('auth.invalid_credentials');
      if (status === 401) {
        setErrors({ general: t('auth.invalid_credentials') });
      } else if (status === 422) {
        const details = res?.data?.error?.details as Record<string, string[]> | undefined;
        setErrors({
          email: details?.email?.[0],
          password: details?.password?.[0],
          general: msg,
        });
      } else {
        setErrors({ general: msg });
      }
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
        <Text variant="headingLg" style={[styles.brand, { color: colors.textPrimary }]}>
          Ninhao
        </Text>
        <Text variant="headingMd" style={[styles.title, { color: colors.textPrimary }]}>
          {t('auth.login')}
        </Text>

        {errors.general ? (
          <View style={[styles.errorBanner, { backgroundColor: colors.error + '20' }]}>
            <Text variant="bodySm" style={{ color: colors.error }}>
              {errors.general}
            </Text>
          </View>
        ) : null}

        <Input
          label={t('auth.email')}
          placeholder={t('auth.placeholder_email')}
          value={email}
          onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
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
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={[styles.eyeBtn, { top: 40 }]}
            hitSlop={12}
          >
            {showPassword ? (
              <EyeOff color={colors.textTertiary} size={22} />
            ) : (
              <Eye color={colors.textTertiary} size={22} />
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotLink}>
          <Text variant="bodySm" style={{ color: colors.brandPrimary }}>{t('auth.forgot_password')}</Text>
        </Pressable>

        <Button
          variant="primary"
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.submitBtn}
        >
          {isLoading ? t('auth.signing_in') : t('auth.login')}
        </Button>

        <View style={styles.footer}>
          <Text variant="bodyMd" color="secondary">{t('auth.no_account')}</Text>
          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text variant="bodyMd" style={{ color: colors.brandPrimary, fontWeight: '600' }}>
              {t('auth.register')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  brand: { textAlign: 'center', marginBottom: 8 },
  title: { marginBottom: 24 },
  errorBanner: { padding: 12, borderRadius: 8, marginBottom: 16 },
  passwordWrapper: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 12, top: 38 },
  forgotLink: { marginTop: -8, marginBottom: 24, alignSelf: 'flex-end' },
  submitBtn: { marginBottom: 24 },
  footer: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
});
