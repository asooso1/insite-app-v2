/**
 * Expo Updates 유틸리티
 *
 * OTA(Over-The-Air) 업데이트 관리 기능 제공
 * - Expo Go에서는 업데이트 기능 제한됨 (프로덕션 빌드에서만 동작)
 * - runtimeVersion: 'appVersion' (app.config.ts 기준)
 *
 * @see https://docs.expo.dev/versions/latest/sdk/updates/
 */

import * as Updates from 'expo-updates';
import Constants from 'expo-constants';

/** 업데이트 상태 */
export type UpdateStatus =
  | 'idle' // 대기 중
  | 'checking' // 확인 중
  | 'available' // 업데이트 가능
  | 'downloading' // 다운로드 중
  | 'ready' // 적용 준비 완료
  | 'error' // 오류 발생
  | 'unavailable'; // 업데이트 불가 (Expo Go 등)

/** 업데이트 정보 */
export interface UpdateInfo {
  /** 현재 업데이트 ID */
  currentUpdateId: string | null;
  /** 업데이트 가능 여부 */
  isAvailable: boolean;
  /** 업데이트 매니페스트 */
  manifest: Updates.Manifest | null;
  /** 런타임 버전 */
  runtimeVersion: string | null;
  /** 채널 (dev/staging/production) */
  channel: string | null;
  /** Expo Go 여부 */
  isExpoGo: boolean;
}

/** 업데이트 결과 */
export interface UpdateCheckResult {
  /** 업데이트 가능 여부 */
  isAvailable: boolean;
  /** 업데이트 매니페스트 */
  manifest?: Updates.Manifest;
  /** 에러 메시지 */
  error?: string;
}

/** 업데이트 다운로드 결과 */
export interface UpdateFetchResult {
  /** 성공 여부 */
  success: boolean;
  /** 새 업데이트 여부 */
  isNew: boolean;
  /** 매니페스트 */
  manifest?: Updates.Manifest;
  /** 에러 메시지 */
  error?: string;
}

/** 업데이트 적용 결과 */
export interface UpdateApplyResult {
  /** 성공 여부 */
  success: boolean;
  /** 에러 메시지 */
  error?: string;
}

/**
 * Expo Go 환경 체크
 * Expo Go에서는 OTA 업데이트가 제한됨
 */
const isExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo';
};

/**
 * 업데이트 기능 사용 가능 여부
 */
export const isUpdatesAvailable = (): boolean => {
  // Expo Go에서는 업데이트 불가
  if (isExpoGo()) {
    return false;
  }
  // Updates가 활성화되어 있는지 확인
  return Updates.isEnabled;
};

/**
 * 업데이트 환경 체크 (isUpdatesAvailable의 별칭)
 */
export const isUpdateEnvironment = isUpdatesAvailable;

/**
 * 앱 재시작 (reloadAsync의 별칭)
 */
export const reloadApp = async (): Promise<void> => {
  await Updates.reloadAsync();
};

/**
 * 업데이트 채널 가져오기
 */
export const getUpdateChannel = (): string | null => {
  return Updates.channel ?? null;
};

/**
 * 현재 업데이트 정보 조회
 */
export const getCurrentUpdateInfo = (): UpdateInfo => {
  const expoGoFlag = isExpoGo();

  return {
    currentUpdateId: Updates.updateId ?? null,
    isAvailable: isUpdatesAvailable(),
    manifest: (Updates.manifest as Updates.Manifest | null) ?? null,
    runtimeVersion: Updates.runtimeVersion ?? null,
    channel: Updates.channel ?? null,
    isExpoGo: expoGoFlag,
  };
};

/**
 * 업데이트 확인
 *
 * 서버에 새 업데이트가 있는지 확인
 * Expo Go에서는 항상 { isAvailable: false } 반환
 *
 * @returns 업데이트 확인 결과
 *
 * @example
 * const result = await checkForUpdates();
 * if (result.isAvailable) {
 *   console.log('새 업데이트 있음:', result.manifest);
 * }
 */
export const checkForUpdates = async (): Promise<UpdateCheckResult> => {
  // Expo Go 체크
  if (isExpoGo()) {
    return {
      isAvailable: false,
      error: 'Expo Go에서는 업데이트 기능을 사용할 수 없습니다.',
    };
  }

  // Updates 비활성화 체크
  if (!Updates.isEnabled) {
    return {
      isAvailable: false,
      error: '업데이트가 비활성화되어 있습니다.',
    };
  }

  try {
    const update = await Updates.checkForUpdateAsync();

    return {
      isAvailable: update.isAvailable,
      manifest: update.isAvailable ? update.manifest : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';

    return {
      isAvailable: false,
      error: `업데이트 확인 실패: ${message}`,
    };
  }
};

/**
 * 업데이트 다운로드
 *
 * 새 업데이트를 다운로드하고 준비
 * Expo Go에서는 에러 반환
 *
 * @returns 다운로드 결과
 *
 * @example
 * const result = await fetchUpdate();
 * if (result.success && result.isNew) {
 *   console.log('새 업데이트 다운로드 완료');
 *   await applyUpdate(); // 적용
 * }
 */
export const fetchUpdate = async (): Promise<UpdateFetchResult> => {
  // Expo Go 체크
  if (isExpoGo()) {
    return {
      success: false,
      isNew: false,
      error: 'Expo Go에서는 업데이트 기능을 사용할 수 없습니다.',
    };
  }

  // Updates 비활성화 체크
  if (!Updates.isEnabled) {
    return {
      success: false,
      isNew: false,
      error: '업데이트가 비활성화되어 있습니다.',
    };
  }

  try {
    const result = await Updates.fetchUpdateAsync();

    return {
      success: true,
      isNew: result.isNew,
      manifest: result.manifest ?? undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';

    return {
      success: false,
      isNew: false,
      error: `업데이트 다운로드 실패: ${message}`,
    };
  }
};

/**
 * 업데이트 적용 및 앱 재시작
 *
 * 다운로드된 업데이트를 적용하고 앱 재시작
 * Expo Go에서는 에러 반환
 *
 * @returns 적용 결과 (성공 시 앱이 재시작되므로 응답을 받지 못할 수 있음)
 *
 * @example
 * const result = await applyUpdate();
 * // 성공 시 앱이 자동으로 재시작됨
 */
export const applyUpdate = async (): Promise<UpdateApplyResult> => {
  // Expo Go 체크
  if (isExpoGo()) {
    return {
      success: false,
      error: 'Expo Go에서는 업데이트 기능을 사용할 수 없습니다.',
    };
  }

  // Updates 비활성화 체크
  if (!Updates.isEnabled) {
    return {
      success: false,
      error: '업데이트가 비활성화되어 있습니다.',
    };
  }

  try {
    // 앱 재시작 (업데이트 적용)
    await Updates.reloadAsync();

    // reloadAsync()가 성공하면 앱이 재시작되므로 여기까지 오지 않음
    return {
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';

    return {
      success: false,
      error: `업데이트 적용 실패: ${message}`,
    };
  }
};

/**
 * 전체 업데이트 플로우 (확인 → 다운로드 → 적용)
 *
 * 업데이트 확인, 다운로드, 적용을 순차적으로 실행
 * 콜백을 통해 진행 상황 전달
 *
 * @param onProgress 진행 상황 콜백
 * @returns 최종 결과
 *
 * @example
 * await performFullUpdate((status) => {
 *   console.log('현재 상태:', status);
 * });
 */
export const performFullUpdate = async (
  onProgress?: (status: UpdateStatus) => void
): Promise<UpdateApplyResult> => {
  // Expo Go 체크
  if (isExpoGo()) {
    onProgress?.('unavailable');
    return {
      success: false,
      error: 'Expo Go에서는 업데이트 기능을 사용할 수 없습니다.',
    };
  }

  // Updates 비활성화 체크
  if (!Updates.isEnabled) {
    onProgress?.('unavailable');
    return {
      success: false,
      error: '업데이트가 비활성화되어 있습니다.',
    };
  }

  try {
    // 1. 업데이트 확인
    onProgress?.('checking');
    const checkResult = await checkForUpdates();

    if (!checkResult.isAvailable) {
      onProgress?.('idle');
      return {
        success: false,
        error: checkResult.error ?? '업데이트가 없습니다.',
      };
    }

    onProgress?.('available');

    // 2. 업데이트 다운로드
    onProgress?.('downloading');
    const fetchResult = await fetchUpdate();

    if (!fetchResult.success || !fetchResult.isNew) {
      onProgress?.('error');
      return {
        success: false,
        error: fetchResult.error ?? '업데이트 다운로드 실패',
      };
    }

    // 3. 업데이트 적용
    onProgress?.('ready');
    const applyResult = await applyUpdate();

    return applyResult;
  } catch (error) {
    onProgress?.('error');
    const message = error instanceof Error ? error.message : '알 수 없는 오류';

    return {
      success: false,
      error: `업데이트 프로세스 실패: ${message}`,
    };
  }
};

/**
 * 업데이트 상태 변경 이벤트 리스너 등록
 *
 * 네이티브 상태 변경 이벤트를 구독
 * useUpdates() 훅 대신 사용 가능
 *
 * @param onEvent 이벤트 콜백
 * @returns 리스너 제거 함수
 *
 * @example
 * const removeListener = addUpdateEventListener((event) => {
 *   if (event.context.isUpdateAvailable) {
 *     console.log('업데이트 있음:', event.context.latestManifest);
 *   }
 * });
 *
 * // 나중에 제거
 * removeListener();
 */
export const addUpdateEventListener = (
  onEvent: (event: Updates.UpdatesNativeStateChangeEvent) => void
): (() => void) => {
  const subscription = Updates.addUpdatesStateChangeListener(onEvent);
  return () => subscription.remove();
};
