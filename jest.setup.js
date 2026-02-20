/**
 * Jest 글로벌 설정
 *
 * 네이티브 모듈 Mock 및 전역 설정
 */

// expo-secure-store mock
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// @react-native-async-storage/async-storage mock
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    multiGet: jest.fn().mockResolvedValue([]),
    multiSet: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
  },
}));

// expo-notifications mock
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'mock-token' }),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
}));

// expo-location mock
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 37.5665, longitude: 126.978, accuracy: 10 },
    timestamp: Date.now(),
  }),
}));

// expo-network mock
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  }),
}));

// react-native-nfc-manager mock
jest.mock('react-native-nfc-manager', () => ({
  __esModule: true,
  default: {
    start: jest.fn().mockResolvedValue(undefined),
    isSupported: jest.fn().mockResolvedValue(true),
    requestTechnology: jest.fn().mockResolvedValue(undefined),
    getTag: jest.fn().mockResolvedValue({ id: 'mock-tag-id' }),
    cancelTechnologyRequest: jest.fn().mockResolvedValue(undefined),
  },
  NfcTech: { Ndef: 'Ndef', NfcA: 'NfcA' },
  Ndef: { text: { decodePayload: jest.fn() } },
}));

// expo-camera mock
jest.mock('expo-camera', () => ({
  Camera: { requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }) },
  CameraView: 'CameraView',
}));

// expo-image-picker mock
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

// expo-updates mock
jest.mock('expo-updates', () => ({
  checkForUpdateAsync: jest.fn().mockResolvedValue({ isAvailable: false }),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

// expo-blur mock
jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// expo-linear-gradient mock
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// expo-linking mock
jest.mock('expo-linking', () => ({
  createURL: jest.fn((path) => `insite://${path}`),
  parse: jest.fn(),
}));

// react-native-reanimated mock
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// console 출력 억제 (테스트 출력 정리)
console.log = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();
