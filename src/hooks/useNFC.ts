/**
 * NFC 훅
 *
 * NFC 스캔 상태 관리 및 라이프사이클 관리
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  NFCTagData,
  NFCError,
  initializeNFC,
  checkNFCSupport,
  checkNFCEnabled,
  readNFCTag,
  cancelNFCScan,
  cleanupNFC,
} from '@/services/nfc';

export type NFCScanStatus = 'idle' | 'initializing' | 'ready' | 'scanning' | 'success' | 'error';

export interface UseNFCOptions {
  /** 앱 포그라운드 복귀 시 자동 초기화 */
  autoInitOnForeground?: boolean;
  /** 스캔 타임아웃 (ms) */
  scanTimeout?: number;
  /** 스캔 안내 메시지 (iOS) */
  scanAlertMessage?: string;
}

export interface UseNFCReturn {
  /** NFC 지원 여부 */
  isSupported: boolean;
  /** NFC 활성화 여부 */
  isEnabled: boolean;
  /** 현재 스캔 상태 */
  status: NFCScanStatus;
  /** 마지막으로 스캔한 태그 데이터 */
  tagData: NFCTagData | null;
  /** 에러 정보 */
  error: NFCError | null;
  /** NFC 스캔 시작 */
  startScan: () => Promise<NFCTagData | null>;
  /** NFC 스캔 취소 */
  cancelScan: () => Promise<void>;
  /** 상태 초기화 */
  reset: () => void;
  /** NFC 상태 새로고침 */
  refresh: () => Promise<void>;
}

/**
 * NFC 스캔 훅
 *
 * @example
 * ```tsx
 * const { isSupported, isEnabled, status, tagData, startScan } = useNFC();
 *
 * const handleScan = async () => {
 *   const tag = await startScan();
 *   if (tag) {
 *     console.log('태그 ID:', tag.tagId);
 *   }
 * };
 * ```
 */
export function useNFC(options?: UseNFCOptions): UseNFCReturn {
  const {
    autoInitOnForeground = true,
    scanTimeout = 30000,
    scanAlertMessage = 'NFC 태그를 스캔해주세요',
  } = options || {};

  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [status, setStatus] = useState<NFCScanStatus>('idle');
  const [tagData, setTagData] = useState<NFCTagData | null>(null);
  const [error, setError] = useState<NFCError | null>(null);

  const isScanningRef = useRef(false);
  const isMountedRef = useRef(true);

  /**
   * NFC 상태 확인 및 초기화
   */
  const initialize = useCallback(async () => {
    if (!isMountedRef.current) return;

    setStatus('initializing');
    setError(null);

    try {
      const supported = await checkNFCSupport();
      if (!isMountedRef.current) return;
      setIsSupported(supported);

      if (!supported) {
        setStatus('idle');
        return;
      }

      await initializeNFC();

      const enabled = await checkNFCEnabled();
      if (!isMountedRef.current) return;
      setIsEnabled(enabled);

      setStatus('ready');
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('[useNFC] 초기화 실패:', err);
      setStatus('error');
      setError({
        code: 'UNKNOWN',
        message: '초기화에 실패했습니다.',
      });
    }
  }, []);

  /**
   * NFC 상태 새로고침
   */
  const refresh = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      const supported = await checkNFCSupport();
      if (!isMountedRef.current) return;
      setIsSupported(supported);

      if (supported) {
        const enabled = await checkNFCEnabled();
        if (!isMountedRef.current) return;
        setIsEnabled(enabled);
      }
    } catch (err) {
      console.error('[useNFC] 상태 새로고침 실패:', err);
    }
  }, []);

  /**
   * NFC 스캔 시작
   */
  const startScan = useCallback(async (): Promise<NFCTagData | null> => {
    if (isScanningRef.current) {
      console.log('[useNFC] 이미 스캔 중');
      return null;
    }

    if (!isSupported) {
      setError({ code: 'NOT_SUPPORTED', message: 'NFC를 지원하지 않는 기기입니다.' });
      setStatus('error');
      return null;
    }

    if (!isEnabled) {
      setError({ code: 'NOT_ENABLED', message: 'NFC가 비활성화되어 있습니다.' });
      setStatus('error');
      return null;
    }

    isScanningRef.current = true;
    setStatus('scanning');
    setError(null);
    setTagData(null);

    try {
      const tag = await readNFCTag({
        alertMessage: scanAlertMessage,
        timeout: scanTimeout,
      });

      if (!isMountedRef.current) return null;

      if (tag) {
        setTagData(tag);
        setStatus('success');
        console.log('[useNFC] 스캔 성공:', tag.tagId);
        return tag;
      } else {
        // 사용자 취소
        setStatus('ready');
        return null;
      }
    } catch (err) {
      if (!isMountedRef.current) return null;

      const nfcError = err as NFCError;
      setError(nfcError);
      setStatus('error');
      console.error('[useNFC] 스캔 실패:', nfcError);
      return null;
    } finally {
      isScanningRef.current = false;
    }
  }, [isSupported, isEnabled, scanAlertMessage, scanTimeout]);

  /**
   * NFC 스캔 취소
   */
  const cancelScan = useCallback(async () => {
    if (isScanningRef.current) {
      await cancelNFCScan();
      isScanningRef.current = false;
      if (isMountedRef.current) {
        setStatus('ready');
      }
    }
  }, []);

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    setTagData(null);
    setError(null);
    setStatus(isEnabled ? 'ready' : 'idle');
  }, [isEnabled]);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    isMountedRef.current = true;
    initialize();

    return () => {
      isMountedRef.current = false;
      cleanupNFC();
    };
  }, [initialize]);

  // 앱 포그라운드 복귀 시 NFC 상태 새로고침
  useEffect(() => {
    if (!autoInitOnForeground) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refresh();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [autoInitOnForeground, refresh]);

  return {
    isSupported,
    isEnabled,
    status,
    tagData,
    error,
    startScan,
    cancelScan,
    reset,
    refresh,
  };
}

/**
 * 게스트 로그인용 NFC 스캔 훅
 *
 * 게스트 로그인에 필요한 태그 ID와 빌딩 ID를 추출합니다.
 */
export interface UseGuestNFCReturn extends UseNFCReturn {
  /** 스캔된 빌딩 ID */
  buildingId: string | null;
}

export function useGuestNFC(options?: UseNFCOptions): UseGuestNFCReturn {
  const nfc = useNFC(options);
  const [buildingId, setBuildingId] = useState<string | null>(null);

  useEffect(() => {
    if (nfc.tagData) {
      // 태그 데이터에서 빌딩 ID 추출
      // NDEF 메시지에 빌딩 ID가 있으면 사용, 없으면 태그 ID 파싱
      const { parseTagId } = require('@/services/nfc');
      const parsed = parseTagId(nfc.tagData.tagId);
      setBuildingId(parsed.buildingId || nfc.tagData.ndefMessage || null);
    } else {
      setBuildingId(null);
    }
  }, [nfc.tagData]);

  return {
    ...nfc,
    buildingId,
  };
}

/**
 * 순찰용 NFC 스캔 훅
 *
 * 체크포인트 검증에 필요한 상세 정보를 추출합니다.
 */
export interface CheckpointNFCData {
  tagId: string;
  buildingId: string | null;
  floorId: string | null;
  zoneId: string | null;
  checkpointId: string | null;
}

export interface UsePatrolNFCReturn extends UseNFCReturn {
  /** 파싱된 체크포인트 정보 */
  checkpoint: CheckpointNFCData | null;
  /** 특정 체크포인트 ID와 일치 여부 확인 */
  validateCheckpoint: (expectedCheckpointId: string) => boolean;
}

export function usePatrolNFC(options?: UseNFCOptions): UsePatrolNFCReturn {
  const nfc = useNFC(options);
  const [checkpoint, setCheckpoint] = useState<CheckpointNFCData | null>(null);

  useEffect(() => {
    if (nfc.tagData) {
      const { parseTagId } = require('@/services/nfc');
      const parsed = parseTagId(nfc.tagData.tagId);

      setCheckpoint({
        tagId: nfc.tagData.tagId,
        buildingId: parsed.buildingId || null,
        floorId: parsed.floorId || null,
        zoneId: parsed.zoneId || null,
        checkpointId: parsed.checkpointId || null,
      });
    } else {
      setCheckpoint(null);
    }
  }, [nfc.tagData]);

  const validateCheckpoint = useCallback(
    (expectedCheckpointId: string): boolean => {
      if (!checkpoint) return false;

      // 체크포인트 ID 비교 (대소문자 무시)
      return checkpoint.checkpointId?.toUpperCase() === expectedCheckpointId.toUpperCase();
    },
    [checkpoint]
  );

  return {
    ...nfc,
    checkpoint,
    validateCheckpoint,
  };
}

export default useNFC;
