/**
 * 딥링크 유틸리티 단위 테스트
 */
import * as Linking from 'expo-linking';
import {
  parseDeepLink,
  getRouteFromDeepLink,
  extractDeepLinkFromNotification,
  createDeepLink,
} from '../deeplink';

const mockParse = Linking.parse as jest.Mock;

describe('deeplink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseDeepLink', () => {
    it('작업 딥링크를 올바르게 파싱한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: 'work/123',
        queryParams: {},
      });

      const result = parseDeepLink('insite://work/123');

      expect(result.route).toEqual({ type: 'work', id: '123' });
      expect(result.scheme).toBe('insite');
      expect(result.path).toBe('work/123');
    });

    it('순찰 딥링크를 올바르게 파싱한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: 'patrol/456',
        queryParams: {},
      });

      const result = parseDeepLink('insite://patrol/456');

      expect(result.route).toEqual({ type: 'patrol', id: '456' });
    });

    it('대시보드 알람 딥링크를 파싱한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: 'dashboard/alarm',
        queryParams: {},
      });

      const result = parseDeepLink('insite://dashboard/alarm');

      expect(result.route).toEqual({ type: 'dashboard-alarm' });
    });

    it('홈 딥링크를 파싱한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: 'home',
        queryParams: {},
      });

      const result = parseDeepLink('insite://home');

      expect(result.route).toEqual({ type: 'home' });
    });

    it('빈 path는 home으로 처리한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: '',
        queryParams: {},
      });

      const result = parseDeepLink('insite://');

      expect(result.route).toEqual({ type: 'home' });
    });

    it('알 수 없는 경로는 unknown으로 처리한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: 'settings/profile',
        queryParams: {},
      });

      const result = parseDeepLink('insite://settings/profile');

      expect(result.route).toEqual({ type: 'unknown', path: 'settings/profile' });
    });

    it('쿼리 파라미터를 올바르게 파싱한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: 'work/123',
        queryParams: { priority: 'high', status: 'pending' },
      });

      const result = parseDeepLink('insite://work/123?priority=high&status=pending');

      expect(result.queryParams).toEqual({ priority: 'high', status: 'pending' });
    });

    it('배열 쿼리 파라미터를 쉼표로 조인한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: 'work/123',
        queryParams: { tags: ['a', 'b', 'c'] },
      });

      const result = parseDeepLink('insite://work/123?tags=a,b,c');

      expect(result.queryParams.tags).toBe('a,b,c');
    });

    it('파싱 실패 시 unknown 라우트를 반환한다', () => {
      mockParse.mockImplementation(() => {
        throw new Error('Invalid URL');
      });

      const result = parseDeepLink('invalid-url');

      expect(result.route).toEqual({ type: 'unknown', path: 'invalid-url' });
      expect(result.scheme).toBeNull();
      expect(result.path).toBeNull();
    });

    it('work 경로에 id가 없으면 unknown으로 처리한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: 'work',
        queryParams: {},
      });

      const result = parseDeepLink('insite://work');

      expect(result.route).toEqual({ type: 'unknown', path: 'work' });
    });
  });

  describe('getRouteFromDeepLink', () => {
    it('작업 딥링크에서 라우트를 추출한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: 'work/123',
        queryParams: {},
      });

      const href = getRouteFromDeepLink('insite://work/123');

      expect(href).toBe('/(main)/work/123');
    });

    it('순찰 딥링크에서 라우트를 추출한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: 'patrol/456',
        queryParams: {},
      });

      const href = getRouteFromDeepLink('insite://patrol/456');

      expect(href).toBe('/(main)/patrol/456');
    });

    it('대시보드 알람 라우트를 추출한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: 'dashboard/alarm',
        queryParams: {},
      });

      const href = getRouteFromDeepLink('insite://dashboard/alarm');

      expect(href).toBe('/(main)/dashboard/alarm');
    });

    it('홈 라우트를 추출한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: 'home',
        queryParams: {},
      });

      const href = getRouteFromDeepLink('insite://home');

      expect(href).toBe('/(main)/(tabs)/home');
    });

    it('알 수 없는 경로는 null을 반환한다', () => {
      mockParse.mockReturnValue({
        scheme: 'insite',
        hostname: null,
        path: 'unknown/path',
        queryParams: {},
      });

      const href = getRouteFromDeepLink('insite://unknown/path');

      expect(href).toBeNull();
    });
  });

  describe('extractDeepLinkFromNotification', () => {
    it('deepLink 필드에서 딥링크를 추출한다', () => {
      const result = extractDeepLinkFromNotification({
        deepLink: 'insite://work/123',
        title: '새 작업',
      });

      expect(result).toBe('insite://work/123');
    });

    it('url 필드에서 딥링크를 추출한다', () => {
      const result = extractDeepLinkFromNotification({
        url: 'insite://patrol/456',
      });

      expect(result).toBe('insite://patrol/456');
    });

    it('deepLink 필드가 url 필드보다 우선한다', () => {
      const result = extractDeepLinkFromNotification({
        deepLink: 'insite://work/123',
        url: 'insite://patrol/456',
      });

      expect(result).toBe('insite://work/123');
    });

    it('null 데이터는 null을 반환한다', () => {
      expect(extractDeepLinkFromNotification(null)).toBeNull();
    });

    it('undefined 데이터는 null을 반환한다', () => {
      expect(extractDeepLinkFromNotification(undefined)).toBeNull();
    });

    it('deepLink/url 없는 데이터는 null을 반환한다', () => {
      const result = extractDeepLinkFromNotification({ title: '알림' });

      expect(result).toBeNull();
    });
  });

  describe('createDeepLink', () => {
    it('작업 딥링크를 생성한다', () => {
      const url = createDeepLink({ type: 'work', id: '123' });

      expect(url).toBe('insite://work/123');
    });

    it('순찰 딥링크를 생성한다', () => {
      const url = createDeepLink({ type: 'patrol', id: '456' });

      expect(url).toBe('insite://patrol/456');
    });

    it('대시보드 알람 딥링크를 생성한다', () => {
      const url = createDeepLink({ type: 'dashboard-alarm' });

      expect(url).toBe('insite://dashboard/alarm');
    });

    it('홈 딥링크를 생성한다', () => {
      const url = createDeepLink({ type: 'home' });

      expect(url).toBe('insite://home');
    });

    it('unknown 타입은 path를 사용한다', () => {
      const url = createDeepLink({ type: 'unknown', path: 'custom/path' });

      expect(url).toBe('insite://custom/path');
    });

    it('쿼리 파라미터를 포함한 딥링크를 생성한다', () => {
      const url = createDeepLink({ type: 'work', id: '123' }, { priority: 'high' });

      expect(url).toBe('insite://work/123?priority=high');
    });

    it('특수 문자가 포함된 쿼리 파라미터를 인코딩한다', () => {
      const url = createDeepLink({ type: 'work', id: '123' }, { name: '테스트 값' });

      expect(url).toContain('name=');
      expect(url).toContain(encodeURIComponent('테스트 값'));
    });

    it('여러 쿼리 파라미터를 &로 연결한다', () => {
      const url = createDeepLink({ type: 'work', id: '1' }, { a: '1', b: '2' });

      expect(url).toContain('a=1');
      expect(url).toContain('b=2');
      expect(url).toContain('&');
    });
  });
});
