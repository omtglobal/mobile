import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronRight, LayoutGrid } from 'lucide-react-native';
import { Text } from '~/components/ui';
import { useCategoriesTree } from '~/lib/hooks/useCategories';
import { useTheme } from '~/lib/contexts/ThemeContext';
import type { Category } from '~/types/models';

function CategoryRow({
  category,
  level,
  expandedIds,
  onToggle,
  onSelect,
}: {
  category: Category;
  level: number;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const { colors, radius, spacing } = useTheme();
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);

  const handlePress = () => {
    if (hasChildren) {
      onToggle(category.id);
    } else {
      onSelect(category.id);
    }
  };

  return (
    <View>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.row,
          {
            paddingLeft: spacing.lg + level * 20,
            paddingRight: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: pressed ? colors.bgSecondary : colors.bgPrimary,
            borderBottomColor: colors.borderDefault,
          },
        ]}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown color={colors.textSecondary} size={20} />
          ) : (
            <ChevronRight color={colors.textSecondary} size={20} />
          )
        ) : (
          <View style={{ width: 20 }} />
        )}
        <View style={styles.rowContent}>
          <Text variant="bodyMd">{category.name}</Text>
          {category.products_count != null && category.products_count > 0 && (
            <Text variant="caption" color="secondary">
              ({category.products_count})
            </Text>
          )}
        </View>
      </Pressable>
      {hasChildren && isExpanded &&
        category.children!.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            level={level + 1}
            expandedIds={expandedIds}
            onToggle={onToggle}
            onSelect={onSelect}
          />
        ))}
    </View>
  );
}

export default function CatalogScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useCategoriesTree();
  const categories = data?.data ?? [];

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelect = (id: string) => {
    router.push(`/category/${id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary }]}>
      <View style={[styles.header, { backgroundColor: colors.bgPrimary, borderBottomColor: colors.borderDefault }]}>
        <LayoutGrid color={colors.textPrimary} size={24} />
        <Text variant="headingMd" style={styles.title}>
          Catalog
        </Text>
      </View>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={[styles.skeleton, { backgroundColor: colors.bgTertiary }]} />
        ) : (
          categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              level={0}
              expandedIds={expandedIds}
              onToggle={handleToggle}
              onSelect={handleSelect}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skeleton: {
    height: 200,
    margin: 16,
    borderRadius: 10,
  },
});
