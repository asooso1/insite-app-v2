import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { APP_NAME } from '@/constants/config';

export default function DevicePendingScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    // TODO: Poll for device approval status
    const interval = setInterval(() => {
      // Check if device is approved
      // If approved, redirect to main
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{APP_NAME}</Text>

        <View style={styles.statusArea}>
          <ActivityIndicator size="large" color="#0064FF" style={styles.spinner} />
          <Text style={styles.statusTitle}>기기 승인 대기 중</Text>
          <Text style={styles.statusDescription}>
            관리자가 기기를 승인하면{'\n'}자동으로 로그인됩니다
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>승인 요청 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>기기</Text>
            <Text style={styles.infoValue}>iPhone 14 Pro</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>요청 시간</Text>
            <Text style={styles.infoValue}>2024-01-15 09:30</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>다른 계정으로 로그인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0064FF',
    textAlign: 'center',
    marginBottom: 48,
  },
  statusArea: {
    alignItems: 'center',
    marginBottom: 48,
  },
  spinner: {
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    color: '#6E6E6E',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6E6E6E',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6E6E6E',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C2C2C',
  },
  logoutButton: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutButtonText: {
    fontSize: 14,
    color: '#0064FF',
  },
});
