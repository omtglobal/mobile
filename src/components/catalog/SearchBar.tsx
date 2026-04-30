import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** Called when user presses "search" on the keyboard (optional: save history, etc.). */
  onSubmitEditing?: () => void;
  placeholder?: string;
};

/** Inline search field for catalog home (does not navigate away). */
export function SearchBar({ value, onChangeText, onSubmitEditing, placeholder }: Props) {
  const { t } = useTranslation();
  const { colors, radius, typography } = useTheme();

  return (
    <View
      testID="search-bar"
      style={[
        styles.container,
        {
          backgroundColor: colors.bgSecondary,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.borderDefault,
        },
      ]}
    >
      <Search color={colors.textTertiary} size={20} />
      <TextInput
        testID="search-input"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? t('home.search_placeholder')}
        placeholderTextColor={colors.textTertiary}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          typography.bodyMd,
          { color: colors.textPrimary },
        ]}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('home.clear')}
        >
          <X color={colors.textTertiary} size={20} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    margin: 0,
  },
});
