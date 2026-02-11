/**
 * useAppUpdates Hook (Simplified)
 *
 * 설정 화면을 위한 단순화된 OTA 업데이트 관리 훅
 */
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  isUpdatesAvailable,
  checkForUpdates,
  fetchUpdate,
  applyUpdate as applyUpdateUtil,
} from '@/utils/updates';

/**
 * 앱 업데이트 훅 반환 타입
 */
export interface UseAppUpdatesReturn {
  /** 업데이트 가용 여부 */
  isUpdateAvailable: boolean;
  /** 업데이트 확인 중 */
  isChecking: boolean;
  /** 업데이트 다운로드 중 */
  isDownloading: boolean;
  /** 업데이트 확인 함수 */
  checkUpdate: () => Promise<void>;
  /** 업데이트 다운로드 및 적용 함수 */
  applyUpdate: () => Promise<void>;
}

/**
 * OTA 업데이트 관리 훅 (설정 화면용)
 *
 * @returns 업데이트 관련 상태 및 함수
 */
export function useAppUpdates(): UseAppUpdatesReturn {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  /**
   * 업데이트 확인
   */
  const checkUpdate = useCallback(async () => {
    // 개발 환경에서는 업데이트 불가
    if (!isUpdatesAvailable()) {
      Alert.alert('안내', '개발 모드에서는 업데이트를 사용할 수 없습니다.');
      return;
    }

    try {
      setIsChecking(true);
      const result = await checkForUpdates();
      setIsUpdateAvailable(result.isAvailable);

      if (result.isAvailable) {
        Alert.alert('업데이트 가능', '새로운 업데이트가 있습니다.');
      } else {
        Alert.alert('업데이트 없음', '최신 버전을 사용 중입니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '업데이트 확인 실패';
      Alert.alert('오류', errorMessage);
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * 업데이트 다운로드 및 적용
   */
  const applyUpdate = useCallback(async () => {
    if (!isUpdatesAvailable()) {
      Alert.alert('안내', '개발 모드에서는 업데이트를 사용할 수 없습니다.');
      return;
    }

    if (!isUpdateAvailable) {
      Alert.alert('안내', '적용할 업데이트가 없습니다.');
      return;
    }

    Alert.alert('업데이트 적용', '업데이트를 다운로드하고 앱을 재시작합니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '업데이트',
        onPress: async () => {
          try {
            setIsDownloading(true);

            // 업데이트 다운로드
            await fetchUpdate();

            // 앱 재시작
            await applyUpdateUtil();
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '업데이트 적용 실패';
            Alert.alert('오류', errorMessage);
            setIsDownloading(false);
          }
        },
      },
    ]);
  }, [isUpdateAvailable]);

  // 마운트 시 자동 업데이트 확인 (백그라운드, 무소음)
  useEffect(() => {
    if (isUpdatesAvailable()) {
      checkForUpdates()
        .then((result) => {
          setIsUpdateAvailable(result.isAvailable);
        })
        .catch((error) => {
          console.error('Background update check failed:', error);
        });
    }
  }, []);

  return {
    isUpdateAvailable,
    isChecking,
    isDownloading,
    checkUpdate,
    applyUpdate,
  };
}
