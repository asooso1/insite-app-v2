/**
 * 로그인 훅 (v1)
 *
 * v1 API를 사용한 로그인 처리
 * 네비게이션은 login.tsx에서 isAuthenticated 상태를 감지하여 처리
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '@/stores/auth.store';
import { login, guestLogin, LOGIN_RESPONSE_CODES, type LoginResponse } from '@/api/auth';

interface LoginParams {
  userId: string;
  passwd: string;
}

interface GuestLoginParams {
  mobile: string;
  buildingId: string;
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 로그인 응답 처리
   */
  const handleLoginResponse = useCallback(
    (response: LoginResponse): boolean => {
      const { code, message, authToken, data } = response;

      console.log('[useLogin] 로그인 응답 처리:', code);

      switch (code) {
        case LOGIN_RESPONSE_CODES.SUCCESS:
        case 'success':
          if (authToken && data) {
            console.log('[useLogin] 로그인 성공:', data.name);
            const user = {
              id: data.id || data.userId,
              email: data.email || data.userId,
              name: data.name,
              role: data.role,
              siteId: data.siteId,
              siteName: data.siteName,
            };
            setAuth(user, authToken, '');
            return true;
          }
          console.error('[useLogin] 로그인 데이터 누락');
          setError('로그인 데이터가 올바르지 않습니다.');
          return false;

        case LOGIN_RESPONSE_CODES.FAIL:
        case 'fail':
          console.log('[useLogin] 로그인 실패: 인증 오류');
          setError('아이디 또는 비밀번호가 올바르지 않습니다.');
          Alert.alert('로그인 실패', '아이디와 비밀번호를 정확히 입력해주세요.');
          return false;

        case LOGIN_RESPONSE_CODES.MOBILE_DUPLICATE:
          console.log('[useLogin] 로그인 실패: 휴대폰 중복');
          setError(message || '휴대폰 번호가 중복됩니다.');
          Alert.alert('로그인 실패', message || '휴대폰 번호가 중복됩니다.');
          return false;

        default:
          console.log('[useLogin] 로그인 실패: 알 수 없는 오류', code);
          setError(message || '로그인에 실패했습니다.');
          return false;
      }
    },
    [setAuth]
  );

  /**
   * 일반 로그인
   */
  const performLogin = useCallback(
    async (params: LoginParams) => {
      console.log('[useLogin] 로그인 시작:', params.userId);
      setIsLoading(true);
      setError(null);

      try {
        const response = await login({
          userId: params.userId,
          passwd: params.passwd,
        });

        handleLoginResponse(response);
      } catch (err) {
        console.error('[useLogin] 로그인 API 오류:', err);
        const errorMessage = '아이디와 비밀번호를 정확히 입력해주세요.';
        setError(errorMessage);
        Alert.alert('로그인 실패', errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [handleLoginResponse]
  );

  /**
   * 게스트 로그인
   */
  const performGuestLogin = useCallback(
    async (params: GuestLoginParams) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await guestLogin({
          mobile: params.mobile,
          buildingId: params.buildingId,
        });

        handleLoginResponse(response);
      } catch (err) {
        console.error('[Auth] 게스트 로그인 오류:', err);
        const errorMessage = '게스트 로그인에 실패했습니다.';
        setError(errorMessage);
        Alert.alert('로그인 실패', errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [handleLoginResponse]
  );

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    login: performLogin,
    guestLogin: performGuestLogin,
    clearError,
  };
}

export default useLogin;
