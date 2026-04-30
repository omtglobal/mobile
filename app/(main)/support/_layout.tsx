import { Stack, useRouter } from 'expo-router';
import { HeaderBackButton } from '~/components/ui';

/**
 * Direct pushes to `/support/new` (e.g. from seller about) often leave the support stack
 * with a single screen, so the native header shows no back control. Always render an
 * explicit back action that pops the parent navigator when needed.
 */
function SupportStackBackButton() {
  const router = useRouter();
  return <HeaderBackButton onPress={() => router.back()} hitSlop={12} />;
}

export default function SupportLayout() {
  const headerBack = { headerLeft: () => <SupportStackBackButton /> } as const;

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Support', ...headerBack }} />
      <Stack.Screen name="new" options={{ title: 'New ticket', ...headerBack }} />
      <Stack.Screen name="[id]" options={{ title: 'Ticket', ...headerBack }} />
    </Stack>
  );
}
