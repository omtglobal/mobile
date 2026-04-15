import { Stack, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '~/lib/contexts/ThemeContext';

export default function AuthLayout() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <Pressable
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(main)')}
            style={{ padding: 8, marginLeft: 8 }}
            accessibilityLabel="Close"
          >
            <X color={colors.textPrimary} size={24} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Register' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password' }} />
      <Stack.Screen name="reset-password" options={{ title: 'New Password' }} />
    </Stack>
  );
}
