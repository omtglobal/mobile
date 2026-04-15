import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';

interface InputProps extends Omit<TextInputProps, 'placeholderTextColor'> {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, onFocus, onBlur, ...props }: InputProps) {
  const { colors, radius } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : focused
      ? colors.brandPrimary
      : colors.borderDefault;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          {
            borderColor,
            backgroundColor: colors.bgPrimary,
            color: colors.textPrimary,
            borderRadius: radius.md,
          },
          style,
        ]}
        placeholderTextColor={colors.textTertiary}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
