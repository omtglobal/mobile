import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';

const BTN_SIZE = 40;
const ICON_SIZE = 22;

export type HeaderBackButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
  accessibilityLabel?: string;
};

/** Unified circular back control for custom headers and native stack `headerLeft`. */
export function HeaderBackButton({
  onPress,
  style,
  hitSlop = 8,
  accessibilityLabel,
}: HeaderBackButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? t('common.back')}
      style={({ pressed }) => [
        styles.circle,
        {
          backgroundColor: colors.bgSecondary,
          borderColor: colors.borderDefault,
          opacity: pressed ? 0.88 : 1,
        },
        style,
      ]}
    >
      <ChevronLeft
        color={colors.textPrimary}
        size={ICON_SIZE}
        strokeWidth={2.35}
        style={styles.iconOffset}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOffset: {
    marginLeft: -2,
  },
});
