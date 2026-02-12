/**
 * 위치 서비스
 *
 * GPS 위치 정보 수집 및 권한 관리
 */
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

// 개발용 기본 위치 (서울 강남)
const DEV_DEFAULT_LOCATION = {
  latitude: 37.4979,
  longitude: 127.0276,
  accuracy: 10,
  timestamp: Date.now(),
};

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export interface LocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
}

/**
 * 위치 권한 요청
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      Alert.alert(
        '위치 권한 필요',
        '출퇴근 기록을 위해 위치 권한이 필요합니다.\n설정에서 위치 권한을 허용해주세요.',
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
    console.error('[Location] 권한 요청 실패:', error);
    return false;
  }
};

/**
 * 위치 권한 상태 확인
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[Location] 권한 확인 실패:', error);
    return false;
  }
};

/**
 * 현재 위치 가져오기
 */
export const getCurrentLocation = async (options?: {
  highAccuracy?: boolean;
  timeout?: number;
}): Promise<LocationCoordinates> => {
  const { highAccuracy = false, timeout = 15000 } = options || {};

  try {
    // 권한 확인
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) {
        console.log('[Location] 권한 거부됨, 개발용 기본 위치 사용');
        if (__DEV__) {
          return { ...DEV_DEFAULT_LOCATION, timestamp: Date.now() };
        }
        throw {
          code: 'PERMISSION_DENIED',
          message: '위치 권한이 거부되었습니다.',
        } as LocationError;
      }
    }

    // 위치 서비스 활성화 확인
    const isEnabled = await Location.hasServicesEnabledAsync();
    if (!isEnabled) {
      console.log('[Location] 위치 서비스 비활성화, 개발용 기본 위치 사용');
      if (__DEV__) {
        return { ...DEV_DEFAULT_LOCATION, timestamp: Date.now() };
      }
      Alert.alert(
        '위치 서비스 비활성화',
        '출퇴근 기록을 위해 위치 서비스를 켜주세요.',
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
      throw {
        code: 'POSITION_UNAVAILABLE',
        message: '위치 서비스가 비활성화되어 있습니다.',
      } as LocationError;
    }

    console.log('[Location] 위치 조회 시작...');

    // 위치 조회 (지하 등 GPS 약한 환경 고려하여 기본은 네트워크 우선)
    const location = await Location.getCurrentPositionAsync({
      accuracy: highAccuracy
        ? Location.Accuracy.High
        : Location.Accuracy.Balanced,
      timeInterval: timeout,
    });

    console.log('[Location] 위치 조회 성공:', {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('[Location] 위치 조회 실패:', error);

    // 타임아웃 시 마지막 알려진 위치 사용 시도
    try {
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        console.log('[Location] 마지막 알려진 위치 사용');
        return {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
          accuracy: lastKnown.coords.accuracy,
          timestamp: lastKnown.timestamp,
        };
      }
    } catch {
      // 마지막 위치도 실패
    }

    // 개발 환경에서는 기본 위치 반환
    if (__DEV__) {
      console.log('[Location] 개발 환경 - 기본 위치 사용');
      return { ...DEV_DEFAULT_LOCATION, timestamp: Date.now() };
    }

    throw {
      code: 'POSITION_UNAVAILABLE',
      message: '위치 정보를 가져올 수 없습니다.',
    } as LocationError;
  }
};

/**
 * 오프라인용 위치 저장 (AsyncStorage에 마지막 위치 캐시)
 */
export const cacheLocation = async (
  location: LocationCoordinates
): Promise<void> => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.default.setItem(
      'cached_location',
      JSON.stringify({
        ...location,
        cachedAt: Date.now(),
      })
    );
  } catch (error) {
    console.error('[Location] 위치 캐시 저장 실패:', error);
  }
};

/**
 * 캐시된 위치 가져오기 (오프라인용)
 */
export const getCachedLocation = async (): Promise<LocationCoordinates | null> => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const cached = await AsyncStorage.default.getItem('cached_location');

    if (!cached) return null;

    const data = JSON.parse(cached);
    const cacheAge = Date.now() - data.cachedAt;

    // 30분 이상 된 캐시는 무효
    if (cacheAge > 30 * 60 * 1000) {
      return null;
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      timestamp: data.timestamp,
    };
  } catch (error) {
    console.error('[Location] 캐시된 위치 조회 실패:', error);
    return null;
  }
};
