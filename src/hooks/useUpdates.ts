/**
 * Updates Hook
 *
 * OTA 업데이트 상태 관리 및 제어 훅
 * expo-updates의 useUpdates 훅을 래핑하여 간편한 API 제공
 */
import { useCallback, useEffect } from 'react';
import * as Updates from 'expo-updates';
import {
  checkForUpdates as checkForUpdatesUtil,
  fetchUpdate as fetchUpdateUtil,
  applyUpdate,
  performFullUpdate,
  getCurrentUpdateInfo,
  isUpdatesAvailable,
  addUpdateEventListener,
} from '@/utils/updates';
import type { UpdateStatus, UpdateInfo } from '@/utils/updates';

/**
 * 업데이트 훅 반환 타입
 */
interface UseUpdatesReturn {
  /** 업데이트 가용 여부 (서버에 새 업데이트 존재) */
  isUpdateAvailable: boolean;
  /** 업데이트 다운로드 완료 여부 (적용 대기 중) */
  isUpdatePending: boolean;
  /** 다운로드 중 여부 */
  isDownloading: boolean;
  /** 업데이트 확인 중 여부 */
  isChecking: boolean;
  /** 앱 재시작 중 여부 */
  isRestarting: boolean;
  /** 다운로드 진행률 (0~1) */
  downloadProgress?: number;
  /** 현재 실행 중인 업데이트 정보 */
  currentUpdateInfo: UpdateInfo;
  /** 사용 가능한 업데이트 정보 */
  availableUpdate?: Updates.UpdateInfo;
  /** 다운로드된 업데이트 정보 */
  downloadedUpdate?: Updates.UpdateInfo;
  /** 업데이트 확인 에러 */
  checkError?: Error;
  /** 업데이트 다운로드 에러 */
  downloadError?: Error;
  /** 업데이트 환경 여부 (Expo Go 아님) */
  isEnabled: boolean;
  /** 마지막 업데이트 확인 시각 */
  lastCheckForUpdateTime?: Date;
  /** 업데이트 확인 함수 */
  checkForUpdates: () => Promise<void>;
  /** 업데이트 다운로드 함수 */
  downloadUpdate: () => Promise<void>;
  /** 업데이트 적용 (앱 재시작) 함수 */
  applyUpdate: () => Promise<void>;
  /** 전체 업데이트 플로우 (확인 → 다운로드 → 적용) */
  performFullUpdate: (onProgress?: (status: UpdateStatus) => void) => Promise<void>;
}

/**
 * OTA 업데이트 훅
 *
 * expo-updates의 useUpdates를 래핑하여 추가 기능 제공
 *
 * @returns 업데이트 상태 및 제어 함수
 *
 * @example
 * ```tsx
 * function UpdateScreen() {
 *   const {
 *     isUpdateAvailable,
 *     isUpdatePending,
 *     isDownloading,
 *     downloadProgress,
 *     checkForUpdates,
 *     downloadUpdate,
 *     applyUpdate,
 *     checkError,
 *     downloadError,
 *   } = useUpdates();
 *
 *   // 자동 업데이트 확인
 *   useEffect(() => {
 *     checkForUpdates();
 *   }, []);
 *
 *   // 다운로드 완료 시 자동 적용
 *   useEffect(() => {
 *     if (isUpdatePending) {
 *       applyUpdate();
 *     }
 *   }, [isUpdatePending]);
 *
 *   if (checkError) {
 *     return <Text>업데이트 확인 오류: {checkError.message}</Text>;
 *   }
 *
 *   if (downloadError) {
 *     return <Text>다운로드 오류: {downloadError.message}</Text>;
 *   }
 *
 *   return (
 *     <View>
 *       {isUpdateAvailable && !isUpdatePending && (
 *         <Button onPress={downloadUpdate} disabled={isDownloading}>
 *           {isDownloading
 *             ? `다운로드 중... ${Math.round((downloadProgress ?? 0) * 100)}%`
 *             : '업데이트 다운로드'}
 *         </Button>
 *       )}
 *       {isUpdatePending && (
 *         <Button onPress={applyUpdate}>
 *           업데이트 설치 (앱 재시작)
 *         </Button>
 *       )}
 *     </View>
 *   );
 * }
 * ```
 */
export function useUpdates(): UseUpdatesReturn {
  // expo-updates 내장 훅 사용
  const expoUpdates = Updates.useUpdates();

  // 환경 정보
  const isEnabled = isUpdatesAvailable();
  const currentUpdateInfo = getCurrentUpdateInfo();

  /**
   * 업데이트 확인
   */
  const checkForUpdates = useCallback(async () => {
    if (!isEnabled) {
      return;
    }

    try {
      await checkForUpdatesUtil();
    } catch (error) {
      // 에러는 expoUpdates.checkError에서 확인 가능
      console.error('업데이트 확인 실패:', error);
    }
  }, [isEnabled]);

  /**
   * 업데이트 다운로드
   */
  const downloadUpdate = useCallback(async () => {
    if (!isEnabled) {
      return;
    }

    try {
      await fetchUpdateUtil();
    } catch (error) {
      // 에러는 expoUpdates.downloadError에서 확인 가능
      console.error('업데이트 다운로드 실패:', error);
    }
  }, [isEnabled]);

  /**
   * 업데이트 적용 (앱 재시작)
   */
  const applyUpdateHandler = useCallback(async () => {
    if (!isEnabled) {
      return;
    }

    try {
      await applyUpdate();
    } catch (error) {
      console.error('업데이트 적용 실패:', error);
    }
  }, [isEnabled]);

  /**
   * 전체 업데이트 플로우
   */
  const performFullUpdateHandler = useCallback(
    async (onProgress?: (status: UpdateStatus) => void) => {
      if (!isEnabled) {
        return;
      }

      try {
        await performFullUpdate(onProgress);
      } catch (error) {
        console.error('전체 업데이트 플로우 실패:', error);
      }
    },
    [isEnabled]
  );

  /**
   * 업데이트 이벤트 리스너 등록
   */
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const removeListener = addUpdateEventListener((event) => {
      // 이벤트 로깅
      console.log('업데이트 이벤트:', event);
    });

    return removeListener;
  }, [isEnabled]);

  return {
    // expo-updates 상태
    isUpdateAvailable: expoUpdates.isUpdateAvailable,
    isUpdatePending: expoUpdates.isUpdatePending,
    isDownloading: expoUpdates.isDownloading,
    isChecking: expoUpdates.isChecking,
    isRestarting: expoUpdates.isRestarting,
    downloadProgress: expoUpdates.downloadProgress,
    availableUpdate: expoUpdates.availableUpdate,
    downloadedUpdate: expoUpdates.downloadedUpdate,
    checkError: expoUpdates.checkError,
    downloadError: expoUpdates.downloadError,
    lastCheckForUpdateTime: expoUpdates.lastCheckForUpdateTimeSinceRestart,

    // 환경 정보
    currentUpdateInfo,
    isEnabled,

    // 제어 함수
    checkForUpdates,
    downloadUpdate,
    applyUpdate: applyUpdateHandler,
    performFullUpdate: performFullUpdateHandler,
  };
}

export default useUpdates;
