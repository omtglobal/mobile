// Jest setup for React Native / Expo
// Must run first (setupFiles) - before any module loads
process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:8000';

// Prevent Expo winter runtime "import outside of scope" in Jest
if (typeof global !== 'undefined') {
  Object.defineProperty(global, '__ExpoImportMetaRegistry', {
    value: { url: 'file:///test' },
    writable: true,
    configurable: true,
  });
  if (typeof global.structuredClone === 'undefined') {
    global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
  }
}

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: { View },
    FadeIn: View,
    FadeOut: View,
    FadeInDown: View,
    useSharedValue: () => ({ value: 0 }),
    useAnimatedStyle: () => ({}),
    withRepeat: (v) => v,
    withTiming: (v) => v,
    withSpring: (v) => v,
    interpolate: (v) => v,
    Easing: { bezier: () => () => 0 },
  };
});

jest.mock('react-native-worklets', () => ({
  createWorklet: (fn) => fn,
  useWorklet: (fn) => fn,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useSegments: () => [],
  useLocalSearchParams: () => ({}),
  Link: 'Link',
  Stack: { Screen: 'StackScreen' },
  Tabs: { Screen: 'TabsScreen' },
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: () => Promise.resolve({ isConnected: true, isInternetReachable: true }),
  addEventListener: () => () => {},
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: () => {} },
  }),
}));

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: () => null,
    set: () => {},
    remove: () => {},
    delete: () => {},
  }),
}));
