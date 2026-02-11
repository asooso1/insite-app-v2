/**
 * 딥링크 처리 유틸리티
 *
 * Insite 앱의 딥링크 URL 파싱 및 라우팅 처리를 담당합니다.
 * - 지원 스키마: 'insite://'
 * - expo-linking ~8.0.11 기반
 * - expo-router 타입 호환
 */

import * as Linking from 'expo-linking';
import type { Href } from 'expo-router';

/**
 * 지원되는 딥링크 경로 타입
 */
export type DeepLinkRoute =
  | { type: 'work'; id: string } // 작업 상세
  | { type: 'patrol'; id: string } // 순찰 상세
  | { type: 'dashboard-alarm' } // 알람 대시보드
  | { type: 'home' } // 홈 화면
  | { type: 'unknown'; path: string }; // 알 수 없는 경로

/**
 * 파싱된 딥링크 정보
 */
export interface ParsedDeepLink {
  scheme: string | null;
  hostname: string | null;
  path: string | null;
  queryParams: Record<string, string>;
  route: DeepLinkRoute;
}

/**
 * 알림 데이터 인터페이스 (expo-notifications 호환)
 */
export interface NotificationData {
  deepLink?: string;
  url?: string;
  [key: string]: unknown;
}

/**
 * 딥링크 URL을 파싱하여 구조화된 정보를 반환합니다.
 *
 * @param url - 파싱할 딥링크 URL (예: 'insite://work/123')
 * @returns 파싱된 딥링크 정보
 *
 * @example
 * ```ts
 * const parsed = parseDeepLink('insite://work/123?priority=high');
 * // {
 * //   scheme: 'insite',
 * //   hostname: null,
 * //   path: '/work/123',
 * //   queryParams: { priority: 'high' },
 * //   route: { type: 'work', id: '123' }
 * // }
 * ```
 */
export function parseDeepLink(url: string): ParsedDeepLink {
  try {
    const parsed = Linking.parse(url);

    const { scheme, hostname, path, queryParams } = parsed;

    // path에서 route 정보 추출
    const route = extractRouteFromPath(path || '');

    // QueryParams를 Record<string, string>으로 변환
    const normalizedParams: Record<string, string> = {};
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (typeof value === 'string') {
          normalizedParams[key] = value;
        } else if (Array.isArray(value)) {
          normalizedParams[key] = value.join(',');
        } else if (value !== undefined) {
          normalizedParams[key] = String(value);
        }
      });
    }

    return {
      scheme: scheme || null,
      hostname: hostname || null,
      path: path || null,
      queryParams: normalizedParams,
      route,
    };
  } catch (error) {
    // 파싱 실패 시 unknown 라우트 반환
    return {
      scheme: null,
      hostname: null,
      path: null,
      queryParams: {},
      route: { type: 'unknown', path: url },
    };
  }
}

/**
 * 딥링크에서 expo-router 호환 라우트를 추출합니다.
 *
 * @param url - 딥링크 URL
 * @returns expo-router Href 객체 또는 null
 *
 * @example
 * ```ts
 * const href = getRouteFromDeepLink('insite://work/123');
 * // '/(main)/work/123'
 * ```
 */
export function getRouteFromDeepLink(url: string): Href | null {
  const { route } = parseDeepLink(url);

  switch (route.type) {
    case 'work':
      return `/(main)/work/${route.id}` as Href;

    case 'patrol':
      return `/(main)/patrol/${route.id}` as Href;

    case 'dashboard-alarm':
      return '/(main)/dashboard/alarm' as Href;

    case 'home':
      return '/(main)/(tabs)/home' as Href;

    case 'unknown':
    default:
      return null;
  }
}

/**
 * 알림 데이터에서 딥링크를 추출합니다.
 *
 * @param data - 알림 데이터 객체 (expo-notifications의 notification.request.content.data)
 * @returns 추출된 딥링크 URL 또는 null
 *
 * @example
 * ```ts
 * const deepLink = extractDeepLinkFromNotification({
 *   deepLink: 'insite://work/123',
 *   title: '새 작업 배정'
 * });
 * // 'insite://work/123'
 * ```
 */
export function extractDeepLinkFromNotification(
  data: NotificationData | null | undefined
): string | null {
  if (!data) {
    return null;
  }

  // 'deepLink' 또는 'url' 필드 확인
  return data.deepLink || data.url || null;
}

/**
 * 내부 함수: path에서 DeepLinkRoute를 추출합니다.
 *
 * @param path - URL path (예: '/work/123')
 * @returns DeepLinkRoute 객체
 */
function extractRouteFromPath(path: string): DeepLinkRoute {
  // path가 비어있거나 '/'만 있으면 home
  if (!path || path === '/') {
    return { type: 'home' };
  }

  // 선행 슬래시 제거
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // path를 segments로 분리 (쿼리스트링 제외)
  const pathParts = cleanPath.split('?');
  const pathWithoutQuery = pathParts[0] || '';
  const segments = pathWithoutQuery.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { type: 'home' };
  }

  const [firstSegment, secondSegment] = segments;

  // work/[id]
  if (firstSegment === 'work' && secondSegment) {
    return { type: 'work', id: secondSegment };
  }

  // patrol/[id]
  if (firstSegment === 'patrol' && secondSegment) {
    return { type: 'patrol', id: secondSegment };
  }

  // dashboard/alarm
  if (firstSegment === 'dashboard' && secondSegment === 'alarm') {
    return { type: 'dashboard-alarm' };
  }

  // home
  if (firstSegment === 'home') {
    return { type: 'home' };
  }

  // 알 수 없는 경로
  return { type: 'unknown', path: cleanPath };
}

/**
 * 현재 앱에서 딥링크를 열 수 있는지 확인합니다.
 *
 * @param url - 확인할 URL
 * @returns 열 수 있으면 true
 */
export async function canOpenDeepLink(url: string): Promise<boolean> {
  try {
    return await Linking.canOpenURL(url);
  } catch (error) {
    return false;
  }
}

/**
 * 딥링크 URL을 생성합니다.
 *
 * @param route - 라우트 타입
 * @param params - 추가 파라미터
 * @returns 생성된 딥링크 URL
 *
 * @example
 * ```ts
 * const url = createDeepLink({ type: 'work', id: '123' });
 * // 'insite://work/123'
 * ```
 */
export function createDeepLink(route: DeepLinkRoute, params?: Record<string, string>): string {
  const baseUrl = 'insite://';

  let path = '';
  switch (route.type) {
    case 'work':
      path = `work/${route.id}`;
      break;
    case 'patrol':
      path = `patrol/${route.id}`;
      break;
    case 'dashboard-alarm':
      path = 'dashboard/alarm';
      break;
    case 'home':
      path = 'home';
      break;
    case 'unknown':
      path = route.path;
      break;
  }

  // 쿼리 파라미터 추가
  const queryString = params
    ? '?' +
      Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
    : '';

  return `${baseUrl}${path}${queryString}`;
}
