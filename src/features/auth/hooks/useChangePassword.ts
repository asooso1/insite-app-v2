/**
 * 비밀번호 변경 훅
 *
 * 현재 비밀번호를 확인하고 새 비밀번호로 변경
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/auth.store';

interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  code: string;
  message: string;
}

interface UseChangePasswordOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * 비밀번호 변경 API 호출
 */
const changePasswordApi = async (params: ChangePasswordParams): Promise<ChangePasswordResponse> => {
  console.log('[Auth] 비밀번호 변경 요청');

  const response = await apiClient.put<ChangePasswordResponse>('/m/api/account/password', {
    currentPassword: params.currentPassword,
    newPassword: params.newPassword,
  });

  console.log('[Auth] 비밀번호 변경 응답:', response.data);
  return response.data;
};

export function useChangePassword(options: UseChangePasswordOptions = {}) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const mutation = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      console.log('[Auth] 비밀번호 변경 성공');

      // 성공 시 로그아웃 처리 (재로그인 유도)
      Alert.alert(
        '비밀번호 변경 완료',
        '비밀번호가 성공적으로 변경되었습니다.\n새 비밀번호로 다시 로그인해주세요.',
        [
          {
            text: '확인',
            onPress: () => {
              logout(); // 로그아웃
              router.replace('/(auth)/login'); // 로그인 화면으로 이동
              options.onSuccess?.();
            },
          },
        ]
      );
    },
    onError: (error: Error) => {
      console.error('[Auth] 비밀번호 변경 실패:', error);

      // 에러 메시지 추출
      let errorMessage = '비밀번호 변경에 실패했습니다.';

      if (error.message.includes('400')) {
        errorMessage = '현재 비밀번호가 일치하지 않습니다.';
      } else if (error.message.includes('401')) {
        errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
      }

      Alert.alert('비밀번호 변경 실패', errorMessage);
      options.onError?.(error);
    },
  });

  return {
    changePassword: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export default useChangePassword;
