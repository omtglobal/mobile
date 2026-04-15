import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '~/components/ui';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { API_BASE_URL, API_FULL_URL } from '~/constants/config';
import { healthCheck } from '~/lib/api/client';
import { usePreferencesStore } from '~/lib/stores/preferences';
import { useAuth } from '~/lib/hooks/useAuth';
import { authApi } from '~/lib/api/auth';
import { LANGUAGES } from '~/i18n';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';
import * as WebBrowser from 'expo-web-browser';

type ConnectionStatus = 'idle' | 'checking' | 'ok' | 'error';

const THEME_OPTIONS = ['light', 'dark', 'system'] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const { theme, setTheme, language, setLanguage, biometricEnabled, setBiometricEnabled } = usePreferencesStore();
  const { user, isAuthenticated, fetchUser } = useAuth();
  const [messengerSearchUpdating, setMessengerSearchUpdating] = useState(false);

  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cacheClearing, setCacheClearing] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then((has) => setBiometricAvailable(has));
  }, []);

  const testConnection = useCallback(async () => {
    setStatus('checking');
    setErrorMsg(null);
    setLatencyMs(null);
    const start = Date.now();
    try {
      const res = await healthCheck();
      setLatencyMs(Date.now() - start);
      setStatus(res.data?.status === 'ok' ? 'ok' : 'error');
      if (res.data?.status !== 'ok') {
        setErrorMsg(res.data?.api ?? 'Unknown response');
      }
    } catch (err: unknown) {
      setStatus('error');
      setLatencyMs(Date.now() - start);
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Network error';
      setErrorMsg(msg);
    }
  }, []);

  const clearCache = useCallback(async () => {
    setCacheClearing(true);
    try {
      const dir = FileSystem.cacheDirectory;
      if (dir) {
        const items = await FileSystem.readDirectoryAsync(dir);
        for (const item of items) {
          await FileSystem.deleteAsync(`${dir}${item}`, { idempotent: true });
        }
      }
      Alert.alert(t('settings.done'), t('settings.cache_cleared'));
    } catch {
      Alert.alert(t('common.error'), t('settings.cache_failed'));
    } finally {
      setCacheClearing(false);
    }
  }, [t]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text variant="bodyMd" style={{ color: colors.brandPrimary }}>←</Text>
        </Pressable>
        <Text variant="headingMd" style={{ color: colors.textPrimary }}>{t('settings.title')}</Text>
      </View>
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: spacing.lg }]}>
      <Text variant="headingMd" style={[styles.title, { color: colors.textPrimary }]}>{t('settings.title')}</Text>

      <View style={[styles.section, { backgroundColor: colors.bgPrimary, borderColor: colors.borderDefault }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('settings.appearance')}</Text>
        <View style={styles.row}>
          <Text variant="bodyMd" style={{ color: colors.textSecondary }}>{t('settings.theme')}</Text>
          <View style={styles.chips}>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setTheme(opt)}
                style={[
                  styles.chip,
                  { backgroundColor: theme === opt ? colors.brandPrimary : colors.bgTertiary, borderRadius: 8 },
                ]}
              >
                <Text variant="bodySm" style={{ color: theme === opt ? '#fff' : colors.textSecondary, textTransform: 'capitalize' }}>
                  {opt === 'light' ? t('settings.theme_light') : opt === 'dark' ? t('settings.theme_dark') : t('settings.theme_system')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={[styles.row, { marginTop: 12 }]}>
          <Text variant="bodyMd" style={{ color: colors.textSecondary }}>{t('settings.language')}</Text>
          <View style={styles.langGrid}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setLanguage(lang.code)}
                style={[
                  styles.langChip,
                  {
                    backgroundColor: language === lang.code ? colors.brandPrimary : colors.bgTertiary,
                    borderRadius: 8,
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>{lang.flag}</Text>
                <Text variant="bodySm" style={{ color: language === lang.code ? '#fff' : colors.textSecondary, marginLeft: 4 }}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {isAuthenticated && user ? (
        <View style={[styles.section, { backgroundColor: colors.bgPrimary, borderColor: colors.borderDefault }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('main.messenger')}</Text>
          <Text variant="bodySm" color="secondary" style={{ marginBottom: 12 }}>
            {t('settings.messenger_searchable_hint')}
          </Text>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text variant="bodyMd" style={{ color: colors.textSecondary, flex: 1, paddingRight: 12 }}>
              {t('settings.messenger_searchable')}
            </Text>
            <Switch
              value={user.messenger_searchable !== false}
              disabled={messengerSearchUpdating}
              onValueChange={async (v) => {
                setMessengerSearchUpdating(true);
                try {
                  await authApi.updateProfile({ messenger_searchable: v });
                  await fetchUser();
                } catch {
                  Alert.alert(t('common.error'), t('settings.failed'));
                } finally {
                  setMessengerSearchUpdating(false);
                }
              }}
              trackColor={{ false: colors.borderDefault, true: colors.brandPrimary }}
            />
          </View>
        </View>
      ) : null}

      {biometricAvailable && (
        <View style={[styles.section, { backgroundColor: colors.bgPrimary, borderColor: colors.borderDefault }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('settings.security')}</Text>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text variant="bodyMd" style={{ color: colors.textSecondary }}>{t('settings.biometric')}</Text>
            <Switch value={biometricEnabled} onValueChange={setBiometricEnabled} trackColor={{ false: colors.borderDefault, true: colors.brandPrimary }} />
          </View>
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.bgPrimary, borderColor: colors.borderDefault }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('settings.notifications')}</Text>
        <View style={styles.row}>
          <Text variant="bodyMd" style={{ color: colors.textSecondary }}>{t('settings.push_notifications')}</Text>
          <Text variant="bodySm" color="secondary" style={{ maxWidth: 140, textAlign: 'right' }}>
            {t('settings.push_coming')}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('settings.cache')}</Text>
        <TouchableOpacity
          onPress={clearCache}
          disabled={cacheClearing}
          style={[styles.button, { backgroundColor: colors.bgTertiary }]}
        >
          {cacheClearing ? <ActivityIndicator size="small" color={colors.textPrimary} /> : <Text style={[styles.buttonText, { color: colors.textPrimary }]}>{t('settings.clear_image_cache')}</Text>}
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.bgPrimary, borderColor: colors.borderDefault }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('settings.api_connection')}</Text>
        <Text style={[styles.mono, { color: colors.textSecondary }]} numberOfLines={2}>{API_FULL_URL}</Text>
        <Text style={[styles.hint, { color: colors.textTertiary }]}>Base: {API_BASE_URL}</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.brandPrimary }]} onPress={testConnection} disabled={status === 'checking'}>
          {status === 'checking' ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>{t('settings.test_connection')}</Text>}
        </TouchableOpacity>
        {status === 'ok' && (
          <View style={[styles.result, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.resultText, { color: colors.success }]}>{t('settings.connected')}</Text>
            {latencyMs != null && <Text style={[styles.hint, { color: colors.textSecondary }]}>{latencyMs} ms</Text>}
          </View>
        )}
        {status === 'error' && (
          <View style={[styles.result, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.resultText, { color: colors.error }]}>{t('settings.failed')}</Text>
            {errorMsg && <Text style={[styles.hint, { color: colors.textSecondary }]} numberOfLines={3}>{errorMsg}</Text>}
          </View>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.bgPrimary, borderColor: colors.borderDefault }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('settings.legal')}</Text>
        <TouchableOpacity
          onPress={() => WebBrowser.openBrowserAsync('https://ninhao.com/privacy')}
          style={styles.legalRow}
        >
          <Text variant="bodyMd" style={{ color: colors.brandPrimary }}>
            {t('settings.privacy_policy')}
          </Text>
        </TouchableOpacity>
        <View style={[styles.legalDivider, { backgroundColor: colors.borderDefault }]} />
        <TouchableOpacity
          onPress={() => WebBrowser.openBrowserAsync('https://ninhao.com/support')}
          style={styles.legalRow}
        >
          <Text variant="bodyMd" style={{ color: colors.brandPrimary }}>
            {t('settings.support_page')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.bgPrimary, borderColor: colors.borderDefault }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{t('settings.about')}</Text>
        <Text variant="bodyMd" color="secondary">
          {t('settings.version')}: {Constants.expoConfig?.version ?? '1.0.0'} ({t('settings.build')} {Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? '—'})
        </Text>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  scroll: { flex: 1 },
  content: { paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, opacity: 0.7, marginBottom: 24 },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 12 },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, width: '100%' },
  langChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12 },
  mono: { fontFamily: 'monospace', fontSize: 12, marginBottom: 4 },
  hint: { fontSize: 12, marginTop: 4 },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  result: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  resultText: { fontWeight: '600', marginBottom: 4 },
  legalRow: { paddingVertical: 4 },
  legalDivider: { height: StyleSheet.hairlineWidth, marginVertical: 8 },
});
