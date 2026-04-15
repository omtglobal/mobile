import { Tabs } from 'expo-router';
import { Home, LayoutGrid, ShoppingCart, Package, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { useCartStore } from '~/lib/stores/cart';

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const cartCount = useCartStore((s) => s.totalItems());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          height: 49 + insets.bottom,
          paddingBottom: insets.bottom,
          backgroundColor: colors.bgPrimary,
          borderTopColor: colors.borderDefault,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: t('tabs.catalog'),
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('tabs.cart'),
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('tabs.orders'),
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
