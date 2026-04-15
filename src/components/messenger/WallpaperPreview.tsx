import React, { useMemo } from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import type { WallpaperConfig } from '~/constants/wallpapers';

interface Props {
  wallpaper: WallpaperConfig;
  size?: { width: number | string; height: number | string };
  borderRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

function MiniPattern({ patternId, bg, w, h }: { patternId: string; bg: string; w: number; h: number }) {
  const S = 10;
  const stroke = '#d1d5db';

  if (patternId === 'dots') {
    const cols = Math.ceil(w / S);
    const rows = Math.ceil(h / S);
    return (
      <Svg width={w} height={h}>
        <Rect width={w} height={h} fill={bg} />
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => (
            <Circle key={`${r}-${c}`} cx={c * S + S / 2} cy={r * S + S / 2} r={1} fill={stroke} />
          )),
        )}
      </Svg>
    );
  }

  if (patternId === 'lines') {
    const cols = Math.ceil(w / S);
    return (
      <Svg width={w} height={h}>
        <Rect width={w} height={h} fill={bg} />
        {Array.from({ length: cols }).map((_, i) => (
          <Line key={i} x1={i * S} y1={0} x2={i * S} y2={h} stroke={stroke} strokeWidth={0.5} />
        ))}
      </Svg>
    );
  }

  if (patternId === 'grid') {
    const cols = Math.ceil(w / S);
    const rows = Math.ceil(h / S);
    return (
      <Svg width={w} height={h}>
        <Rect width={w} height={h} fill={bg} />
        {Array.from({ length: cols }).map((_, i) => (
          <Line key={`v${i}`} x1={i * S} y1={0} x2={i * S} y2={h} stroke={stroke} strokeWidth={0.5} />
        ))}
        {Array.from({ length: rows }).map((_, i) => (
          <Line key={`h${i}`} x1={0} y1={i * S} x2={w} y2={i * S} stroke={stroke} strokeWidth={0.5} />
        ))}
      </Svg>
    );
  }

  if (patternId === 'diagonal') {
    return (
      <Svg width={w} height={h}>
        <Rect width={w} height={h} fill={bg} />
        {Array.from({ length: 30 }).map((_, i) => (
          <Line key={i} x1={-100 + i * S} y1={0} x2={i * S} y2={100} stroke={stroke} strokeWidth={0.5} />
        ))}
      </Svg>
    );
  }

  if (patternId === 'diamonds') {
    const cols = Math.ceil(w / S);
    const rows = Math.ceil(h / S);
    const d = S / 3;
    return (
      <Svg width={w} height={h}>
        <Rect width={w} height={h} fill={bg} />
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const cx = c * S + S / 2;
            const cy = r * S + S / 2;
            return (
              <React.Fragment key={`${r}-${c}`}>
                <Line x1={cx} y1={cy - d} x2={cx + d} y2={cy} stroke={stroke} strokeWidth={0.5} />
                <Line x1={cx + d} y1={cy} x2={cx} y2={cy + d} stroke={stroke} strokeWidth={0.5} />
                <Line x1={cx} y1={cy + d} x2={cx - d} y2={cy} stroke={stroke} strokeWidth={0.5} />
                <Line x1={cx - d} y1={cy} x2={cx} y2={cy - d} stroke={stroke} strokeWidth={0.5} />
              </React.Fragment>
            );
          }),
        )}
      </Svg>
    );
  }

  return <View style={{ width: w, height: h, backgroundColor: bg }} />;
}

export function WallpaperPreview({ wallpaper, size, borderRadius = 10, style, children }: Props) {
  const bgColor = wallpaper.type === 'color' ? wallpaper.value : undefined;
  const imageUri = wallpaper.type === 'image' ? wallpaper.value : undefined;
  const patternId = wallpaper.type === 'pattern' ? wallpaper.value : undefined;

  const base: ViewStyle = useMemo(
    () =>
      StyleSheet.flatten([
        size ? { width: size.width, height: size.height } : styles.fill,
        { borderRadius, overflow: 'hidden' as const },
        style,
      ]) as ViewStyle,
    [size, borderRadius, style],
  );

  if (wallpaper.type === 'color') {
    return (
      <View style={[base, { backgroundColor: bgColor }]}>
        {children}
      </View>
    );
  }

  if (wallpaper.type === 'gradient' && wallpaper.colors?.length) {
    return (
      <LinearGradient
        colors={wallpaper.colors}
        locations={wallpaper.locations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={base}
      >
        {children}
      </LinearGradient>
    );
  }

  if (wallpaper.type === 'pattern' && patternId) {
    return (
      <View style={base}>
        <MiniPattern patternId={patternId} bg="#f9fafb" w={120} h={160} />
        {children}
      </View>
    );
  }

  if (wallpaper.type === 'image' && imageUri) {
    return (
      <View style={base}>
        <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        {children}
      </View>
    );
  }

  return <View style={base}>{children}</View>;
}

const styles = StyleSheet.create({
  fill: { width: '100%', aspectRatio: 0.65 },
});
