import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Text } from '~/components/ui';

interface AuthPromptProps {
  title: string;
  message: string;
}

export function AuthPrompt({ title, message }: AuthPromptProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text variant="headingLg" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMd" color="secondary" style={styles.message}>
        {message}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
  },
  buttons: {
    gap: 12,
    width: '100%',
    maxWidth: 280,
  },
  button: {
    width: '100%',
  },
});
