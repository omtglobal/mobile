import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';

export function EmptyConversations() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: colors.bgSecondary,
            borderRadius: radius.xl,
            marginBottom: spacing.lg,
          },
        ]}
      >
        <MessageCircle size={40} color={colors.textTertiary} />
      </View>
      <Text variant="headingSm" color="primary" style={{ marginBottom: spacing.sm }}>
        {t('messenger.no_conversations')}
      </Text>
      <Text variant="bodySm" color="secondary" style={styles.hint}>
        {t('messenger.no_conversations_hint')}
      </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    textAlign: 'center',
  },
});
