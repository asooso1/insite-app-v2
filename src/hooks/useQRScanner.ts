/**
 * QR 스캔 훅
 *
 * QR 코드 스캔 상태 관리 및 결과 처리
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  checkCameraPermission,
  requestCameraPermission,
  checkScanDebounce,
  resetScanDebounce,
  CameraPermissionStatus,
} from '@/services/qrScanner';
import { parseQrCode, ParseResult } from '@/utils/scanParser';

export type QRScanStatus = 'idle' | 'initializing' | 'ready' | 'scanning' | 'processing' | 'success' | 'error';

export interface UseQRScannerOptions {
  /** 자동 권한 요청 */
  autoRequestPermission?: boolean;
  /** 스캔 성공 후 자동 리셋 지연 (ms, 0이면 리셋 안 함) */
  autoResetDelay?: number;
  /** 디바운스 사용 여부 */
  useDebounce?: boolean;
}

export interface UseQRScannerReturn {
  /** 권한 상태 */
  permissionStatus: CameraPermissionStatus;
  /** 스캔 상태 */
  status: QRScanStatus;
  /** 스캔 결과 */
  scanResult: ParseResult | null;
  /** 에러 메시지 */
  error: string | null;
  /** 스캔 활성화 여부 */
  isScanning: boolean;
  /** 권한 요청 */
  requestPermission: () => Promise<boolean>;
  /** 스캔 시작 */
  startScanning: () => void;
  /** 스캔 중지 */
  stopScanning: () => void;
  /** QR 코드 처리 (Camera onBarCodeScanned에서 호출) */
  handleBarCodeScanned: (data: string) => Promise<void>;
  /** 상태 리셋 */
  reset: () => void;
}

/**
 * QR 스캔 훅
 */
export function useQRScanner(options?: UseQRScannerOptions): UseQRScannerReturn {
  const {
    autoRequestPermission = true,
    autoResetDelay = 0,
    useDebounce = true,
  } = options || {};

  const [permissionStatus, setPermissionStatus] = useState<CameraPermissionStatus>('undetermined');
  const [status, setStatus] = useState<QRScanStatus>('idle');
  const [scanResult, setScanResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const isMountedRef = useRef(true);
  const processingRef = useRef(false);

  /**
   * 권한 확인
   */
  const checkPermission = useCallback(async () => {
    const status = await checkCameraPermission();
    if (isMountedRef.current) {
      setPermissionStatus(status);
    }
    return status;
  }, []);

  /**
   * 권한 요청
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setStatus('initializing');
    const granted = await requestCameraPermission();

    if (isMountedRef.current) {
      setPermissionStatus(granted ? 'granted' : 'denied');
      setStatus(granted ? 'ready' : 'idle');
    }

    return granted;
  }, []);

  /**
   * 스캔 시작
   */
  const startScanning = useCallback(() => {
    if (permissionStatus !== 'granted') {
      setError('카메라 권한이 없습니다.');
      return;
    }

    setIsScanning(true);
    setStatus('scanning');
    setError(null);
    setScanResult(null);
    resetScanDebounce();
  }, [permissionStatus]);

  /**
   * 스캔 중지
   */
  const stopScanning = useCallback(() => {
    setIsScanning(false);
    setStatus('ready');
  }, []);

  /**
   * QR 코드 처리
   */
  const handleBarCodeScanned = useCallback(async (data: string) => {
    // 이미 처리 중이면 무시
    if (processingRef.current) return;

    // 디바운스 체크
    if (useDebounce && !checkScanDebounce()) {
      console.log('[useQRScanner] 디바운스 중 - 스캔 무시');
      return;
    }

    processingRef.current = true;
    setStatus('processing');

    try {
      console.log('[useQRScanner] QR 데이터 수신:', data.substring(0, 50) + '...');

      const result = await parseQrCode(data);

      if (!isMountedRef.current) return;

      setScanResult(result);

      if (result.success) {
        setStatus('success');
        setError(null);
        console.log('[useQRScanner] 파싱 성공:', result.type);
      } else {
        setStatus('error');
        setError(result.error || '파싱 실패');
        console.log('[useQRScanner] 파싱 실패:', result.error);
      }

      // 자동 리셋
      if (autoResetDelay > 0) {
        setTimeout(() => {
          if (isMountedRef.current) {
            reset();
          }
        }, autoResetDelay);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      setStatus('error');
      setError(err instanceof Error ? err.message : '스캔 처리 중 오류 발생');
    } finally {
      processingRef.current = false;
    }
  }, [useDebounce, autoResetDelay]);

  /**
   * 상태 리셋
   */
  const reset = useCallback(() => {
    setScanResult(null);
    setError(null);
    setStatus(permissionStatus === 'granted' ? 'ready' : 'idle');
    setIsScanning(false);
    processingRef.current = false;
    resetScanDebounce();
  }, [permissionStatus]);

  // 초기화
  useEffect(() => {
    isMountedRef.current = true;

    const init = async () => {
      setStatus('initializing');
      const status = await checkPermission();

      if (status === 'granted') {
        setStatus('ready');
      } else if (autoRequestPermission && status === 'undetermined') {
        await requestPermission();
      } else {
        setStatus('idle');
      }
    };

    init();

    return () => {
      isMountedRef.current = false;
    };
  }, [checkPermission, requestPermission, autoRequestPermission]);

  // 앱 포그라운드 복귀 시 권한 재확인
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [checkPermission]);

  return {
    permissionStatus,
    status,
    scanResult,
    error,
    isScanning,
    requestPermission,
    startScanning,
    stopScanning,
    handleBarCodeScanned,
    reset,
  };
}

export default useQRScanner;
