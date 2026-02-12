import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_STAGING = process.env.APP_VARIANT === 'staging';

const getUniqueIdentifier = () => {
  if (IS_DEV) return 'com.hdclandmark.insite.dev';
  if (IS_STAGING) return 'com.hdclandmark.insite.staging';
  return 'com.hdclandmark.insite';
};

const getAppName = () => {
  if (IS_DEV) return 'Insite (Dev)';
  if (IS_STAGING) return 'Insite (Stage)';
  return 'Insite';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'insite',
  version: '2.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'insite',
  userInterfaceStyle: 'automatic',
  newArchEnabled: false,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0064FF',
  },
  jsEngine: 'hermes',
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    infoPlist: {
      NFCReaderUsageDescription: '순찰 체크포인트 및 설비 태그 스캔을 위해 NFC가 필요합니다.',
      NSCameraUsageDescription: 'QR 코드 스캔 및 사진 촬영을 위해 카메라 접근 권한이 필요합니다.',
      NSMicrophoneUsageDescription: '동영상 촬영을 위해 마이크 접근 권한이 필요합니다.',
      NSPhotoLibraryUsageDescription:
        '작업 결과 사진 첨부를 위해 사진 라이브러리 접근 권한이 필요합니다.',
      NSLocationWhenInUseUsageDescription: '출퇴근 위치 확인을 위해 위치 접근 권한이 필요합니다.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        '출퇴근 위치 확인을 위해 위치 접근 권한이 필요합니다.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0064FF',
    },
    package: getUniqueIdentifier(),
    permissions: [
      'android.permission.NFC',
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.VIBRATE',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_BACKGROUND_LOCATION',
      'android.permission.RECORD_AUDIO',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-video',
    'expo-dev-client',
    'expo-secure-store',
    [
      'react-native-nfc-manager',
      {
        nfcPermission: '순찰 체크포인트 및 설비 태그 스캔을 위해 NFC가 필요합니다.',
        selectIdentifiers: ['NDEF'],
        includeNdefEntitlement: true,
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'QR 코드 스캔 및 사진 촬영을 위해 카메라 접근 권한이 필요합니다.',
        microphonePermission: '동영상 촬영을 위해 마이크 접근 권한이 필요합니다.',
        recordAudioAndroid: true,
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: '작업 결과 사진 첨부를 위해 사진 라이브러리 접근 권한이 필요합니다.',
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: '출퇴근 위치 확인을 위해 위치 접근 권한이 필요합니다.',
        locationAlwaysPermission: '백그라운드 위치 확인을 위해 항상 위치 접근 권한이 필요합니다.',
        locationWhenInUsePermission: '출퇴근 위치 확인을 위해 위치 접근 권한이 필요합니다.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#0064FF',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: '4d96230f-5a0f-448d-a2a2-fc180c2cfaf6',
    },
  },
  updates: {
    url: 'https://u.expo.dev/4d96230f-5a0f-448d-a2a2-fc180c2cfaf6',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
});
