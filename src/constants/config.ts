import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';

export const API_PREFIX = '/api/v1/client';

const API_DEV_PORT = 8000;
const WS_DEV_PORT = 8083;

/** Hostname of the dev machine (from Metro), or null → use emulator/simulator defaults. */
function devMachineHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri && typeof hostUri === 'string') {
    try {
      const withProto = hostUri.includes('://') ? hostUri : `http://${hostUri}`;
      const { hostname } = new URL(withProto);
      if (
        hostname &&
        hostname !== 'localhost' &&
        hostname !== '127.0.0.1' &&
        hostname !== '::1'
      ) {
        return hostname;
      }
    } catch {
      /* ignore */
    }
  }

  const scriptURL = (NativeModules as { SourceCode?: { scriptURL?: string } }).SourceCode
    ?.scriptURL;
  if (typeof scriptURL === 'string' && scriptURL.startsWith('http')) {
    try {
      const { hostname } = new URL(scriptURL);
      if (
        hostname &&
        hostname !== 'localhost' &&
        hostname !== '127.0.0.1' &&
        hostname !== '::1'
      ) {
        return hostname;
      }
    } catch {
      /* ignore */
    }
  }

  return null;
}

function getBaseUrl(): string {
  const fromEnv =
    typeof process.env.EXPO_PUBLIC_API_BASE_URL === 'string'
      ? process.env.EXPO_PUBLIC_API_BASE_URL.trim()
      : '';
  if (fromEnv) return fromEnv;

  if (!__DEV__) {
    return 'https://api.ninhao.shop';
  }

  const host = devMachineHost();
  if (host) {
    return `http://${host}:${API_DEV_PORT}`;
  }
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_DEV_PORT}`;
  }
  return `http://localhost:${API_DEV_PORT}`;
}

export const API_BASE_URL = getBaseUrl();

export const API_FULL_URL = `${API_BASE_URL}${API_PREFIX}`;

/** WebSocket base (realtime-service). No path — client appends `/ws?token=`. */
function getWsBaseUrl(): string {
  const fromEnv =
    typeof process.env.EXPO_PUBLIC_WS_BASE_URL === 'string'
      ? process.env.EXPO_PUBLIC_WS_BASE_URL.trim()
      : '';
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (!__DEV__) {
    return 'wss://api.ninhao.shop';
  }

  const host = devMachineHost();
  if (host) {
    return `ws://${host}:${WS_DEV_PORT}`;
  }
  if (Platform.OS === 'android') {
    return `ws://10.0.2.2:${WS_DEV_PORT}`;
  }
  return `ws://localhost:${WS_DEV_PORT}`;
}

export const WS_BASE_URL = getWsBaseUrl();

/**
 * Public web storefront base URL (product pages, universal links).
 * Override with EXPO_PUBLIC_WEB_STORE_URL (no trailing slash).
 */
function getWebStoreBaseUrl(): string {
  const fromEnv =
    typeof process.env.EXPO_PUBLIC_WEB_STORE_URL === 'string'
      ? process.env.EXPO_PUBLIC_WEB_STORE_URL.trim().replace(/\/$/, '')
      : '';
  if (fromEnv) return fromEnv;
  return 'https://ninhao.shop';
}

export const WEB_STORE_BASE_URL = getWebStoreBaseUrl();

/**
 * Stripe publishable key for Payment Sheet (native). When empty, order pay uses hosted Checkout in WebBrowser.
 * Set `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env` / EAS secrets.
 */
export const STRIPE_PUBLISHABLE_KEY =
  typeof process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY === 'string'
    ? process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY.trim()
    : '';

/** Canonical HTTPS URL for a product on the web app (e.g. Next.js storefront). */
export function productWebUrl(productId: string): string {
  return `${WEB_STORE_BASE_URL}/product/${encodeURIComponent(productId)}`;
}
