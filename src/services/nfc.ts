/**
 * NFC 서비스
 *
 * NFC 태그 읽기/쓰기 및 상태 관리
 *
 * NOTE: react-native-nfc-manager는 네이티브 모듈이므로 Development Build 필요
 * Expo Go에서는 모킹 모드로 동작
 */
import { Alert, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';

// Expo Go 여부 확인
// Development Build에서는 appOwnership이 null 또는 undefined
const isExpoGo = Constants.appOwnership === 'expo';

// 디버깅용 로그
console.log('[NFC] Constants 체크:', {
  appOwnership: Constants.appOwnership,
  executionEnvironment: Constants.executionEnvironment,
  isDevice: Constants.isDevice,
  isExpoGo,
});

// NFC 사용 가능 여부 플래그
let isNFCAvailable = false;

// NfcManager 동적 import (Expo Go에서 에러 방지)
let NfcManager: typeof import('react-native-nfc-manager').default | null = null;
let NfcTech: typeof import('react-native-nfc-manager').NfcTech | null = null;

// Expo Go가 아니면 NFC 모듈 로드 시도
if (!isExpoGo) {
  try {
    const nfcModule = require('react-native-nfc-manager');
    NfcManager = nfcModule.default;
    NfcTech = nfcModule.NfcTech;
    isNFCAvailable = true;
    console.log('[NFC] 모듈 로드 성공');
  } catch (e) {
    console.log('[NFC] 모듈 로드 실패:', e);
    isNFCAvailable = false;
  }
} else {
  console.log('[NFC] Expo Go 환경 - NFC 모듈 로드 건너뜀');
}

type TagEvent = import('react-native-nfc-manager').TagEvent;

export interface NFCTagData {
  /** NFC 태그 고유 ID (hex 문자열) */
  tagId: string;
  /** 태그 타입 (NfcA, NfcB, NfcF, NfcV, IsoDep, MifareClassic, etc.) */
  techTypes: string[];
  /** NDEF 메시지 (있는 경우) */
  ndefMessage?: string;
  /** 원본 태그 이벤트 */
  rawTag: TagEvent;
}

export interface NFCError {
  code: 'NOT_SUPPORTED' | 'NOT_ENABLED' | 'CANCELLED' | 'TIMEOUT' | 'TAG_LOST' | 'UNKNOWN';
  message: string;
}

// NFC 지원 여부 캐시
let isNFCSupported: boolean | null = null;

/**
 * NFC 지원 여부 확인
 */
export const checkNFCSupport = async (): Promise<boolean> => {
  // Expo Go 또는 NFC 모듈 미사용 환경
  if (!isNFCAvailable || !NfcManager) {
    console.log('[NFC] NFC 미지원 환경 (Development Build 필요)');
    isNFCSupported = false;
    return false;
  }

  if (isNFCSupported !== null) {
    return isNFCSupported;
  }

  try {
    isNFCSupported = await NfcManager.isSupported();
    console.log('[NFC] 지원 여부:', isNFCSupported);
    return isNFCSupported;
  } catch (error) {
    console.error('[NFC] 지원 여부 확인 실패:', error);
    isNFCSupported = false;
    isNFCAvailable = false; // 네이티브 바인딩 실패로 비활성화
    return false;
  }
};

/**
 * NFC 활성화 상태 확인
 */
export const checkNFCEnabled = async (): Promise<boolean> => {
  if (!isNFCAvailable || !NfcManager) return false;

  try {
    const isSupported = await checkNFCSupport();
    if (!isSupported) return false;

    const isEnabled = await NfcManager.isEnabled();
    console.log('[NFC] 활성화 상태:', isEnabled);
    return isEnabled;
  } catch (error) {
    console.error('[NFC] 활성화 상태 확인 실패:', error);
    return false;
  }
};

/**
 * 시스템 설정 열기 (플랫폼별 처리)
 */
const openSystemSettings = (): void => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    // Android: 일반 설정 열기
    Linking.openSettings();
  }
};

/**
 * NFC 설정 화면 열기 (Android 전용)
 */
export const openNFCSettings = (): void => {
  // NFC 미사용 환경에서는 시스템 설정으로 이동
  if (!isNFCAvailable || !NfcManager) {
    openSystemSettings();
    return;
  }

  if (Platform.OS === 'android') {
    try {
      NfcManager.goToNfcSetting();
    } catch {
      openSystemSettings();
    }
  } else {
    // iOS는 시스템 설정 앱으로 이동
    Linking.openURL('app-settings:');
  }
};

/**
 * NFC 비활성화 안내 Alert
 */
export const showNFCDisabledAlert = (): void => {
  Alert.alert(
    'NFC 비활성화',
    'NFC 기능이 꺼져 있습니다.\n설정에서 NFC를 켜주세요.',
    [
      { text: '취소', style: 'cancel' },
      {
        text: '설정 열기',
        onPress: openNFCSettings,
      },
    ]
  );
};

/**
 * NFC 미지원 안내 Alert
 */
export const showNFCNotSupportedAlert = (): void => {
  Alert.alert(
    'NFC 미지원',
    '이 기기는 NFC 기능을 지원하지 않습니다.',
    [{ text: '확인' }]
  );
};

/**
 * NFC Manager 초기화
 */
export const initializeNFC = async (): Promise<boolean> => {
  if (!isNFCAvailable || !NfcManager) {
    console.log('[NFC] NFC 미사용 환경 - 초기화 건너뜀');
    return false;
  }

  try {
    const isSupported = await checkNFCSupport();
    if (!isSupported) {
      console.log('[NFC] 지원하지 않는 기기');
      return false;
    }

    await NfcManager.start();
    console.log('[NFC] Manager 초기화 완료');
    return true;
  } catch (error) {
    console.error('[NFC] Manager 초기화 실패:', error);
    return false;
  }
};

/**
 * NFC 태그 ID를 hex 문자열로 변환
 */
export const tagIdToHex = (tagId: number[] | string | undefined): string => {
  if (!tagId) return '';

  if (typeof tagId === 'string') {
    return tagId.toUpperCase();
  }

  return tagId
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
};

/**
 * NDEF 메시지에서 텍스트 추출
 */
export const extractNdefText = (tag: TagEvent): string | undefined => {
  try {
    if (!tag.ndefMessage || tag.ndefMessage.length === 0) {
      return undefined;
    }

    const record = tag.ndefMessage[0];
    if (!record || !record.payload) {
      return undefined;
    }

    // NDEF Text Record 파싱
    // 첫 바이트: 언어 코드 길이 (상위 비트는 UTF 인코딩 표시)
    const payload = record.payload;
    const firstByte = payload[0];
    if (firstByte === undefined) {
      return undefined;
    }
    const languageCodeLength = firstByte & 0x3f;
    const textBytes = payload.slice(1 + languageCodeLength);

    return String.fromCharCode(...textBytes);
  } catch (error) {
    console.error('[NFC] NDEF 텍스트 추출 실패:', error);
    return undefined;
  }
};

/**
 * NFC 태그 읽기 (단일 스캔)
 *
 * @param options 스캔 옵션
 * @returns 태그 데이터 또는 null (취소/실패 시)
 */
export const readNFCTag = async (options?: {
  /** 스캔 안내 메시지 (iOS) */
  alertMessage?: string;
  /** 타임아웃 (ms) */
  timeout?: number;
}): Promise<NFCTagData | null> => {
  const { alertMessage = 'NFC 태그를 스캔해주세요', timeout = 30000 } = options || {};

  // NFC 미사용 환경 체크
  if (!isNFCAvailable || !NfcManager || !NfcTech) {
    throw { code: 'NOT_SUPPORTED', message: 'NFC를 지원하지 않는 환경입니다. (Development Build 필요)' } as NFCError;
  }

  try {
    // NFC 활성화 확인
    const isEnabled = await checkNFCEnabled();
    if (!isEnabled) {
      const isSupported = await checkNFCSupport();
      if (!isSupported) {
        showNFCNotSupportedAlert();
        throw { code: 'NOT_SUPPORTED', message: 'NFC를 지원하지 않는 기기입니다.' } as NFCError;
      }
      showNFCDisabledAlert();
      throw { code: 'NOT_ENABLED', message: 'NFC가 비활성화되어 있습니다.' } as NFCError;
    }

    console.log('[NFC] 태그 스캔 시작...');

    // 타임아웃 설정
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<null>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject({ code: 'TIMEOUT', message: 'NFC 스캔 시간이 초과되었습니다.' } as NFCError);
      }, timeout);
    });

    // NFC 태그 읽기 (NfcManager, NfcTech가 존재함이 위에서 보장됨)
    const nfcManager = NfcManager;
    const nfcTech = NfcTech;
    const scanPromise = (async (): Promise<NFCTagData> => {
      // NDEF 기술 요청
      await nfcManager.requestTechnology(nfcTech.Ndef, {
        alertMessage,
      });

      const tag = await nfcManager.getTag();

      if (!tag) {
        throw { code: 'TAG_LOST', message: '태그를 읽을 수 없습니다.' } as NFCError;
      }

      console.log('[NFC] 태그 읽기 성공:', tag.id);

      const tagData: NFCTagData = {
        tagId: tagIdToHex(tag.id),
        techTypes: tag.techTypes || [],
        ndefMessage: extractNdefText(tag),
        rawTag: tag,
      };

      return tagData;
    })();

    // 타임아웃과 스캔 경쟁
    const result = await Promise.race([scanPromise, timeoutPromise]);

    if (timeoutId) clearTimeout(timeoutId);

    return result;
  } catch (error) {
    console.error('[NFC] 태그 스캔 실패:', error);

    // 사용자 취소 처리
    if (error === 'cancelled' || (error as Error)?.message?.includes('cancel')) {
      return null;
    }

    // NFCError 타입 에러는 그대로 전파
    if ((error as NFCError).code) {
      throw error;
    }

    throw { code: 'UNKNOWN', message: '알 수 없는 오류가 발생했습니다.' } as NFCError;
  } finally {
    // 항상 NFC 세션 정리
    if (isNFCAvailable && NfcManager) {
      try {
        await NfcManager.cancelTechnologyRequest();
      } catch {
        // 정리 실패 무시
      }
    }
  }
};

/**
 * NFC 스캔 취소
 */
export const cancelNFCScan = async (): Promise<void> => {
  if (!isNFCAvailable || !NfcManager) return;

  try {
    await NfcManager.cancelTechnologyRequest();
    console.log('[NFC] 스캔 취소됨');
  } catch {
    // 이미 취소된 경우 무시
    console.log('[NFC] 스캔 취소 (이미 취소됨 또는 세션 없음)');
  }
};

/**
 * NFC 연속 스캔 모드 시작
 *
 * @param onTagDiscovered 태그 발견 시 콜백
 * @returns 스캔 중지 함수
 */
export const startContinuousScan = (
  onTagDiscovered: (tag: NFCTagData) => void,
  onError?: (error: NFCError) => void
): (() => void) => {
  let isScanning = true;

  const scan = async () => {
    while (isScanning) {
      try {
        const tag = await readNFCTag();
        if (tag && isScanning) {
          onTagDiscovered(tag);
        }
      } catch (error) {
        if (isScanning && onError) {
          onError(error as NFCError);
        }
      }

      // 다음 스캔 전 잠시 대기
      if (isScanning) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  };

  scan();

  // 스캔 중지 함수 반환
  return () => {
    isScanning = false;
    cancelNFCScan();
  };
};

/**
 * NFC 태그 ID로 빌딩 ID 추출 (규칙 기반)
 *
 * 태그 ID 형식: BBBB-FFFF-ZZZZ-CCCC
 * - BBBB: 빌딩 ID (4자리)
 * - FFFF: 층 ID (4자리)
 * - ZZZZ: 구역 ID (4자리)
 * - CCCC: 체크포인트 ID (4자리)
 */
export const parseTagId = (tagId: string): {
  buildingId?: string;
  floorId?: string;
  zoneId?: string;
  checkpointId?: string;
} => {
  // 태그 ID가 충분히 길지 않으면 빈 객체 반환
  if (!tagId || tagId.length < 4) {
    return {};
  }

  // 16자리 형식인 경우 파싱
  if (tagId.length >= 16) {
    return {
      buildingId: tagId.substring(0, 4),
      floorId: tagId.substring(4, 8),
      zoneId: tagId.substring(8, 12),
      checkpointId: tagId.substring(12, 16),
    };
  }

  // 짧은 형식인 경우 전체를 빌딩 ID로 사용
  return {
    buildingId: tagId,
  };
};

/**
 * NFC Manager 정리
 */
export const cleanupNFC = async (): Promise<void> => {
  try {
    await cancelNFCScan();
    // NfcManager.unregisterTagEvent는 필요 시 호출
    console.log('[NFC] 정리 완료');
  } catch (error) {
    console.error('[NFC] 정리 실패:', error);
  }
};
