/**
 * 루트 인덱스 화면
 *
 * 인증 상태에 따라 적절한 화면으로 리다이렉트
 * - 인증됨: 홈 화면
 * - 미인증: 로그인 화면
 *
 * 참고: checkAuth는 _layout.tsx에서 이미 실행됨
 */
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  // Hydration 대기 중
  if (!isHydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0064FF" />
      </View>
    );
  }

  // 인증 상태에 따른 리다이렉트
  if (isAuthenticated) {
    console.log('[Index] 인증됨 -> 홈 화면으로 이동');
    return <Redirect href="/(main)/(home)" />;
  }

  console.log('[Index] 미인증 -> 로그인 화면으로 이동');
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
