/**
 * Main Layout - Stack Navigator
 *
 * Expo Router 구조:
 * - (tabs): Tab Navigator 그룹
 * - work: 작업지시 상세 (Stack Screen)
 * - patrol: 순찰점검 상세 (Stack Screen)
 * - dashboard: 대시보드 (Stack Screen)
 * - approval: 승인/확인 (Stack Screen)
 */
import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Tab Navigator 그룹 */}
      <Stack.Screen name="(tabs)" />

      {/* Stack Screens */}
      <Stack.Screen name="work" />
      <Stack.Screen name="patrol" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="approval" />
    </Stack>
  );
}
