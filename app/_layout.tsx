import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '~/lib/contexts/ThemeContext';
import { ToastProvider } from '~/components/ui/Toast';
import { SessionCheck } from '~/components/layout/SessionCheck';
import { I18nSync } from '~/components/layout/I18nSync';
import '~/i18n';
import { setQueryClient } from '~/lib/api/queryClientRef';
import { analytics } from '~/lib/analytics/analyticsService';
import { queryKeys } from '~/constants/queryKeys';
import { catalogApi } from '~/lib/api/catalog';
import { CUSTOM_FONTS } from '~/constants/fonts';
import { STRIPE_PUBLISHABLE_KEY } from '~/constants/config';
import { StripeProvider } from '@stripe/stripe-react-native';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    setQueryClient(queryClient);
  }, []);

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...CUSTOM_FONTS,
  });
  useEffect(() => {
    if (error) throw error;
  }, [error]);
  useEffect(() => {
    if (loaded) {
      queryClient.prefetchQuery({ queryKey: queryKeys.home, queryFn: () => catalogApi.getHome() }).catch(() => {});
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  if (!loaded) return null;

  const appTree = (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nSync />
          <ToastProvider>
            <SessionCheck />
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(main)" />
              <Stack.Screen
                name="(auth)"
                options={{ presentation: 'modal' }}
              />
            </Stack>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {STRIPE_PUBLISHABLE_KEY ? (
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} urlScheme="ninhao">
          {appTree}
        </StripeProvider>
      ) : (
        appTree
      )}
    </GestureHandlerRootView>
  );
}
