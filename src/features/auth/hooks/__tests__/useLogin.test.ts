/**
 * useLogin 훅 단위 테스트
 */
import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

// API mock
jest.mock('@/api/auth', () => ({
  login: jest.fn(),
  guestLogin: jest.fn(),
  myInfoView: jest.fn(),
  LOGIN_RESPONSE_CODES: {
    SUCCESS: 'success',
    FAIL: 'fail',
    MOBILE_DUPLICATE: 'MOBILE_DUPLICATE',
  },
}));

// auth store mock
jest.mock('@/stores/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

// Alert mock
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const { login, guestLogin, myInfoView } = require('@/api/auth');
const { useAuthStore } = require('@/stores/auth.store');

const mockSetAuth = jest.fn();
const mockSetUser = jest.fn();
const mockSetAttendanceFlag = jest.fn();

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // useAuthStore selector mock
    useAuthStore.mockImplementation((selector: (state: Record<string, jest.Mock>) => unknown) =>
      selector({
        setAuth: mockSetAuth,
        setUser: mockSetUser,
        setAttendanceFlag: mockSetAttendanceFlag,
      })
    );
  });

  // lazy import (mock 적용 후)
  function getUseLogin() {
    return require('../useLogin').useLogin;
  }

  describe('일반 로그인', () => {
    it('로그인 성공 시 인증 정보를 설정한다', async () => {
      login.mockResolvedValue({
        code: 'success',
        authToken: 'test-token',
        data: {
          id: 'u1',
          userId: 'testuser',
          name: '테스트유저',
          role: '관리자',
        },
      });

      myInfoView.mockResolvedValue({
        code: 'success',
        data: {
          account: {
            userId: 'testuser',
            name: '테스트유저',
            roleId: 10,
            buildingCnt: 1,
            buildingAccountDTO: [{ buildingId: 'b1', buildingName: '테스트빌딩' }],
          },
          attendanceFlag: { login: true, logOut: false },
        },
      });

      const useLogin = getUseLogin();
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.login({ userId: 'testuser', passwd: 'pass123' });
      });

      expect(login).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'testuser', passwd: 'pass123' })
      );
      expect(mockSetAuth).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalled();
      expect(mockSetAttendanceFlag).toHaveBeenCalledWith({ login: true, logOut: false });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('로그인 실패 시 에러를 설정한다', async () => {
      login.mockResolvedValue({
        code: 'fail',
        message: '인증 실패',
      });

      const useLogin = getUseLogin();
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.login({ userId: 'wrong', passwd: 'wrong' });
      });

      expect(result.current.error).toBe('아이디 또는 비밀번호가 올바르지 않습니다.');
      expect(Alert.alert).toHaveBeenCalledWith('로그인 실패', expect.any(String));
      expect(mockSetAuth).not.toHaveBeenCalled();
    });

    it('MOBILE_DUPLICATE 코드 시 서버 메시지를 표시한다', async () => {
      login.mockResolvedValue({
        code: 'MOBILE_DUPLICATE',
        message: '이미 등록된 휴대폰입니다.',
      });

      const useLogin = getUseLogin();
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.login({ userId: 'user', passwd: 'pass' });
      });

      expect(result.current.error).toBe('이미 등록된 휴대폰입니다.');
      expect(Alert.alert).toHaveBeenCalledWith('로그인 실패', '이미 등록된 휴대폰입니다.');
    });

    it('MOBILE_DUPLICATE 코드에 message가 없으면 fallback 메시지를 사용한다', async () => {
      login.mockResolvedValue({
        code: 'MOBILE_DUPLICATE',
      });

      const useLogin = getUseLogin();
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.login({ userId: 'user', passwd: 'pass' });
      });

      expect(result.current.error).toBe('휴대폰 번호가 중복됩니다.');
      expect(Alert.alert).toHaveBeenCalledWith('로그인 실패', '휴대폰 번호가 중복됩니다.');
    });

    it('API 에러 발생 시 에러를 설정한다', async () => {
      login.mockRejectedValue(new Error('Network Error'));

      const useLogin = getUseLogin();
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.login({ userId: 'user', passwd: 'pass' });
      });

      expect(result.current.error).toBe('아이디와 비밀번호를 정확히 입력해주세요.');
      expect(result.current.isLoading).toBe(false);
    });

    it('로그인 중 isLoading이 true이다', async () => {
      let resolveLogin: (value: unknown) => void;
      login.mockReturnValue(
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
      );

      const useLogin = getUseLogin();
      const { result } = renderHook(() => useLogin());

      // 로그인 시작 (resolve 전)
      let loginPromise: Promise<void>;
      act(() => {
        loginPromise = result.current.login({ userId: 'user', passwd: 'pass' });
      });

      expect(result.current.isLoading).toBe(true);

      // 로그인 완료
      await act(async () => {
        resolveLogin!({ code: 'fail' });
        await loginPromise!;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('게스트 로그인', () => {
    it('게스트 로그인 성공 시 인증 정보를 설정한다', async () => {
      guestLogin.mockResolvedValue({
        code: 'success',
        authToken: 'guest-token',
        data: {
          id: 'g1',
          userId: 'guest',
          name: '방문자',
          role: '민원인',
        },
      });

      myInfoView.mockResolvedValue({
        code: 'success',
        data: {
          account: {
            userId: 'guest',
            name: '방문자',
            roleId: 17,
            buildingCnt: 1,
            buildingAccountDTO: [{ buildingId: 'b2', buildingName: '방문빌딩' }],
          },
          attendanceFlag: { login: false, logOut: false },
        },
      });

      const useLogin = getUseLogin();
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.guestLogin({ mobile: '01012345678', buildingId: 'b2' });
      });

      expect(guestLogin).toHaveBeenCalledWith(
        expect.objectContaining({ mobile: '01012345678', buildingId: 'b2' })
      );
      expect(mockSetAuth).toHaveBeenCalled();
      // fetchMyInfo 2회 호출: handleLoginResponse 내부 1회 + performGuestLogin에서 buildingId 포함 재호출 1회
      expect(myInfoView).toHaveBeenCalledTimes(2);
    });

    it('게스트 로그인 API 에러 시 에러를 설정한다', async () => {
      guestLogin.mockRejectedValue(new Error('Server Error'));

      const useLogin = getUseLogin();
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.guestLogin({ mobile: '01012345678', buildingId: 'b2' });
      });

      expect(result.current.error).toBe('게스트 로그인에 실패했습니다.');
    });
  });

  describe('clearError', () => {
    it('에러를 초기화한다', async () => {
      login.mockResolvedValue({ code: 'fail' });

      const useLogin = getUseLogin();
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.login({ userId: 'user', passwd: 'pass' });
      });
      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('myInfoView 실패 처리', () => {
    it('myInfoView 실패해도 로그인은 유지된다', async () => {
      login.mockResolvedValue({
        code: 'success',
        authToken: 'token',
        data: { id: 'u1', userId: 'user', name: '유저', role: '관리자' },
      });

      myInfoView.mockResolvedValue({
        code: 'fail',
        message: '정보 조회 실패',
      });

      const useLogin = getUseLogin();
      const { result } = renderHook(() => useLogin());

      await act(async () => {
        await result.current.login({ userId: 'user', passwd: 'pass' });
      });

      // setAuth는 호출됨 (기본 정보)
      expect(mockSetAuth).toHaveBeenCalled();
      // setUser는 호출되지 않음 (myInfoView 실패)
      expect(mockSetUser).not.toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });
  });
});
