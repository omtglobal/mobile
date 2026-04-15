import { Stack } from 'expo-router';

export default function SupportLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Support' }} />
      <Stack.Screen name="new" options={{ title: 'New ticket' }} />
      <Stack.Screen name="[id]" options={{ title: 'Ticket' }} />
    </Stack>
  );
}
