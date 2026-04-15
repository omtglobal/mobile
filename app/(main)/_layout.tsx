import { useCallback, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { MainPagerProvider } from '~/lib/contexts/MainPagerContext';
import VideoFeedScreen from './video/index';
import { MessengerNavigator, messengerNavigationRef } from '~/navigation/MessengerNavigator';

const PAGE_SALES = 0;
const PAGE_VIDEO = 1;
const PAGE_MESSENGER = 2;

const TAB_KEYS = [
  { key: PAGE_SALES, labelKey: 'main.sales' as const },
  { key: PAGE_VIDEO, labelKey: 'main.video' as const },
  { key: PAGE_MESSENGER, labelKey: 'main.messenger' as const },
] as const;

export default function MainLayout() {
  const { t } = useTranslation();
  const [page, setPage] = useState(PAGE_VIDEO);
  const pagerRef = useRef<PagerView>(null);
  const { colors } = useTheme();
  const router = useRouter();

  const goToSalesAndProduct = useCallback(
    (productId: string) => {
      pagerRef.current?.setPage(PAGE_SALES);
      requestAnimationFrame(() => {
        router.push(`/product/${productId}`);
      });
    },
    [router]
  );

  const goToMessengerAndChat = useCallback((conversationId: string) => {
    pagerRef.current?.setPage(PAGE_MESSENGER);
    const tryNav = (attempt: number) => {
      if (messengerNavigationRef.isReady()) {
        messengerNavigationRef.navigate('MessengerChat', { conversationId });
      } else if (attempt < 20) {
        setTimeout(() => tryNav(attempt + 1), 50);
      }
    };
    requestAnimationFrame(() => tryNav(0));
  }, []);

  const selectPage = useCallback((index: number) => {
    setPage(index);
    pagerRef.current?.setPage(index);
  }, []);

  const isVideoTab = page === PAGE_VIDEO;

  const pathname = usePathname();
  const salesTabAtRoot = page !== PAGE_SALES || pathname === '/' || pathname === '/(tabs)' || pathname === '/(main)/(tabs)' || pathname === '/(main)';
  const messengerAtRoot = page !== PAGE_MESSENGER || !(messengerNavigationRef.isReady() && messengerNavigationRef.canGoBack());
  const showTabBar = (page === PAGE_VIDEO) || (page === PAGE_SALES && salesTabAtRoot) || (page === PAGE_MESSENGER && messengerAtRoot);

  return (
    <MainPagerProvider value={{ goToSalesAndProduct, goToMessengerAndChat }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
        <View style={{ flex: 1, position: 'relative' }}>
          {showTabBar ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 20,
              paddingVertical: 6,
              paddingHorizontal: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 18,
              backgroundColor: 'transparent',
            }}
          >
            {TAB_KEYS.map(({ key, labelKey }) => {
              const isActive = key === page;
              return (
                <Pressable
                  key={key}
                  onPress={() => selectPage(key)}
                  style={{
                    paddingVertical: 4,
                    paddingHorizontal: 2,
                    borderBottomWidth: isActive ? 2 : 0,
                    borderBottomColor: isVideoTab ? '#fff' : colors.brandPrimary,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: isActive ? '700' : '400',
                      color: isVideoTab
                        ? (isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)')
                        : (isActive ? colors.textPrimary : colors.textTertiary),
                    }}
                  >
                    {t(labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          ) : null}

          <PagerView
            ref={pagerRef}
            style={{ flex: 1 }}
            initialPage={PAGE_VIDEO}
            scrollEnabled
            onPageSelected={(e) => setPage(e.nativeEvent.position)}
          >
            <View key="sales" style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="product/[id]" />
                <Stack.Screen name="products" />
                <Stack.Screen name="category/[id]" />
                <Stack.Screen name="seller/[id]" />
                <Stack.Screen name="search" />
                <Stack.Screen name="reviews" />
                <Stack.Screen name="checkout" />
                <Stack.Screen name="order/[id]" />
                <Stack.Screen name="support" />
                <Stack.Screen name="addresses" />
                <Stack.Screen name="settings" />
              </Stack>
            </View>
            <View key="video" style={{ flex: 1, backgroundColor: '#000' }}>
              <VideoFeedScreen isTabActive={page === PAGE_VIDEO} />
            </View>
            <View key="messenger" style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
              <MessengerNavigator />
            </View>
          </PagerView>
        </View>
      </SafeAreaView>
    </MainPagerProvider>
  );
}
