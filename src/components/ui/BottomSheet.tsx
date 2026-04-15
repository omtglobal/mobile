import React from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  type ViewProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '~/lib/contexts/ThemeContext';
import { SPRING_CONFIG } from '~/constants/theme';

interface BottomSheetProps extends ViewProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  style,
  ...props
}: BottomSheetProps) {
  const { colors, radius, shadows } = useTheme();
  const translateY = useSharedValue(500);

  React.useEffect(() => {
    translateY.value = withSpring(visible ? 0 : 500, SPRING_CONFIG);
  }, [visible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.contentWrap} onPress={(e) => e.stopPropagation()}>
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.bgPrimary,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                ...shadows.lg,
              },
              animatedStyle,
              style,
            ]}
            {...props}
          >
            <View style={[styles.handle, { backgroundColor: colors.borderDefault }]} />
            {children}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  contentWrap: {
    maxHeight: '90%',
  },
  sheet: {
    paddingTop: 12,
    paddingBottom: 34,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
});
