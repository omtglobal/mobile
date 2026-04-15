import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LogIn } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';

export function MessengerLoginPrompt() {
  const { t } = useTranslation();
  const { colors, spacing, radius, typography } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.bgPrimary, paddingTop: insets.top + spacing.xl },
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: colors.bgSecondary }]}>
        <LogIn size={40} color={colors.textTertiary} />
      </View>
      <Text
        variant="headingMd"
        color="primary"
        style={[styles.centered, { marginTop: spacing.lg, marginBottom: spacing.sm }]}
      >
        {t('messenger.login_required')}
      </Text>
      <Pressable
        onPress={() => router.push('/(auth)/login')}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? colors.brandPrimary + 'DD' : colors.brandPrimary,
            borderRadius: radius.md,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
            marginTop: spacing.xl,
          },
        ]}
      >
        <Text
          variant="button"
          style={{ color: '#FFFFFF', ...typography.button }}
        >
          {t('messenger.go_login')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
