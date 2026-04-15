import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '~/components/ui';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { Category } from '~/types/models';

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { colors, radius, spacing } = useTheme();

  const topLevel = categories.filter((c) => !c.parent_id);
  const cols = 4;
  const allItem = { id: 'all', name: t('home.all'), slug: 'all' };
  const combined = [allItem, ...topLevel];
  const row1 = combined.slice(0, cols);
  const row2 = combined.slice(cols, cols * 2);
  const cardWidth = (width - spacing.lg * 2 - 8 * (cols - 1)) / cols;

  const renderCard = (item: { id: string; name: string; slug?: string }) => (
    <Pressable
      key={item.id}
      onPress={() =>
        item.id === 'all' ? router.push('/catalog') : router.push(`/category/${item.id}`)
      }
      style={({ pressed }) => [
        styles.card,
        {
          width: cardWidth,
          backgroundColor: item.id === 'all' ? colors.brandPrimary : colors.bgSecondary,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: item.id === 'all' ? colors.brandPrimary : colors.borderDefault,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        variant="bodySm"
        numberOfLines={1}
        style={[styles.name, item.id === 'all' && { color: '#FFFFFF', fontWeight: '600' }]}
      >
        {item.name}
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.lg }]}>
      <View style={styles.row}>
        {row1.map(renderCard)}
      </View>
      {row2.length > 0 && (
        <View style={styles.row}>
          {row2.map(renderCard)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  card: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    textAlign: 'center',
  },
});
