import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuthStore } from '@/stores/auth.store';
import { APP_NAME } from '@/constants/config';
import { checkDeviceStatus } from '@/api/auth';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorButton } from '@/components/ui/SeniorButton';

export default function DevicePendingScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { isSeniorMode, fontSize } = useSeniorStyles();
  const [isPolling, setIsPolling] = useState(true);
  const [requestedAt, setRequestedAt] = useState<string>('');

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let isMounted = true;

    // 디바이스 승인 상태 확인 함수
    const pollDeviceStatus = async () => {
      try {
        console.log('[DevicePending] 승인 상태 확인 중...');
        const response = await checkDeviceStatus();

        if (!isMounted) return;

        if (response.code === 'success' && response.data) {
          const { status, requestedAt: reqTime } = response.data;

          // 요청 시간 업데이트
          if (reqTime && !requestedAt) {
            setRequestedAt(reqTime);
          }

          if (status === 'APPROVED') {
            // 승인됨 - 메인 화면으로 이동
            console.log('[DevicePending] 디바이스 승인됨');
            setIsPolling(false);
            if (intervalId) clearInterval(intervalId);

            Alert.alert('승인 완료', '디바이스가 승인되었습니다.', [
              {
                text: '확인',
                onPress: () => {
                  router.replace('/(main)/(tabs)/home');
                },
              },
            ]);
          } else if (status === 'REJECTED') {
            // 거절됨 - 에러 메시지 표시 후 로그인 화면으로 이동
            console.log('[DevicePending] 디바이스 거절됨');
            setIsPolling(false);
            if (intervalId) clearInterval(intervalId);

            Alert.alert(
              '승인 거절',
              '관리자가 디바이스 승인을 거절했습니다.\n다시 로그인해주세요.',
              [
                {
                  text: '확인',
                  onPress: () => {
                    logout();
                    router.replace('/(auth)/login');
                  },
                },
              ]
            );
          }
          // status === 'PENDING'인 경우 계속 폴링
        }
      } catch (error) {
        console.error('[DevicePending] 승인 상태 확인 오류:', error);
        // 에러 발생 시에도 계속 폴링 (네트워크 일시적 오류 가능성)
      }
    };

    // 초기 상태 확인
    pollDeviceStatus();

    // 5초 간격으로 폴링 시작
    intervalId = setInterval(() => {
      if (isMounted && isPolling) {
        pollDeviceStatus();
      }
    }, 5000);

    // 컴포넌트 언마운트 시 정리
    return () => {
      isMounted = false;
      setIsPolling(false);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, requestedAt, logout, router]);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  // 현재 기기 정보 가져오기
  const getDeviceInfo = () => {
    const brand = Constants.systemName || Platform.OS;
    const model = Constants.deviceName || 'Unknown Device';
    return `${brand} ${model}`;
  };

  // 날짜 포맷팅 함수
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, isSeniorMode && { fontSize: fontSize.title }]}>{APP_NAME}</Text>

        <View style={styles.statusArea}>
          {isPolling && <ActivityIndicator size="large" color="#0064FF" style={styles.spinner} />}
          <Text style={[styles.statusTitle, isSeniorMode && { fontSize: fontSize.large }]}>
            기기 승인 대기 중
          </Text>
          <Text style={[styles.statusDescription, isSeniorMode && { fontSize: fontSize.small }]}>
            관리자가 기기를 승인하면{'\n'}자동으로 로그인됩니다
          </Text>
        </View>

        <View
          style={[
            styles.infoBox,
            isSeniorMode && {
              padding: 24,
              borderWidth: 2,
            },
          ]}
        >
          <Text style={[styles.infoTitle, isSeniorMode && { fontSize: fontSize.small }]}>
            승인 요청 정보
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isSeniorMode && { fontSize: fontSize.small }]}>
              기기
            </Text>
            <Text style={[styles.infoValue, isSeniorMode && { fontSize: fontSize.small }]}>
              {getDeviceInfo()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isSeniorMode && { fontSize: fontSize.small }]}>
              요청 시간
            </Text>
            <Text style={[styles.infoValue, isSeniorMode && { fontSize: fontSize.small }]}>
              {formatDateTime(requestedAt) || '확인 중...'}
            </Text>
          </View>
        </View>

        {/* 로그아웃 버튼 - 시니어 모드 대응 */}
        {isSeniorMode ? (
          <SeniorButton
            label="다른 계정으로 로그인"
            onPress={handleLogout}
            variant="outline"
            fullWidth
          />
        ) : (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>다른 계정으로 로그인</Text>
          </TouchableOpacity>
        )}
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
