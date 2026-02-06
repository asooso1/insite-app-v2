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
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0064FF',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    infoPlist: {
      NFCReaderUsageDescription: '순찰 체크포인트 및 설비 태그 스캔을 위해 NFC가 필요합니다.',
      NSCameraUsageDescription: '작업 결과 사진 촬영을 위해 카메라 접근이 필요합니다.',
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
    'expo-secure-store',
    [
      'expo-camera',
      {
        cameraPermission: '작업 결과 사진 촬영을 위해 카메라 접근이 필요합니다.',
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
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
  updates: {
    url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID}`,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
});
