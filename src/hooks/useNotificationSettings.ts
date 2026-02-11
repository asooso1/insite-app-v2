/**
 * useNotificationSettings Hook (Simplified)
 *
 * 설정 화면을 위한 단순화된 알림 권한 관리 훅
 */
import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';

/**
 * 알림 설정 훅 반환 타입
 */
export interface UseNotificationSettingsReturn {
  /** 권한 허용 여부 */
  isEnabled: boolean;
  /** 로딩 상태 */
  isLoading: boolean;
  /** 권한 토글 함수 */
  toggleNotification: () => Promise<void>;
}

/**
 * 알림 설정 관리 훅 (설정 화면용)
 *
 * @returns 알림 설정 상태 및 토글 함수
 */
export function useNotificationSettings(): UseNotificationSettingsReturn {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [canAskAgain, setCanAskAgain] = useState(true);

  /**
   * 권한 상태 조회
   */
  const checkPermission = useCallback(async () => {
    try {
      const { status, canAskAgain: askAgain } = await Notifications.getPermissionsAsync();
      setIsEnabled(status === 'granted');
      setCanAskAgain(askAgain);
    } catch (error) {
      console.error('Failed to check notification permission:', error);
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 권한 토글
   */
  const toggleNotification = useCallback(async () => {
    // 이미 권한이 있는 경우 - 설정으로 이동 안내
    if (isEnabled) {
      Alert.alert('알림 끄기', '알림을 끄려면 설정에서 권한을 해제해주세요.', [
        { text: '취소', style: 'cancel' },
        {
          text: '설정으로 이동',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]);
      return;
    }

    // 권한 재요청이 불가능한 경우 - 설정으로 이동 안내
    if (!canAskAgain) {
      Alert.alert('알림 권한 필요', '알림을 받으려면 설정에서 권한을 허용해주세요.', [
        { text: '취소', style: 'cancel' },
        {
          text: '설정으로 이동',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]);
      return;
    }

    // 권한 요청
    try {
      setIsLoading(true);
      const { status, canAskAgain: askAgain } = await Notifications.requestPermissionsAsync();
      setIsEnabled(status === 'granted');
      setCanAskAgain(askAgain);

      if (status === 'granted') {
        Alert.alert('알림 허용됨', '알림을 받을 수 있습니다.');
      } else {
        Alert.alert('알림 거부됨', '알림을 받을 수 없습니다.');
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      Alert.alert('오류', '알림 권한 요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, canAskAgain]);

  // 초기 권한 상태 조회
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    isEnabled,
    isLoading,
    toggleNotification,
  };
}
