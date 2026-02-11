/**
 * My Work Tab - Stack Navigator
 */
import { Stack } from 'expo-router';

export default function MyWorkLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
