import { StyleSheet, View, Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Package, MapPin, MessageSquare, Settings, HelpCircle, Info, LogOut } from 'lucide-react-native';
import { useAuth } from '~/lib/hooks/useAuth';
import { UserAvatar } from '~/components/layout/UserAvatar';
import { Button, Text } from '~/components/ui';
import { useTheme } from '~/lib/contexts/ThemeContext';

function MenuRow({
  icon: Icon,
  label,
  onPress,
}: {
  icon: React.ComponentType<{ color: string; size: number }>;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        { borderBottomColor: colors.borderDefault, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Icon color={colors.textPrimary} size={22} />
      <Text variant="bodyMd" style={styles.menuLabel}>
        {label}
      </Text>
      <Text variant="bodySm" color="secondary">
        →
      </Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user, logout } = useAuth();

  const scrollBottomPadding = spacing.xl + insets.bottom + 24;

  if (!isAuthenticated) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bgSecondary }]}
        contentContainerStyle={[styles.content, { padding: spacing.xl, paddingBottom: scrollBottomPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.guestSection}>
          <UserAvatar name={t('profile.guest')} size={64} />
          <Text variant="headingMd" style={[styles.guestTitle, { color: colors.textPrimary }]}>
            {t('tabs.profile')}
          </Text>
          <Text variant="bodyMd" color="secondary" style={styles.guestSubtitle}>
            {t('auth.login_prompt')}
          </Text>
          <View style={styles.buttons}>
            <Button
              variant="primary"
              onPress={() => router.push('/(auth)/login')}
              style={styles.button}
            >
              {t('auth.login')}
            </Button>
            <Button
              variant="outline"
              onPress={() => router.push('/(auth)/register')}
              style={styles.button}
            >
              {t('auth.register')}
            </Button>
          </View>
        </View>

        <View style={[styles.menuSection, { backgroundColor: colors.bgPrimary, borderColor: colors.borderDefault }]}>
          <MenuRow icon={Settings} label={t('profile.settings')} onPress={() => router.push('/settings')} />
          <MenuRow icon={HelpCircle} label={t('profile.support')} onPress={() => router.push('/support')} />
          <MenuRow icon={Info} label={t('profile.about')} onPress={() => router.push('/settings')} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgSecondary }]}
      contentContainerStyle={[styles.content, { padding: spacing.xl, paddingBottom: scrollBottomPadding }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.userSection, { backgroundColor: colors.bgPrimary, borderColor: colors.borderDefault }]}>
        <UserAvatar name={user?.name ?? user?.email} size={64} />
        <Text variant="headingMd" style={[styles.userName, { color: colors.textPrimary }]}>
          {user?.name ?? 'User'}
        </Text>
        <Text variant="bodySm" color="secondary">
          {user?.email}
        </Text>
        {user?.phone ? (
          <Text variant="bodySm" color="secondary">
            {user.phone}
          </Text>
        ) : null}
      </View>

      <View style={[styles.menuSection, { backgroundColor: colors.bgPrimary, borderColor: colors.borderDefault }]}>
        <MenuRow icon={Package} label={t('profile.my_orders')} onPress={() => router.push('/(main)/(tabs)/orders')} />
        <MenuRow icon={MapPin} label={t('profile.addresses')} onPress={() => router.push('/addresses')} />
        <MenuRow icon={MessageSquare} label={t('support.my_tickets')} onPress={() => router.push('/support')} />
      </View>

      <View style={[styles.menuSection, { backgroundColor: colors.bgPrimary, borderColor: colors.borderDefault }]}>
        <MenuRow icon={Settings} label={t('profile.settings')} onPress={() => router.push('/settings')} />
        <MenuRow icon={HelpCircle} label={t('profile.support')} onPress={() => router.push('/support')} />
        <MenuRow icon={Info} label={t('profile.about')} onPress={() => router.push('/settings')} />
      </View>

      <Pressable
        onPress={() => void logout()}
        style={({ pressed }) => [
          styles.logoutBtn,
          { opacity: pressed ? 0.75 : 1 },
        ]}
        hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
        accessibilityRole="button"
        accessibilityLabel={t('profile.sign_out')}
      >
        <LogOut color={colors.error} size={20} />
        <Text variant="bodyMd" style={{ color: colors.error, marginLeft: 8 }}>
          {t('profile.sign_out')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32 },
  guestSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  guestTitle: { marginTop: 16, marginBottom: 8 },
  guestSubtitle: { textAlign: 'center', marginBottom: 24 },
  buttons: { gap: 12, width: '100%', maxWidth: 280 },
  button: { width: '100%' },
  userSection: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  userName: { marginTop: 12, marginBottom: 4 },
  menuSection: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  menuLabel: { flex: 1 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 48,
  },
});
