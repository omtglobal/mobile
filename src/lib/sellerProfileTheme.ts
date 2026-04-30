import type { SellerProfile } from '~/types/models';

export type SellerProfileThemeKey = NonNullable<SellerProfile['profile_theme']>;

/** Accent used for section titles and icons (aligned with web profile themes). */
export function getSellerThemeAccent(
  theme: SellerProfile['profile_theme'],
  fallback: string,
): string {
  switch (theme ?? 'neutral') {
    case 'tech':
      return '#3b82f6';
    case 'soft':
      return '#db2777';
    case 'kids':
      return '#d97706';
    case 'neutral':
    default:
      return fallback;
  }
}

/** Gradient for premium header overlay (top transparent → bottom dark). */
export function getSellerPremiumHeaderGradient(
  theme: SellerProfile['profile_theme'],
): readonly [string, string] {
  switch (theme ?? 'neutral') {
    case 'tech':
      return ['rgba(15,23,42,0.05)', 'rgba(30,58,138,0.85)'] as const;
    case 'soft':
      return ['rgba(253,242,248,0.1)', 'rgba(131,24,67,0.88)'] as const;
    case 'kids':
      return ['rgba(255,251,235,0.15)', 'rgba(146,64,14,0.88)'] as const;
    case 'neutral':
    default:
      return ['rgba(0,0,0,0.05)', 'rgba(23,23,23,0.82)'] as const;
  }
}
