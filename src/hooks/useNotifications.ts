/**
 * Notifications Hook
 *
 * 푸시 알림 권한, 토큰 관리 및 알림 이벤트 핸들링을 제공하는 React Hook
 * 앱 시작 시 자동으로 알림 설정을 초기화합니다.
 */
import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import {
  requestNotificationPermissions,
  getExpoPushToken,
  setupDefaultChannels,
  setupNotificationHandlers,
  type NotificationPermissionStatus,
} from '@/utils/notifications';

/**
 * 알림 훅 반환 타입
 */
export interface UseNotificationsReturn {
  /** 권한 상태 */
  permissionStatus: NotificationPermissionStatus | null;
  /** Expo Push Token */
  expoPushToken: string | null;
  /** 마지막 수신된 알림 */
  lastNotification: Notifications.Notification | null;
  /** 권한 요청 함수 */
  requestPermissions: () => Promise<NotificationPermissionStatus>;
  /** 로딩 상태 */
  isLoading: boolean;
}

/**
 * 알림 설정 옵션
 */
export interface UseNotificationsOptions {
  /** Expo Project ID (app.json의 extra.eas.projectId) */
  projectId: string;
  /** 알림 수신 핸들러 */
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  /** 알림 클릭 핸들러 */
  onNotificationClick?: (response: Notifications.NotificationResponse) => void;
}

/**
 * 알림 데이터에서 딥링크 경로 추출
 *
 * @param data - 알림 데이터
 * @returns 라우팅 경로 또는 null
 */
function extractDeepLinkPath(data: Record<string, unknown>): string | null {
  // 딥링크 URL 추출
  const url = data.url;
  if (typeof url === 'string') {
    return url;
  }

  // 타입별 경로 생성
  const type = data.type;
  const id = data.id;

  if (typeof type === 'string' && typeof id === 'string') {
    switch (type) {
      case 'work':
        return `/(main)/work/${id}`;
      case 'patrol':
        return `/(main)/patrol/${id}`;
      case 'alarm':
        return '/(main)/dashboard/alarm';
      default:
        return null;
    }
  }

  return null;
}

/**
 * 알림 관리 훅
 *
 * @param options - 알림 옵션
 * @returns 알림 상태 및 함수
 *
 * @example
 * ```tsx
 * const { permissionStatus, expoPushToken, requestPermissions } = useNotifications({
 *   projectId: 'your-project-id',
 *   onNotificationClick: (response) => {
 *     console.log('알림 클릭:', response);
 *   },
 * });
 * ```
 */
export function useNotifications(options: UseNotificationsOptions): UseNotificationsReturn {
  const { projectId, onNotificationReceived, onNotificationClick } = options;

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | null>(
    null
  );
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 구독 참조 (클린업용)
  const notificationReceivedListener = useRef<Notifications.EventSubscription | null>(null);
  const notificationResponseListener = useRef<Notifications.EventSubscription | null>(null);

  /**
   * 권한 요청 함수
   */
  const requestPermissions = async (): Promise<NotificationPermissionStatus> => {
    const status = await requestNotificationPermissions();
    setPermissionStatus(status);
    return status;
  };

  /**
   * 초기화: 알림 핸들러 설정 및 채널 생성
   */
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        // 1. 알림 핸들러 설정 (foreground 알림 표시)
        setupNotificationHandlers();

        // 2. Android 알림 채널 설정
        await setupDefaultChannels();

        // 3. 권한 상태 확인
        const status = await requestNotificationPermissions();
        if (isMounted) {
          setPermissionStatus(status);
        }

        // 4. Push Token 발급 (권한이 있는 경우)
        if (status.status === 'granted') {
          const token = await getExpoPushToken(projectId);
          if (isMounted) {
            setExpoPushToken(token);
          }
        }
      } catch (error) {
        console.error('[useNotifications] 초기화 실패:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  /**
   * 알림 수신 리스너 등록
   */
  useEffect(() => {
    // 알림 수신 리스너
    notificationReceivedListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[useNotifications] 알림 수신:', notification);
        setLastNotification(notification);
        onNotificationReceived?.(notification);
      }
    );

    // 알림 클릭 리스너
    notificationResponseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('[useNotifications] 알림 응답:', response);

        // 커스텀 핸들러 호출
        onNotificationClick?.(response);

        // 딥링크 처리
        const data = response.notification.request.content.data as Record<string, unknown>;
        const path = extractDeepLinkPath(data);

        if (path) {
          console.log('[useNotifications] 딥링크 라우팅:', path);
          router.push(path as never);
        }
      }
    );

    // 클린업
    return () => {
      if (notificationReceivedListener.current) {
        notificationReceivedListener.current.remove();
      }
      if (notificationResponseListener.current) {
        notificationResponseListener.current.remove();
      }
    };
  }, [onNotificationReceived, onNotificationClick]);

  /**
   * 권한 변경 시 토큰 재발급
   */
  useEffect(() => {
    let isMounted = true;

    const updateToken = async () => {
      if (permissionStatus?.status === 'granted' && !expoPushToken) {
        const token = await getExpoPushToken(projectId);
        if (isMounted) {
          setExpoPushToken(token);
        }
      }
    };

    updateToken();

    return () => {
      isMounted = false;
    };
  }, [permissionStatus, expoPushToken, projectId]);

  return {
    permissionStatus,
    expoPushToken,
    lastNotification,
    requestPermissions,
    isLoading,
  };
}

export default useNotifications;
