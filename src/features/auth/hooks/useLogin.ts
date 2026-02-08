/**
 * 로그인 훅 (v1)
 *
 * v1 API를 사용한 로그인 처리
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { login, guestLogin, LOGIN_RESPONSE_CODES, type LoginResponse } from '@/api/auth';

interface UseLoginOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface LoginParams {
  userId: string;
  passwd: string;
}

interface GuestLoginParams {
  mobile: string;
  buildingId: string;
}

export function useLogin(options: UseLoginOptions = {}) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 로그인 응답 처리
   */
  const handleLoginResponse = useCallback(
    (response: LoginResponse): boolean => {
      const { code, message, authToken, data } = response;

      switch (code) {
        case LOGIN_RESPONSE_CODES.SUCCESS:
        case 'success':
          if (authToken && data) {
            const user = {
              id: data.id || data.userId,
              email: data.email || data.userId,
              name: data.name,
              role: data.role,
              siteId: data.siteId,
              siteName: data.siteName,
            };
            setAuth(user, authToken, '');
            options.onSuccess?.();
            router.replace('/(main)/(tabs)/home');
            return true;
          }
          setError('로그인 데이터가 올바르지 않습니다.');
          return false;

        case LOGIN_RESPONSE_CODES.FAIL:
        case 'fail':
          setError('아이디 또는 비밀번호가 올바르지 않습니다.');
          Alert.alert('로그인 실패', '아이디와 비밀번호를 정확히 입력해주세요.');
          return false;

        case LOGIN_RESPONSE_CODES.MOBILE_DUPLICATE:
          setError(message || '휴대폰 번호가 중복됩니다.');
          Alert.alert('로그인 실패', message || '휴대폰 번호가 중복됩니다.');
          return false;

        default:
          setError(message || '로그인에 실패했습니다.');
          return false;
      }
    },
    [router, setAuth, options]
  );

  /**
   * 일반 로그인
   */
  const performLogin = useCallback(
    async (params: LoginParams) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await login({
          userId: params.userId,
          passwd: params.passwd,
        });

        handleLoginResponse(response);
      } catch (err) {
        console.error('[Auth] 로그인 오류:', err);
        const errorMessage = '아이디와 비밀번호를 정확히 입력해주세요.';
        setError(errorMessage);
        options.onError?.(err instanceof Error ? err : new Error(errorMessage));
        Alert.alert('로그인 실패', errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [handleLoginResponse, options]
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
        options.onError?.(err instanceof Error ? err : new Error(errorMessage));
        Alert.alert('로그인 실패', errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [handleLoginResponse, options]
  );

  return {
    isLoading,
    error,
    login: performLogin,
    guestLogin: performGuestLogin,
    clearError: () => setError(null),
  };
}

export default useLogin;
