import { Share } from 'react-native';

export type CopyToClipboardResult = 'ok' | 'share_fallback' | 'failed';

/**
 * Copy text to the clipboard when a native clipboard module is linked (expo-clipboard
 * or @react-native-clipboard/clipboard). If none are available (e.g. dev client not
 * rebuilt), opens the system share sheet with the text so the user can pick "Copy".
 */
export async function copyTextToClipboard(text: string): Promise<CopyToClipboardResult> {
  try {
    // Avoid top-level import: expo-clipboard loads native module on first require.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const expoClipboard = require('expo-clipboard') as typeof import('expo-clipboard');
    await expoClipboard.setStringAsync(text);
    return 'ok';
  } catch {
    /* native ExpoClipboard missing or setStringAsync failed */
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RNClipboard = require('@react-native-clipboard/clipboard').default;
    RNClipboard.setString(text);
    return 'ok';
  } catch {
    /* optional dependency not installed */
  }

  try {
    await Share.share({ message: text });
    return 'share_fallback';
  } catch {
    return 'failed';
  }
}
