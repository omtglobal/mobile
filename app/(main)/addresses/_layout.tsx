import { Stack } from 'expo-router';

export default function AddressesLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Addresses' }} />
      <Stack.Screen name="edit" options={{ title: 'Edit Address' }} />
    </Stack>
  );
}
