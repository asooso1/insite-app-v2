/**
 * 알림 유틸리티 함수
 *
 * expo-notifications를 사용한 푸시 알림 및 로컬 알림 관리
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * 알림 권한 상태
 */
export interface NotificationPermissionStatus {
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
  ios?: {
    allowsSound: boolean;
    allowsBadge: boolean;
    allowsAlert: boolean;
  };
}

/**
 * 로컬 알림 옵션
 */
export interface LocalNotificationOptions {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
  sound?: string | boolean;
  trigger?: Notifications.NotificationTriggerInput;
}

/**
 * 알림 채널 (Android 전용)
 */
export interface NotificationChannel {
  id: string;
  name: string;
  importance: Notifications.AndroidImportance;
  sound?: string;
  vibrationPattern?: number[];
  enableLights?: boolean;
  lightColor?: string;
  enableVibrate?: boolean;
}

/**
 * 알림 권한 요청
 *
 * @returns 권한 상태
 */
export const requestNotificationPermissions = async (): Promise<NotificationPermissionStatus> => {
  try {
    const { status: existingStatus, canAskAgain } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;
    let finalCanAskAgain = canAskAgain;

    // 권한이 허용되지 않았고 요청 가능한 경우 요청
    if (existingStatus !== 'granted' && canAskAgain) {
      const { status, canAskAgain: newCanAskAgain } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      finalCanAskAgain = newCanAskAgain;
    }

    // iOS 세부 권한 가져오기
    let iosSettings: NotificationPermissionStatus['ios'];
    if (Platform.OS === 'ios') {
      const settings = await Notifications.getPermissionsAsync();
      iosSettings = {
        allowsSound: settings.ios?.allowsSound ?? false,
        allowsBadge: settings.ios?.allowsBadge ?? false,
        allowsAlert: settings.ios?.allowsAlert ?? false,
      };
    }

    return {
      status: finalStatus,
      canAskAgain: finalCanAskAgain,
      ios: iosSettings,
    };
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return {
      status: 'denied',
      canAskAgain: false,
    };
  }
};

/**
 * Expo Push Token 가져오기
 *
 * @param projectId - Expo 프로젝트 ID (app.json의 extra.eas.projectId)
 * @returns Expo Push Token 문자열 또는 null
 */
export const getExpoPushToken = async (projectId: string): Promise<string | null> => {
  try {
    // 실제 디바이스에서만 푸시 토큰 발급 가능
    if (!Device.isDevice) {
      console.log('[Notifications] 시뮬레이터에서는 푸시 토큰 발급 불가');
      return null;
    }

    // 권한 확인
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('[Notifications] 알림 권한 없음');
      return null;
    }

    // Expo Push Token 가져오기
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log('[Notifications] 푸시 토큰 발급 성공');
    return tokenData.data;
  } catch (error) {
    // Firebase 미설정 등의 에러는 조용히 처리
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Firebase') || errorMessage.includes('FCM')) {
      console.log('[Notifications] Firebase/FCM 미설정 - 푸시 알림 비활성화');
    } else {
      console.warn('[Notifications] 푸시 토큰 발급 실패:', errorMessage);
    }
    return null;
  }
};

/**
 * 로컬 알림 스케줄링
 *
 * @param options - 알림 옵션
 * @returns 알림 ID
 */
export const scheduleLocalNotification = async (
  options: LocalNotificationOptions
): Promise<string> => {
  try {
    const { title, body, data, badge, sound, trigger } = options;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data ?? {},
        badge: badge ?? undefined,
        sound: sound ?? true,
      },
      trigger: trigger ?? null, // null이면 즉시 발송
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule local notification:', error);
    throw error;
  }
};

/**
 * 알림 채널 설정 (Android 전용)
 *
 * @param channel - 채널 설정
 */
export const setupNotificationChannel = async (channel: NotificationChannel): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await Notifications.setNotificationChannelAsync(channel.id, {
      name: channel.name,
      importance: channel.importance,
      sound: channel.sound ?? undefined,
      vibrationPattern: channel.vibrationPattern ?? undefined,
      enableLights: channel.enableLights ?? true,
      lightColor: channel.lightColor ?? '#FF0000',
      enableVibrate: channel.enableVibrate ?? true,
    });
  } catch (error) {
    console.error('Failed to setup notification channel:', error);
    throw error;
  }
};

/**
 * 기본 알림 채널 설정 (Android)
 */
export const setupDefaultChannels = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    // 일반 알림 채널
    await setupNotificationChannel({
      id: 'default',
      name: '일반 알림',
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    // 중요 알림 채널
    await setupNotificationChannel({
      id: 'important',
      name: '중요 알림',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });

    // 작업 알림 채널
    await setupNotificationChannel({
      id: 'work',
      name: '작업 알림',
      importance: Notifications.AndroidImportance.HIGH,
    });

    // 순찰 알림 채널
    await setupNotificationChannel({
      id: 'patrol',
      name: '순찰 알림',
      importance: Notifications.AndroidImportance.HIGH,
    });
  } catch (error) {
    console.error('Failed to setup default channels:', error);
  }
};

/**
 * 알림 핸들러 설정
 *
 * 앱이 foreground에 있을 때 알림을 표시할지 결정
 */
export const setupNotificationHandlers = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

/**
 * 모든 예약된 알림 취소
 */
export const cancelAllScheduledNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel all scheduled notifications:', error);
    throw error;
  }
};

/**
 * 특정 알림 취소
 *
 * @param notificationId - 취소할 알림 ID
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
    throw error;
  }
};

/**
 * 모든 전달된 알림 제거 (알림 센터에서 제거)
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Failed to clear all notifications:', error);
    throw error;
  }
};

/**
 * 배지 카운트 설정 (iOS)
 *
 * @param count - 배지 숫자 (0이면 배지 제거)
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Failed to set badge count:', error);
    throw error;
  }
};

/**
 * 현재 배지 카운트 가져오기 (iOS)
 *
 * @returns 현재 배지 숫자
 */
export const getBadgeCount = async (): Promise<number> => {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Failed to get badge count:', error);
    return 0;
  }
};
