/**
 * 게스트 로그인 훅
 *
 * NFC 스캔 후 게스트 토큰 처리 로직
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth.store';
import { guestLogin, myInfoView, LOGIN_RESPONSE_CODES, type LoginResponse } from '@/api/auth';

interface NfcScanResult {
  tagId: string;
  buildingId?: string;
}

export function useGuestLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const setAttendanceFlag = useAuthStore((state) => state.setAttendanceFlag);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 게스트 로그인 응답 처리
   */
  const handleGuestLoginResponse = useCallback(
    (response: LoginResponse, buildingId: string): boolean => {
      const { code, message, authToken, data } = response;

      switch (code) {
        case LOGIN_RESPONSE_CODES.SUCCESS:
        case 'success':
          if (authToken && data) {
            // 게스트 사용자 정보 저장 (임시 - myInfoView에서 업데이트됨)
            const user = {
              id: data.id || data.userId,
              userId: data.userId,
              email: data.email || data.mobile || '',
              name: data.name || '게스트',
              role: data.role || 'guest',
              roleId: 21, // 일일계정 (게스트) - myInfoView에서 업데이트됨
              siteId: data.siteId,
              siteName: data.siteName,
              buildingCnt: 1,
              buildingAccountDTO: buildingId
                ? [{ buildingId, buildingName: '' }]
                : [],
            };

            setAuth(user, authToken, '');
            console.log('[GuestLogin] 게스트 로그인 성공:', {
              userId: user.userId,
              name: user.name,
              role: user.role,
            });

            return true;
          }

          setError('게스트 로그인 데이터가 올바르지 않습니다.');
          return false;

        case LOGIN_RESPONSE_CODES.FAIL:
        case 'fail':
          setError(message || '게스트 로그인에 실패했습니다.');
          Alert.alert(
            '로그인 실패',
            message || '유효하지 않은 NFC 태그입니다.\n다시 시도해주세요.',
            [{ text: '확인' }]
          );
          return false;

        case LOGIN_RESPONSE_CODES.MOBILE_DUPLICATE:
          setError(message || '이미 등록된 휴대폰 번호입니다.');
          Alert.alert('로그인 실패', message || '이미 등록된 휴대폰 번호입니다.', [
            { text: '확인' },
          ]);
          return false;

        default:
          setError(message || '게스트 로그인에 실패했습니다.');
          Alert.alert('로그인 실패', message || '알 수 없는 오류가 발생했습니다.', [
            { text: '확인' },
          ]);
          return false;
      }
    },
    [setAuth]
  );

  /**
   * myInfoView 호출하여 사용자 상세 정보 설정
   */
  const fetchMyInfo = useCallback(
    async (buildingId: string) => {
      try {
        console.log('[GuestLogin] myInfoView 호출');
        const response = await myInfoView(buildingId);

        if (response.code === 'success' && response.data) {
          const account = response.data.account;
          const attendanceFlag = response.data.attendanceFlag;

          // 사용자 정보 업데이트
          const user = {
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
            selectedBuildingAccountDTO: {
              buildingId,
              buildingName: account.buildingAccountDTO?.[0]?.buildingName || '',
            },
          };

          setUser(user);
          setAttendanceFlag(attendanceFlag);

          console.log('[GuestLogin] myInfoView 성공:', {
            userId: user.userId,
            roleId: user.roleId,
          });

          return true;
        } else {
          console.error('[GuestLogin] myInfoView 실패:', response.message);
          return false;
        }
      } catch (err) {
        console.error('[GuestLogin] myInfoView 오류:', err);
        return false;
      }
    },
    [setUser, setAttendanceFlag]
  );

  /**
   * NFC 스캔 결과로 게스트 로그인 실행
   */
  const performGuestLogin = useCallback(
    async (scanResult: NfcScanResult) => {
      setIsLoading(true);
      setError(null);

      try {
        // NFC 태그 ID를 휴대폰 번호로 사용 (v1 앱 호환)
        // 실제로는 태그에서 추출한 정보를 사용해야 함
        const mobile = scanResult.tagId;
        const buildingId = scanResult.buildingId || ''; // NFC 태그에서 빌딩 ID 추출

        console.log('[GuestLogin] 게스트 로그인 시도:', {
          tagId: scanResult.tagId,
          buildingId,
        });

        const response = await guestLogin({
          mobile,
          buildingId,
        });

        const success = handleGuestLoginResponse(response, buildingId);

        if (success) {
          // myInfoView 호출하여 상세 정보 설정
          await fetchMyInfo(buildingId);

          // 로그인 성공 시 홈 화면으로 이동
          // auth store의 isAuthenticated 상태 변경으로 자동 리다이렉트됨
          console.log('[GuestLogin] 홈 화면으로 이동');
          router.replace('/(main)/(home)');
        }

        return success;
      } catch (err) {
        console.error('[GuestLogin] 게스트 로그인 오류:', err);

        const errorMessage = '게스트 로그인에 실패했습니다.\n네트워크 연결을 확인해주세요.';
        setError(errorMessage);

        Alert.alert('로그인 실패', errorMessage, [
          { text: '재시도', onPress: () => performGuestLogin(scanResult) },
          { text: '취소', style: 'cancel' },
        ]);

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [handleGuestLoginResponse, fetchMyInfo, router]
  );

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    performGuestLogin,
    clearError,
  };
}

export default useGuestLogin;
