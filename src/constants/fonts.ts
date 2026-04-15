export interface FontDef {
  id: string;
  name: string;
  description: string;
  regular: string;
  bold: string;
}

export const CUSTOM_FONTS = {
  // Inter
  Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
  Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
  Inter_700Bold: require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
  // Space Grotesk
  SpaceGrotesk_400Regular: require('@expo-google-fonts/space-grotesk/400Regular/SpaceGrotesk_400Regular.ttf'),
  SpaceGrotesk_600SemiBold: require('@expo-google-fonts/space-grotesk/600SemiBold/SpaceGrotesk_600SemiBold.ttf'),
  SpaceGrotesk_700Bold: require('@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf'),
  // Nunito
  Nunito_400Regular: require('@expo-google-fonts/nunito/400Regular/Nunito_400Regular.ttf'),
  Nunito_600SemiBold: require('@expo-google-fonts/nunito/600SemiBold/Nunito_600SemiBold.ttf'),
  Nunito_700Bold: require('@expo-google-fonts/nunito/700Bold/Nunito_700Bold.ttf'),
  // Playfair Display
  PlayfairDisplay_400Regular: require('@expo-google-fonts/playfair-display/400Regular/PlayfairDisplay_400Regular.ttf'),
  PlayfairDisplay_600SemiBold: require('@expo-google-fonts/playfair-display/600SemiBold/PlayfairDisplay_600SemiBold.ttf'),
  PlayfairDisplay_700Bold: require('@expo-google-fonts/playfair-display/700Bold/PlayfairDisplay_700Bold.ttf'),
  // JetBrains Mono
  JetBrainsMono_400Regular: require('@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf'),
  JetBrainsMono_600SemiBold: require('@expo-google-fonts/jetbrains-mono/600SemiBold/JetBrainsMono_600SemiBold.ttf'),
  JetBrainsMono_700Bold: require('@expo-google-fonts/jetbrains-mono/700Bold/JetBrainsMono_700Bold.ttf'),
  // Caveat
  Caveat_400Regular: require('@expo-google-fonts/caveat/400Regular/Caveat_400Regular.ttf'),
  Caveat_600SemiBold: require('@expo-google-fonts/caveat/600SemiBold/Caveat_600SemiBold.ttf'),
  Caveat_700Bold: require('@expo-google-fonts/caveat/700Bold/Caveat_700Bold.ttf'),
  // Comfortaa
  Comfortaa_400Regular: require('@expo-google-fonts/comfortaa/400Regular/Comfortaa_400Regular.ttf'),
  Comfortaa_600SemiBold: require('@expo-google-fonts/comfortaa/600SemiBold/Comfortaa_600SemiBold.ttf'),
  Comfortaa_700Bold: require('@expo-google-fonts/comfortaa/700Bold/Comfortaa_700Bold.ttf'),
} as const;

export const FONT_OPTIONS: FontDef[] = [
  { id: 'system', name: 'System Default', description: 'Platform native', regular: '', bold: '' },
  { id: 'inter', name: 'Inter', description: 'Clean, modern', regular: 'Inter_400Regular', bold: 'Inter_700Bold' },
  { id: 'space-grotesk', name: 'Space Grotesk', description: 'Geometric, techy', regular: 'SpaceGrotesk_400Regular', bold: 'SpaceGrotesk_700Bold' },
  { id: 'nunito', name: 'Nunito', description: 'Soft, rounded', regular: 'Nunito_400Regular', bold: 'Nunito_700Bold' },
  { id: 'playfair', name: 'Playfair Display', description: 'Elegant serif', regular: 'PlayfairDisplay_400Regular', bold: 'PlayfairDisplay_700Bold' },
  { id: 'jetbrains', name: 'JetBrains Mono', description: 'Developer mono', regular: 'JetBrainsMono_400Regular', bold: 'JetBrainsMono_700Bold' },
  { id: 'caveat', name: 'Caveat', description: 'Handwritten', regular: 'Caveat_400Regular', bold: 'Caveat_700Bold' },
  { id: 'comfortaa', name: 'Comfortaa', description: 'Rounded geometric', regular: 'Comfortaa_400Regular', bold: 'Comfortaa_700Bold' },
];

const WEIGHT_MAP: Record<string, Record<string, string>> = {
  inter: { '400': 'Inter_400Regular', '500': 'Inter_600SemiBold', '600': 'Inter_600SemiBold', '700': 'Inter_700Bold' },
  'space-grotesk': { '400': 'SpaceGrotesk_400Regular', '500': 'SpaceGrotesk_600SemiBold', '600': 'SpaceGrotesk_600SemiBold', '700': 'SpaceGrotesk_700Bold' },
  nunito: { '400': 'Nunito_400Regular', '500': 'Nunito_600SemiBold', '600': 'Nunito_600SemiBold', '700': 'Nunito_700Bold' },
  playfair: { '400': 'PlayfairDisplay_400Regular', '500': 'PlayfairDisplay_600SemiBold', '600': 'PlayfairDisplay_600SemiBold', '700': 'PlayfairDisplay_700Bold' },
  jetbrains: { '400': 'JetBrainsMono_400Regular', '500': 'JetBrainsMono_600SemiBold', '600': 'JetBrainsMono_600SemiBold', '700': 'JetBrainsMono_700Bold' },
  caveat: { '400': 'Caveat_400Regular', '500': 'Caveat_600SemiBold', '600': 'Caveat_600SemiBold', '700': 'Caveat_700Bold' },
  comfortaa: { '400': 'Comfortaa_400Regular', '500': 'Comfortaa_600SemiBold', '600': 'Comfortaa_600SemiBold', '700': 'Comfortaa_700Bold' },
};

/**
 * Resolves a font ID + weight to the actual loaded font family name.
 * Returns undefined for 'system' (use platform default).
 */
export function resolveFontFamily(
  fontId: string,
  weight: string | undefined,
): string | undefined {
  if (fontId === 'system' || !fontId) return undefined;
  const map = WEIGHT_MAP[fontId];
  if (!map) return undefined;
  const w = weight ?? '400';
  const numWeight = typeof w === 'string' ? w.replace(/[^0-9]/g, '') : '400';
  return map[numWeight] ?? map['400'];
}

export function findFontDef(fontId: string): FontDef | undefined {
  return FONT_OPTIONS.find((f) => f.id === fontId);
}
