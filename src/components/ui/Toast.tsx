import React, { createContext, useCallback, useContext, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Check, X, Info } from 'lucide-react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<{
  show: (message: string, type?: ToastType) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });
  const insets = useSafeAreaInsets();

  const show = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast.visible && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.container,
            { bottom: insets.bottom + 16 },
          ]}
        >
          <ToastContent message={toast.message} type={toast.type} />
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

function ToastContent({ message, type }: { message: string; type: ToastType }) {
  const { colors } = useTheme();
  const Icon = type === 'success' ? Check : type === 'error' ? X : Info;
  const iconColor = type === 'success' ? colors.success : type === 'error' ? colors.error : colors.info;

  return (
    <View
      style={[
        styles.toast,
        {
          backgroundColor: colors.textPrimary,
        },
      ]}
    >
      <Icon color="#FFFFFF" size={20} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      show: () => {},
    };
  }
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
});
