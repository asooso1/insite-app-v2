/**
 * useSessionTimeout 훅 단위 테스트
 *
 * AppState 변경 감지 → 백그라운드 30분 초과 시 로그아웃
 */
import { AppState, AppStateStatus } from 'react-native';
import { renderHook } from '@testing-library/react-native';
import { useSessionTimeout } from '../useSessionTimeout';
import { SESSION_TIMEOUT_MS } from '@/constants/config';

// auth store mock
jest.mock('@/stores/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

const { useAuthStore } = require('@/stores/auth.store');

describe('useSessionTimeout', () => {
  let mockLogout: jest.Mock;
  let appStateCallback: (state: AppStateStatus) => void;
  let mockRemove: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLogout = jest.fn();
    mockRemove = jest.fn();

    // useAuthStore selector mock: (selector) => selector({ logout: mockLogout })
    useAuthStore.mockImplementation((selector: (state: { logout: jest.Mock }) => unknown) =>
      selector({ logout: mockLogout })
    );

    // AppState.addEventListener mock
    jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (_type: string, handler: (state: AppStateStatus) => void) => {
        appStateCallback = handler;
        return { remove: mockRemove } as ReturnType<typeof AppState.addEventListener>;
      }
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('AppState 이벤트 리스너를 등록한다', () => {
    renderHook(() => useSessionTimeout());

    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('언마운트 시 리스너를 제거한다', () => {
    const { unmount } = renderHook(() => useSessionTimeout());

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });

  it('타임아웃 이내 복귀 시 로그아웃하지 않는다', () => {
    renderHook(() => useSessionTimeout());

    // 백그라운드 진입
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValueOnce(now);
    appStateCallback('background');

    // 5분 후 포그라운드 복귀 (30분 미만)
    jest.spyOn(Date, 'now').mockReturnValueOnce(now + 5 * 60 * 1000);
    appStateCallback('active');

    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('타임아웃 초과 복귀 시 로그아웃한다', () => {
    renderHook(() => useSessionTimeout());

    // 백그라운드 진입
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValueOnce(now);
    appStateCallback('background');

    // 31분 후 포그라운드 복귀 (30분 초과)
    jest.spyOn(Date, 'now').mockReturnValueOnce(now + 31 * 60 * 1000);
    appStateCallback('active');

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('정확히 30분에 로그아웃한다 (경계값)', () => {
    renderHook(() => useSessionTimeout());

    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValueOnce(now);
    appStateCallback('background');

    // 정확히 SESSION_TIMEOUT_MS 후
    jest.spyOn(Date, 'now').mockReturnValueOnce(now + SESSION_TIMEOUT_MS);
    appStateCallback('active');

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('inactive 상태도 백그라운드로 처리한다', () => {
    renderHook(() => useSessionTimeout());

    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValueOnce(now);
    appStateCallback('inactive');

    jest.spyOn(Date, 'now').mockReturnValueOnce(now + 31 * 60 * 1000);
    appStateCallback('active');

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('백그라운드 진입 없이 active 이벤트가 오면 무시한다', () => {
    renderHook(() => useSessionTimeout());

    // 백그라운드 없이 바로 active
    appStateCallback('active');

    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('복귀 후 backgroundedAt이 초기화된다 (연속 active 이벤트 무시)', () => {
    renderHook(() => useSessionTimeout());

    const now = Date.now();

    // 백그라운드 → 5분 후 복귀 (정상)
    jest.spyOn(Date, 'now').mockReturnValueOnce(now);
    appStateCallback('background');
    jest.spyOn(Date, 'now').mockReturnValueOnce(now + 5 * 60 * 1000);
    appStateCallback('active');
    expect(mockLogout).not.toHaveBeenCalled();

    // 두 번째 active 이벤트는 무시 (backgroundedAt이 null이므로)
    appStateCallback('active');
    expect(mockLogout).not.toHaveBeenCalled();
  });
});
