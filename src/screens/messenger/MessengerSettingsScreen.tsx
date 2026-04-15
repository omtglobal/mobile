import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Moon, Sun, Palette, Image as ImageIcon, Type } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { Text } from '~/components/ui';
import { usePreferencesStore } from '~/lib/stores/preferences';
import { WallpaperPreview } from '~/components/messenger/WallpaperPreview';
import { FONT_OPTIONS, resolveFontFamily } from '~/constants/fonts';
import {
  WALLPAPER_CATEGORY_LABELS,
  filterWallpapers,
  findWallpaper,
  type WallpaperCategory,
  type WallpaperConfig,
} from '~/constants/wallpapers';

const ACCENT_COLORS = [
  { id: 1, color: '#FF6B00', name: 'Orange' },
  { id: 2, color: '#3B82F6', name: 'Blue' },
  { id: 3, color: '#22C55E', name: 'Green' },
  { id: 4, color: '#A855F7', name: 'Purple' },
  { id: 5, color: '#EC4899', name: 'Pink' },
  { id: 6, color: '#EAB308', name: 'Yellow' },
  { id: 7, color: '#14B8A6', name: 'Teal' },
  { id: 8, color: '#EF4444', name: 'Red' },
] as const;

const WALLPAPER_CATEGORIES: WallpaperCategory[] = ['all', 'photos', 'gradients', 'colors', 'patterns'];

export function MessengerSettingsScreen() {
  const { t } = useTranslation();
  const { colors, spacing, radius, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const themePreference = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const accentColor = usePreferencesStore((s) => s.accentColor);
  const setAccentColor = usePreferencesStore((s) => s.setAccentColor);
  const wallpaperId = usePreferencesStore((s) => s.chatWallpaperId);
  const setWallpaperId = usePreferencesStore((s) => s.setChatWallpaperId);
  const fontId = usePreferencesStore((s) => s.fontId);
  const setFontId = usePreferencesStore((s) => s.setFontId);

  const [wallpaperCategory, setWallpaperCategory] = useState<WallpaperCategory>('all');

  const isDarkMode = themePreference === 'dark' || (themePreference === 'system' && isDark);

  const toggleDarkMode = useCallback(() => {
    setTheme(isDarkMode ? 'light' : 'dark');
  }, [isDarkMode, setTheme]);

  const selectAccent = useCallback(
    (color: string) => setAccentColor(color),
    [setAccentColor],
  );

  const selectWallpaper = useCallback(
    (wp: WallpaperConfig) => {
      setWallpaperId(wallpaperId === wp.id ? null : wp.id);
    },
    [wallpaperId, setWallpaperId],
  );

  const selectFont = useCallback(
    (id: string) => setFontId(id),
    [setFontId],
  );

  const selectedAccentEntry =
    ACCENT_COLORS.find((a) => a.color === accentColor) ?? ACCENT_COLORS[0];

  const displayedWallpapers = useMemo(
    () => filterWallpapers(wallpaperCategory),
    [wallpaperCategory],
  );

  const selectedWallpaper = useMemo(
    () => (wallpaperId ? findWallpaper(wallpaperId) : undefined),
    [wallpaperId],
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.bgPrimary }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
            borderBottomColor: colors.borderDefault,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text variant="headingLg" color="primary">
            {t('messenger.settings', 'Settings')}
          </Text>
          <Text variant="bodySm" color="secondary">
            {t('messenger.settings_subtitle', 'App customization')}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 100,
        }}
      >
        {/* ── Theme ────────────────────────────────────────────── */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={[styles.sectionHeader, { marginBottom: spacing.md }]}>
            {isDarkMode ? (
              <Moon size={18} color={colors.textSecondary} />
            ) : (
              <Sun size={18} color={colors.textSecondary} />
            )}
            <Text variant="headingSm" color="primary" style={{ marginLeft: spacing.sm }}>
              {t('messenger.theme', 'Theme')}
            </Text>
          </View>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.bgSecondary,
                borderRadius: radius.lg,
                borderColor: colors.borderDefault,
                padding: spacing.lg,
              },
            ]}
          >
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMd" color="primary" style={{ fontWeight: '500' }}>
                  {t('messenger.dark_mode', 'Dark Mode')}
                </Text>
                <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                  {t('messenger.dark_mode_hint', 'Reduces eye strain')}
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.bgTertiary, true: colors.brandPrimary + '80' }}
                thumbColor={isDarkMode ? colors.brandPrimary : colors.bgPrimary}
              />
            </View>
          </View>
        </View>

        {/* ── Accent Color ────────────────────────────────────── */}
        <View style={{ marginTop: spacing['2xl'] }}>
          <View style={[styles.sectionHeader, { marginBottom: spacing.md }]}>
            <Palette size={18} color={colors.textSecondary} />
            <Text variant="headingSm" color="primary" style={{ marginLeft: spacing.sm }}>
              {t('messenger.accent_color', 'Accent Color')}
            </Text>
          </View>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.bgSecondary,
                borderRadius: radius.lg,
                borderColor: colors.borderDefault,
                padding: spacing.lg,
              },
            ]}
          >
            <Text variant="caption" color="secondary" style={{ marginBottom: spacing.md }}>
              {t('messenger.accent_hint', 'Button and active element colors')}
            </Text>
            <View style={styles.colorGrid}>
              {ACCENT_COLORS.map((item) => {
                const selected = item.color === accentColor;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => selectAccent(item.color)}
                    style={styles.colorCell}
                  >
                    <View
                      style={[
                        styles.colorCircle,
                        {
                          backgroundColor: item.color,
                          borderRadius: radius.md,
                          borderWidth: selected ? 2 : 0,
                          borderColor: colors.textPrimary,
                        },
                      ]}
                    >
                      {selected && <Check size={18} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Text
              variant="caption"
              color="tertiary"
              style={{ textAlign: 'center', marginTop: spacing.sm }}
            >
              {selectedAccentEntry.name}
            </Text>
          </View>
        </View>

        {/* ── Font ─────────────────────────────────────────────── */}
        <View style={{ marginTop: spacing['2xl'] }}>
          <View style={[styles.sectionHeader, { marginBottom: spacing.md }]}>
            <Type size={18} color={colors.textSecondary} />
            <Text variant="headingSm" color="primary" style={{ marginLeft: spacing.sm }}>
              {t('messenger.font', 'Font')}
            </Text>
          </View>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.bgSecondary,
                borderRadius: radius.lg,
                borderColor: colors.borderDefault,
                padding: spacing.lg,
              },
            ]}
          >
            {FONT_OPTIONS.map((font) => {
              const selected = font.id === fontId;
              const sampleFont = resolveFontFamily(font.id, '400');
              const sampleBold = resolveFontFamily(font.id, '700');
              return (
                <Pressable
                  key={font.id}
                  onPress={() => selectFont(font.id)}
                  style={[
                    styles.fontRow,
                    {
                      backgroundColor: selected
                        ? colors.brandPrimary + '10'
                        : colors.bgPrimary,
                      borderRadius: radius.md,
                      borderColor: selected ? colors.brandPrimary : colors.borderDefault,
                      padding: spacing.md,
                      marginBottom: spacing.sm,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.fontNameRow}>
                      <RNText
                        style={{
                          fontSize: 14,
                          fontWeight: sampleBold ? undefined : '600',
                          fontFamily: sampleBold,
                          color: colors.textPrimary,
                        }}
                      >
                        {font.name}
                      </RNText>
                      <RNText
                        style={{
                          fontSize: 11,
                          color: colors.textTertiary,
                          marginLeft: 8,
                        }}
                      >
                        {font.description}
                      </RNText>
                    </View>
                    <RNText
                      style={{
                        fontSize: 18,
                        fontFamily: sampleFont,
                        color: colors.textSecondary,
                        marginTop: 4,
                      }}
                    >
                      Aa Bb Cc 123
                    </RNText>
                  </View>
                  {selected && (
                    <View
                      style={[
                        styles.fontCheck,
                        { backgroundColor: colors.brandPrimary, borderRadius: radius.full },
                      ]}
                    >
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Wallpaper ────────────────────────────────────────── */}
        <View style={{ marginTop: spacing['2xl'] }}>
          <View style={[styles.sectionHeader, { marginBottom: spacing.md }]}>
            <ImageIcon size={18} color={colors.textSecondary} />
            <Text variant="headingSm" color="primary" style={{ marginLeft: spacing.sm }}>
              {t('messenger.wallpaper', 'Chat Wallpaper')}
            </Text>
          </View>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.bgSecondary,
                borderRadius: radius.lg,
                borderColor: colors.borderDefault,
                padding: spacing.lg,
              },
            ]}
          >
            {/* Category chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm, marginBottom: spacing.md }}
            >
              {WALLPAPER_CATEGORIES.map((cat) => {
                const active = wallpaperCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setWallpaperCategory(cat)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.brandPrimary : colors.bgTertiary,
                        borderRadius: radius.full,
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.xs + 2,
                      },
                    ]}
                  >
                    <Text
                      variant="caption"
                      style={{
                        color: active ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: '500',
                      }}
                    >
                      {WALLPAPER_CATEGORY_LABELS[cat]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Wallpapers grid */}
            <View style={styles.wallpaperGrid}>
              {displayedWallpapers.map((wp) => {
                const selected = wallpaperId === wp.id;
                return (
                  <Pressable
                    key={wp.id}
                    onPress={() => selectWallpaper(wp)}
                    style={styles.wallpaperCell}
                  >
                    <WallpaperPreview
                      wallpaper={wp}
                      borderRadius={radius.lg}
                      style={{
                        borderWidth: selected ? 2 : 1,
                        borderColor: selected ? colors.brandPrimary : colors.borderDefault,
                      }}
                    >
                      {selected && (
                        <View style={styles.wallpaperCheckWrap}>
                          <View
                            style={[
                              styles.wallpaperCheck,
                              { backgroundColor: colors.brandPrimary, borderRadius: radius.full },
                            ]}
                          >
                            <Check size={14} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        </View>
                      )}
                      <View style={styles.wallpaperLabel}>
                        <View style={styles.wallpaperLabelBg} />
                        <Text
                          variant="caption"
                          style={styles.wallpaperLabelText}
                          numberOfLines={1}
                        >
                          {wp.name}
                        </Text>
                      </View>
                    </WallpaperPreview>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Preview ──────────────────────────────────────────── */}
        <View style={{ marginTop: spacing['2xl'] }}>
          <Text variant="headingSm" color="primary" style={{ marginBottom: spacing.md }}>
            {t('messenger.preview', 'Preview')}
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.bgSecondary,
                borderRadius: radius.lg,
                borderColor: colors.borderDefault,
                padding: spacing.lg,
              },
            ]}
          >
            {selectedWallpaper ? (
              <WallpaperPreview
                wallpaper={selectedWallpaper}
                size={{ width: '100%', height: 180 }}
                borderRadius={radius.lg}
              >
                <View style={styles.chatPreview}>
                  <View
                    style={[
                      styles.previewBubbleOther,
                      { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: radius.lg },
                    ]}
                  >
                    <Text variant="bodySm" style={{ color: '#1A1A1A' }}>
                      Hello! How are you?
                    </Text>
                    <Text variant="caption" style={{ color: '#999', marginTop: 2 }}>
                      14:23
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.previewBubbleOwn,
                      { backgroundColor: colors.brandPrimary, borderRadius: radius.lg },
                    ]}
                  >
                    <Text variant="bodySm" style={{ color: '#FFFFFF' }}>
                      Great, thanks!
                    </Text>
                    <Text
                      variant="caption"
                      style={{ color: 'rgba(255,255,255,0.7)', marginTop: 2 }}
                    >
                      14:25
                    </Text>
                  </View>
                </View>
              </WallpaperPreview>
            ) : (
              <View
                style={[
                  styles.chatPreview,
                  { backgroundColor: colors.bgPrimary, borderRadius: radius.lg, height: 180 },
                ]}
              >
                <View
                  style={[
                    styles.previewBubbleOther,
                    { backgroundColor: colors.bgSecondary, borderRadius: radius.lg },
                  ]}
                >
                  <Text variant="bodySm" color="primary">
                    Hello! How are you?
                  </Text>
                  <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
                    14:23
                  </Text>
                </View>
                <View
                  style={[
                    styles.previewBubbleOwn,
                    { backgroundColor: colors.brandPrimary, borderRadius: radius.lg },
                  ]}
                >
                  <Text variant="bodySm" style={{ color: '#FFFFFF' }}>
                    Great, thanks!
                  </Text>
                  <Text
                    variant="caption"
                    style={{ color: 'rgba(255,255,255,0.7)', marginTop: 2 }}
                  >
                    14:25
                  </Text>
                </View>
              </View>
            )}

            <Pressable
              style={[
                styles.previewButton,
                {
                  backgroundColor: colors.brandPrimary,
                  borderRadius: radius.lg,
                  marginTop: spacing.md,
                  paddingVertical: spacing.md,
                },
              ]}
            >
              <Text variant="bodyMd" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                {t('messenger.example_button', 'Example button')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorCell: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  colorCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  fontNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  fontCheck: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {},
  wallpaperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wallpaperCell: {
    width: '33.33%',
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  wallpaperCheckWrap: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
  },
  wallpaperCheck: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wallpaperLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  wallpaperLabelBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  wallpaperLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  chatPreview: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    gap: 8,
  },
  previewBubbleOther: {
    padding: 12,
    alignSelf: 'flex-start',
    maxWidth: '70%',
  },
  previewBubbleOwn: {
    padding: 12,
    alignSelf: 'flex-end',
    maxWidth: '70%',
  },
  previewButton: {
    alignItems: 'center',
  },
});
