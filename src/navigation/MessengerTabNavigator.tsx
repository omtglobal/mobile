import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, Users, User, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { ConversationListScreen } from '~/screens/messenger/ConversationListScreen';
import { ContactsScreen } from '~/screens/messenger/ContactsScreen';
import { AccountViewScreen } from '~/screens/messenger/AccountViewScreen';
import { MessengerSettingsScreen } from '~/screens/messenger/MessengerSettingsScreen';

export type MessengerTabParamList = {
  MessengerChatsTab: undefined;
  MessengerContactsTab: undefined;
  MessengerAccountTab: undefined;
  MessengerSettingsTab: undefined;
};

const Tab = createBottomTabNavigator<MessengerTabParamList>();

export function MessengerTabNavigator() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgPrimary,
          borderTopColor: colors.borderDefault,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: spacing.xs,
          paddingBottom: insets.bottom > 0 ? insets.bottom : spacing.sm,
          height: 56 + (insets.bottom > 0 ? insets.bottom : spacing.sm),
        },
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarItemStyle: {
          gap: 2,
        },
      }}
    >
      <Tab.Screen
        name="MessengerChatsTab"
        component={ConversationListScreen}
        options={{
          tabBarLabel: t('messenger.tab_chats', 'Chats'),
          tabBarIcon: ({ color, size }) => (
            <View style={[styles.iconWrap, color === colors.brandPrimary && {
              backgroundColor: colors.brandPrimary + '15',
              borderRadius: radius.lg,
            }]}>
              <MessageCircle size={22} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MessengerContactsTab"
        component={ContactsScreen}
        options={{
          tabBarLabel: t('messenger.tab_contacts', 'Contacts'),
          tabBarIcon: ({ color }) => (
            <View style={[styles.iconWrap, color === colors.brandPrimary && {
              backgroundColor: colors.brandPrimary + '15',
              borderRadius: radius.lg,
            }]}>
              <Users size={22} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MessengerAccountTab"
        component={AccountViewScreen}
        options={{
          tabBarLabel: t('messenger.tab_account', 'Account'),
          tabBarIcon: ({ color }) => (
            <View style={[styles.iconWrap, color === colors.brandPrimary && {
              backgroundColor: colors.brandPrimary + '15',
              borderRadius: radius.lg,
            }]}>
              <User size={22} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MessengerSettingsTab"
        component={MessengerSettingsScreen}
        options={{
          tabBarLabel: t('messenger.tab_settings', 'Settings'),
          tabBarIcon: ({ color }) => (
            <View style={[styles.iconWrap, color === colors.brandPrimary && {
              backgroundColor: colors.brandPrimary + '15',
              borderRadius: radius.lg,
            }]}>
              <Settings size={22} color={color} strokeWidth={2} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
