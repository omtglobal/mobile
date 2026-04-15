import React from 'react';
import {
  NavigationContainer,
  NavigationIndependentTree,
  DefaultTheme,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '~/lib/hooks/useAuth';
import { useMessagingRealtime } from '~/lib/hooks/useMessagingRealtime';
import { MessengerLoginPrompt } from '~/components/messenger/MessengerLoginPrompt';
import { MessengerTabNavigator } from '~/navigation/MessengerTabNavigator';
import { ChatScreen } from '~/screens/messenger/ChatScreen';
import { ContactSearchScreen } from '~/screens/messenger/ContactSearchScreen';
import { NewChatScreen } from '~/screens/messenger/NewChatScreen';
import { ContactProfileScreen } from '~/screens/messenger/ContactProfileScreen';
import { AccountSettingsScreen } from '~/screens/messenger/AccountSettingsScreen';
import { ChannelsScreen } from '~/screens/messenger/ChannelsScreen';
import { CreateChannelScreen } from '~/screens/messenger/CreateChannelScreen';
import { ChannelViewScreen } from '~/screens/messenger/ChannelViewScreen';
import { CreatePostScreen } from '~/screens/messenger/CreatePostScreen';
import { StickersScreen } from '~/screens/messenger/StickersScreen';

export type MessengerStackParamList = {
  MessengerHome: undefined;
  MessengerChat: { conversationId: string };
  MessengerContacts: undefined;
  MessengerContactSearch: undefined;
  MessengerNewChat: undefined;
  MessengerContactProfile: { userId: string };
  MessengerAccountView: undefined;
  MessengerAccountSettings: undefined;
  MessengerSettings: undefined;
  MessengerChannels: undefined;
  MessengerCreateChannel: undefined;
  MessengerChannelView: { channelId: string };
  MessengerCreatePost: { channelId: string };
  MessengerStickers: { conversationId?: string };
};

export const messengerNavigationRef =
  createNavigationContainerRef<MessengerStackParamList>();

const Stack = createNativeStackNavigator<MessengerStackParamList>();

const messengerTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B00',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    border: '#E5E5EA',
    notification: '#FF453A',
  },
};

function MessengerRealtimeBootstrap() {
  useMessagingRealtime(true);
  return null;
}

export function MessengerNavigator() {
  const { isAuthenticated, isHydrated } = useAuth();

  if (!isHydrated) return null;
  if (!isAuthenticated) return <MessengerLoginPrompt />;

  return (
    <NavigationIndependentTree>
      <NavigationContainer ref={messengerNavigationRef} theme={messengerTheme}>
        <MessengerRealtimeBootstrap />
        <Stack.Navigator
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="MessengerHome" component={MessengerTabNavigator} />
          <Stack.Screen name="MessengerChat" component={ChatScreen} />
          <Stack.Screen name="MessengerContactSearch" component={ContactSearchScreen} />
          <Stack.Screen name="MessengerNewChat" component={NewChatScreen} />
          <Stack.Screen name="MessengerContactProfile" component={ContactProfileScreen} />
          <Stack.Screen name="MessengerAccountSettings" component={AccountSettingsScreen} />
          <Stack.Screen name="MessengerChannels" component={ChannelsScreen} />
          <Stack.Screen name="MessengerCreateChannel" component={CreateChannelScreen} />
          <Stack.Screen name="MessengerChannelView" component={ChannelViewScreen} />
          <Stack.Screen name="MessengerCreatePost" component={CreatePostScreen} />
          <Stack.Screen name="MessengerStickers" component={StickersScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
