/**
 * QR 스캔 서비스
 *
 * expo-barcode-scanner를 사용한 QR 코드 스캔
 */
import { Alert, Linking, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import Constants from 'expo-constants';

// Expo Go 여부 확인
const isExpoGo = Constants.appOwnership === 'expo';

export interface QRScannerError {
  code: 'PERMISSION_DENIED' | 'NOT_AVAILABLE' | 'CANCELLED' | 'UNKNOWN';
  message: string;
}

/**
 * 카메라 권한 상태
 */
export type CameraPermissionStatus = 'granted' | 'denied' | 'undetermined';

/**
 * 카메라 권한 확인
 */
export const checkCameraPermission = async (): Promise<CameraPermissionStatus> => {
  try {
    const { status } = await Camera.getCameraPermissionsAsync();
    return status as CameraPermissionStatus;
  } catch (error) {
    console.error('[QRScanner] 권한 확인 실패:', error);
    return 'undetermined';
  }
};

/**
 * 카메라 권한 요청
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        '카메라 권한 필요',
        'QR 코드 스캔을 위해 카메라 권한이 필요합니다.\n설정에서 카메라 권한을 허용해주세요.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '설정 열기',
            onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            },
          },
        ]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('[QRScanner] 권한 요청 실패:', error);
    return false;
  }
};

/**
 * 카메라 권한 거부 알림
 */
export const showPermissionDeniedAlert = (): void => {
  Alert.alert(
    '카메라 권한 거부됨',
    'QR 코드 스캔을 위해 카메라 권한이 필요합니다.\n설정에서 권한을 허용해주세요.',
    [
      { text: '취소', style: 'cancel' },
      {
        text: '설정 열기',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        },
      },
    ]
  );
};

/**
 * QR 스캔 가능 여부 확인
 */
export const isQRScanAvailable = async (): Promise<boolean> => {
  try {
    const status = await checkCameraPermission();
    return status === 'granted';
  } catch {
    return false;
  }
};

/**
 * 디바운스용 마지막 스캔 시간
 */
let lastScanTime = 0;
const SCAN_DEBOUNCE_MS = 3000; // 3초

/**
 * 스캔 디바운스 체크
 */
export const checkScanDebounce = (): boolean => {
  const now = Date.now();
  if (now - lastScanTime < SCAN_DEBOUNCE_MS) {
    return false; // 디바운스 중
  }
  lastScanTime = now;
  return true;
};

/**
 * 디바운스 리셋
 */
export const resetScanDebounce = (): void => {
  lastScanTime = 0;
};

/**
 * 바코드 타입 (expo-barcode-scanner 호환)
 */
export const BARCODE_TYPES = {
  QR: 'qr',
  // 필요 시 추가 타입
} as const;

console.log('[QRScanner] 서비스 초기화 완료, Expo Go:', isExpoGo);
