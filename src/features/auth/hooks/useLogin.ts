/**
 * 로그인 훅 (v1)
 *
 * v1 API를 사용한 로그인 처리
 * 로그인 성공 후 myInfoView 호출하여 사용자 상세 정보 설정
 * 네비게이션은 login.tsx에서 isAuthenticated 상태를 감지하여 처리
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '@/stores/auth.store';
import {
  login,
  guestLogin,
  myInfoView,
  LOGIN_RESPONSE_CODES,
  type LoginResponse,
  type MyInfoAccount,
} from '@/api/auth';

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
  const setUser = useAuthStore((state) => state.setUser);
  const setAttendanceFlag = useAuthStore((state) => state.setAttendanceFlag);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * myInfoView 호출하여 사용자 상세 정보 설정
   */
  const fetchMyInfo = useCallback(
    async (buildingId?: string) => {
      try {
        console.log('[useLogin] myInfoView 호출');
        const response = await myInfoView(buildingId);

        if (response.code === 'success' && response.data) {
          const account = response.data.account;
          const attendanceFlag = response.data.attendanceFlag;

          // 사용자 정보 업데이트
          const user = mapAccountToUser(account);
          setUser(user);

          // 출퇴근 플래그 업데이트
          setAttendanceFlag(attendanceFlag);

          console.log('[useLogin] myInfoView 성공:', {
            userId: user.userId,
            roleId: user.roleId,
            buildingCnt: user.buildingCnt,
          });

          return { account, attendanceFlag };
        } else {
          console.error('[useLogin] myInfoView 실패:', response.message);
          return null;
        }
      } catch (err) {
        console.error('[useLogin] myInfoView 오류:', err);
        return null;
      }
    },
    [setUser, setAttendanceFlag]
  );

  /**
   * 로그인 응답 처리
   */
  const handleLoginResponse = useCallback(
    async (response: LoginResponse): Promise<boolean> => {
      const { code, message, authToken, data } = response;

      console.log('[useLogin] 로그인 응답 처리:', code);

      switch (code) {
        case LOGIN_RESPONSE_CODES.SUCCESS:
        case 'success':
          if (authToken && data) {
            console.log('[useLogin] 로그인 성공 - 기본 정보:', data.name);

            // 기본 인증 정보 설정 (임시 - myInfoView에서 업데이트됨)
            const tempUser = {
              id: data.id || data.userId,
              userId: data.userId,
              email: data.email || data.userId,
              name: data.name,
              role: data.role,
              roleId: 0, // myInfoView에서 업데이트
              siteId: data.siteId,
              siteName: data.siteName,
              buildingCnt: 0,
              buildingAccountDTO: [],
            };
            setAuth(tempUser, authToken, '');

            // myInfoView 호출하여 상세 정보 설정
            const myInfoResult = await fetchMyInfo();

            if (!myInfoResult) {
              console.warn('[useLogin] myInfoView 실패 - 기본 정보로 진행');
            }

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
    [setAuth, fetchMyInfo]
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

        await handleLoginResponse(response);
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

        const success = await handleLoginResponse(response);

        // 게스트 로그인 성공 시 건물 ID로 myInfoView 재호출
        if (success) {
          await fetchMyInfo(params.buildingId);
        }
      } catch (err) {
        console.error('[Auth] 게스트 로그인 오류:', err);
        const errorMessage = '게스트 로그인에 실패했습니다.';
        setError(errorMessage);
        Alert.alert('로그인 실패', errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [handleLoginResponse, fetchMyInfo]
  );

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => setError(null), []);

  /**
   * 내 정보 새로고침 (외부에서 호출 가능)
   */
  const refreshMyInfo = useCallback(
    async (buildingId?: string) => {
      return await fetchMyInfo(buildingId);
    },
    [fetchMyInfo]
  );

  return {
    isLoading,
    error,
    login: performLogin,
    guestLogin: performGuestLogin,
    refreshMyInfo,
    clearError,
  };
}

/**
 * MyInfoAccount를 User로 매핑
 */
function mapAccountToUser(account: MyInfoAccount) {
  return {
    id: account.id || account.userId,
    userId: account.userId,
    email: account.email,
    name: account.name,
    role: account.roleName,
    roleId: account.roleId,
    roleName: account.roleName,
    type: account.type,
    companyId: account.companyId,
    companyName: account.companyName,
    siteId: account.siteId,
    siteName: account.siteName,
    buildingCnt: account.buildingCnt,
    buildingAccountDTO: account.buildingAccountDTO || [],
    selectedBuildingAccountDTO: account.selectedBuildingAccountDTO,
  };
}

export default useLogin;
