import { Pressable, StyleSheet, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '~/components/ui';
import { useTheme } from '~/lib/contexts/ThemeContext';

/** Static search bar — tap navigates to /search */
export function SearchBar() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, radius, spacing } = useTheme();

  return (
    <Pressable
      testID="search-bar"
      onPress={() => router.push('/search')}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.bgSecondary,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.borderDefault,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Search color={colors.textTertiary} size={20} />
      <Text variant="bodyMd" color="secondary" style={styles.placeholder}>
        {t('home.search_placeholder')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  placeholder: {
    flex: 1,
  },
});
