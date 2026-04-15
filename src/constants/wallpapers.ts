export type WallpaperType = 'color' | 'gradient' | 'pattern' | 'image';

export interface WallpaperConfig {
  type: WallpaperType;
  id: string;
  name: string;
  value: string;
  colors?: string[];
  locations?: number[];
}

export type WallpaperCategory = 'all' | 'photos' | 'gradients' | 'colors' | 'patterns';

export const DEFAULT_WALLPAPER_ID = 'ph-abstract';

export const WALLPAPER_CATEGORY_LABELS: Record<WallpaperCategory, string> = {
  all: 'All',
  photos: 'Photos',
  gradients: 'Gradients',
  colors: 'Colors',
  patterns: 'Patterns',
};

export const WALLPAPERS: WallpaperConfig[] = [
  // ── Photos ──────────────────────────────────────────────────────────
  { id: 'ph-abstract', name: 'Abstract', type: 'image', value: 'https://images.unsplash.com/photo-1689005046927-0aa9f398247a?w=800&q=80' },
  { id: 'ph-dark-tex', name: 'Dark Texture', type: 'image', value: 'https://images.unsplash.com/photo-1770795263316-f302a878ee64?w=800&q=80' },
  { id: 'ph-mountains', name: 'Mountains', type: 'image', value: 'https://images.unsplash.com/photo-1697518988341-f4e54efbd41d?w=800&q=80' },
  { id: 'ph-ocean', name: 'Ocean Waves', type: 'image', value: 'https://images.unsplash.com/photo-1558888434-e1f808621906?w=800&q=80' },
  { id: 'ph-stars', name: 'Starry Sky', type: 'image', value: 'https://images.unsplash.com/photo-1762871950962-d6c3b6fd99e7?w=800&q=80' },
  { id: 'ph-sunset', name: 'Sunset Clouds', type: 'image', value: 'https://images.unsplash.com/photo-1646404777090-3d0a34fc25f3?w=800&q=80' },
  { id: 'ph-sakura', name: 'Sakura', type: 'image', value: 'https://images.unsplash.com/photo-1682985894263-755de6f43f8b?w=800&q=80' },
  { id: 'ph-northern', name: 'Northern Lights', type: 'image', value: 'https://images.unsplash.com/photo-1549633760-9a0931220b84?w=800&q=80' },
  { id: 'ph-tropics', name: 'Tropics', type: 'image', value: 'https://images.unsplash.com/photo-1683298448135-4f2419cf9575?w=800&q=80' },
  { id: 'ph-marble', name: 'Marble', type: 'image', value: 'https://images.unsplash.com/photo-1623197532650-bacb8a68914e?w=800&q=80' },
  { id: 'ph-city', name: 'Night City', type: 'image', value: 'https://images.unsplash.com/photo-1757843298369-6e5503c14bfd?w=800&q=80' },
  { id: 'ph-desert', name: 'Desert', type: 'image', value: 'https://images.unsplash.com/photo-1690942566357-90489170ebd2?w=800&q=80' },
  { id: 'ph-underwater', name: 'Underwater', type: 'image', value: 'https://images.unsplash.com/photo-1637310935987-d7da0d903676?w=800&q=80' },
  { id: 'ph-autumn', name: 'Autumn Forest', type: 'image', value: 'https://images.unsplash.com/photo-1693754472551-fafe38babc56?w=800&q=80' },
  { id: 'ph-snow', name: 'Snow Mountains', type: 'image', value: 'https://images.unsplash.com/photo-1677777475572-8c251e2101ae?w=800&q=80' },
  { id: 'ph-lavender', name: 'Lavender Field', type: 'image', value: 'https://images.unsplash.com/photo-1644409496856-a92543edbc64?w=800&q=80' },
  { id: 'ph-rain', name: 'Raindrops', type: 'image', value: 'https://images.unsplash.com/photo-1554745007-e20b5c308479?w=800&q=80' },
  { id: 'ph-neon', name: 'Neon', type: 'image', value: 'https://images.unsplash.com/photo-1618902345120-77758161d808?w=800&q=80' },
  { id: 'ph-bamboo', name: 'Bamboo Forest', type: 'image', value: 'https://images.unsplash.com/photo-1765988655874-476689e038e5?w=800&q=80' },
  { id: 'ph-galaxy', name: 'Galaxy', type: 'image', value: 'https://images.unsplash.com/flagged/photo-1564783750566-e2d08c2bf293?w=800&q=80' },
  { id: 'ph-panda1', name: 'Panda', type: 'image', value: 'https://images.unsplash.com/photo-1761517099247-71400d18ccd8?w=800&q=80' },
  { id: 'ph-panda2', name: 'Panda & Bamboo', type: 'image', value: 'https://images.unsplash.com/photo-1703248187251-c897f32fe4ec?w=800&q=80' },
  { id: 'ph-panda3', name: 'Panda Portrait', type: 'image', value: 'https://images.unsplash.com/photo-1767154511654-a26154af13ab?w=800&q=80' },
  { id: 'ph-panda4', name: 'Panda Bamboo', type: 'image', value: 'https://images.unsplash.com/photo-1766927101034-c80abd294d5f?w=800&q=80' },

  // ── Gradients (all 135°, start [0,0] → end [1,1]) ──────────────────
  { id: 'g-sky', name: 'Sky', type: 'gradient', value: '', colors: ['#e0f2fe', '#dbeafe'] },
  { id: 'g-rose', name: 'Rose', type: 'gradient', value: '', colors: ['#fce7f3', '#fef3c7'] },
  { id: 'g-spring', name: 'Spring', type: 'gradient', value: '', colors: ['#d1fae5', '#dbeafe'] },
  {
    id: 'g-sunset',
    name: 'Sunset',
    type: 'gradient',
    value: '',
    colors: ['#fecaca', '#fde68a', '#fed7aa'],
    locations: [0, 0.5, 1],
  },
  { id: 'g-lavender', name: 'Lavender', type: 'gradient', value: '', colors: ['#e9d5ff', '#fbcfe8'] },
  { id: 'g-ocean', name: 'Ocean', type: 'gradient', value: '', colors: ['#a5f3fc', '#818cf8'] },
  {
    id: 'g-night',
    name: 'Night',
    type: 'gradient',
    value: '',
    colors: ['#1e1b4b', '#312e81', '#1e3a5f'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'g-aurora',
    name: 'Aurora',
    type: 'gradient',
    value: '',
    colors: ['#064e3b', '#155e75', '#581c87'],
    locations: [0, 0.5, 1],
  },
  { id: 'g-peach', name: 'Peach', type: 'gradient', value: '', colors: ['#fff7ed', '#ffe4e6'] },
  {
    id: 'g-cosmos',
    name: 'Cosmos',
    type: 'gradient',
    value: '',
    colors: ['#0f172a', '#1e1b4b', '#4c1d95'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'g-golden',
    name: 'Golden Hour',
    type: 'gradient',
    value: '',
    colors: ['#fbbf24', '#f97316', '#ef4444'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'g-fresh',
    name: 'Fresh Mint',
    type: 'gradient',
    value: '',
    colors: ['#a7f3d0', '#6ee7b7', '#34d399'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'g-twilight',
    name: 'Twilight',
    type: 'gradient',
    value: '',
    colors: ['#1e293b', '#334155', '#475569'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'g-sakura',
    name: 'Sakura',
    type: 'gradient',
    value: '',
    colors: ['#fce7f3', '#f9a8d4', '#f472b6'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'g-emerald',
    name: 'Emerald',
    type: 'gradient',
    value: '',
    colors: ['#064e3b', '#047857', '#10b981'],
    locations: [0, 0.5, 1],
  },
  {
    id: 'g-ice',
    name: 'Ice',
    type: 'gradient',
    value: '',
    colors: ['#ecfeff', '#a5f3fc', '#67e8f9'],
    locations: [0, 0.5, 1],
  },

  // ── Colors ──────────────────────────────────────────────────────────
  { id: 'c-none', name: 'None', type: 'color', value: '#ffffff' },
  { id: 'c-light', name: 'Light', type: 'color', value: '#f9fafb' },
  { id: 'c-cream', name: 'Cream', type: 'color', value: '#fefce8' },
  { id: 'c-mint', name: 'Mint', type: 'color', value: '#ecfdf5' },

  // ── Patterns ────────────────────────────────────────────────────────
  { id: 'p-dots', name: 'Dots', type: 'pattern', value: 'dots' },
  { id: 'p-lines', name: 'Lines', type: 'pattern', value: 'lines' },
  { id: 'p-grid', name: 'Grid', type: 'pattern', value: 'grid' },
  { id: 'p-diagonal', name: 'Diagonal', type: 'pattern', value: 'diagonal' },
  { id: 'p-diamonds', name: 'Diamonds', type: 'pattern', value: 'diamonds' },
];

export function filterWallpapers(category: WallpaperCategory): WallpaperConfig[] {
  if (category === 'all') return WALLPAPERS;
  const typeMap: Record<string, WallpaperType> = {
    colors: 'color',
    gradients: 'gradient',
    patterns: 'pattern',
    photos: 'image',
  };
  return WALLPAPERS.filter((w) => w.type === typeMap[category]);
}

export function findWallpaper(id: string | undefined): WallpaperConfig | undefined {
  if (!id) return undefined;
  return WALLPAPERS.find((w) => w.id === id);
}
