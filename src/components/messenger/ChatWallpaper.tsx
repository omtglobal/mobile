import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import type { WallpaperConfig } from '~/constants/wallpapers';

interface Props {
  wallpaper: WallpaperConfig | undefined;
  fallbackColor: string;
  children: React.ReactNode;
  style?: object;
}

function PatternFill({ patternId, bg }: { patternId: string; bg: string }) {
  const SIZE = 20;
  const stroke = '#d1d5db';

  if (patternId === 'dots') {
    return (
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Rect width="100%" height="100%" fill={bg} />
        {Array.from({ length: 40 }).map((_, r) =>
          Array.from({ length: 25 }).map((_, c) => (
            <Circle
              key={`${r}-${c}`}
              cx={c * SIZE + SIZE / 2}
              cy={r * SIZE + SIZE / 2}
              r={1.5}
              fill={stroke}
            />
          )),
        )}
      </Svg>
    );
  }

  if (patternId === 'lines') {
    return (
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Rect width="100%" height="100%" fill={bg} />
        {Array.from({ length: 25 }).map((_, i) => (
          <Line
            key={i}
            x1={i * SIZE}
            y1={0}
            x2={i * SIZE}
            y2="100%"
            stroke={stroke}
            strokeWidth={1}
          />
        ))}
      </Svg>
    );
  }

  if (patternId === 'grid') {
    return (
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Rect width="100%" height="100%" fill={bg} />
        {Array.from({ length: 25 }).map((_, i) => (
          <React.Fragment key={`g-${i}`}>
            <Line x1={i * SIZE} y1={0} x2={i * SIZE} y2="100%" stroke={stroke} strokeWidth={1} />
            <Line x1={0} y1={i * SIZE} x2="100%" y2={i * SIZE} stroke={stroke} strokeWidth={1} />
          </React.Fragment>
        ))}
      </Svg>
    );
  }

  if (patternId === 'diagonal') {
    return (
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Rect width="100%" height="100%" fill={bg} />
        {Array.from({ length: 60 }).map((_, i) => (
          <Line
            key={i}
            x1={-400 + i * SIZE}
            y1={0}
            x2={i * SIZE}
            y2={400}
            stroke={stroke}
            strokeWidth={1}
          />
        ))}
      </Svg>
    );
  }

  if (patternId === 'diamonds') {
    return (
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Rect width="100%" height="100%" fill={bg} />
        {Array.from({ length: 40 }).map((_, r) =>
          Array.from({ length: 25 }).map((_, c) => {
            const cx = c * SIZE + SIZE / 2;
            const cy = r * SIZE + SIZE / 2;
            const h = SIZE / 3;
            return (
              <React.Fragment key={`d-${r}-${c}`}>
                <Line x1={cx} y1={cy - h} x2={cx + h} y2={cy} stroke={stroke} strokeWidth={0.8} />
                <Line x1={cx + h} y1={cy} x2={cx} y2={cy + h} stroke={stroke} strokeWidth={0.8} />
                <Line x1={cx} y1={cy + h} x2={cx - h} y2={cy} stroke={stroke} strokeWidth={0.8} />
                <Line x1={cx - h} y1={cy} x2={cx} y2={cy - h} stroke={stroke} strokeWidth={0.8} />
              </React.Fragment>
            );
          }),
        )}
      </Svg>
    );
  }

  return <View style={[StyleSheet.absoluteFill, { backgroundColor: bg }]} />;
}

export function ChatWallpaper({ wallpaper, fallbackColor, children, style }: Props) {
  if (!wallpaper) {
    return (
      <View style={[styles.flex, { backgroundColor: fallbackColor }, style]}>
        {children}
      </View>
    );
  }

  const wpValue = wallpaper.value;

  if (wallpaper.type === 'color') {
    return (
      <View style={[styles.flex, { backgroundColor: wpValue }, style]}>
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
        style={[styles.flex, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  if (wallpaper.type === 'pattern') {
    return (
      <View style={[styles.flex, style]}>
        <PatternFill patternId={wpValue} bg="#f9fafb" />
        <View style={styles.flex}>{children}</View>
      </View>
    );
  }

  if (wallpaper.type === 'image') {
    return (
      <ImageBackground
        source={{ uri: wpValue }}
        resizeMode="cover"
        style={[styles.flex, style]}
        imageStyle={styles.imageBg}
      >
        {children}
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: fallbackColor }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  imageBg: { opacity: 0.85 },
});
