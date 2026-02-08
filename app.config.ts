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
      NSCameraUsageDescription: '작업 결과 사진 촬영을 위해 카메라 접근 권한이 필요합니다.',
      NSPhotoLibraryUsageDescription: '작업 결과 사진 첨부를 위해 사진 라이브러리 접근 권한이 필요합니다.',
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
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-dev-client',
    'expo-secure-store',
    [
      'expo-camera',
      {
        cameraPermission: '작업 결과 사진 촬영을 위해 카메라 접근 권한이 필요합니다.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: '작업 결과 사진 첨부를 위해 사진 라이브러리 접근 권한이 필요합니다.',
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
