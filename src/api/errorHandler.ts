/**
 * API 에러 핸들러
 *
 * 백엔드 응답 코드별 에러 처리 전략:
 * - toast: 사용자에게 토스트 메시지 표시
 * - logout: 인증 만료 → 로그아웃 처리
 * - silent: 별도 UI 없이 콘솔 로그만
 */
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { showGlobalToast } from './globalToast';

type ErrorAction = 'toast' | 'logout' | 'silent';

interface ErrorConfig {
  message: string;
  action: ErrorAction;
}

/**
 * 백엔드 에러 코드 매핑
 *
 * 서버가 반환하는 code 필드 값에 대한 처리 정의
 */
const API_ERROR_CODES: Record<string, ErrorConfig> = {
  E00400: { message: '잘못된 요청입니다.', action: 'toast' },
  E00401: { message: '인증이 필요합니다.', action: 'logout' },
  E00403: { message: '접근 권한이 없습니다.', action: 'toast' },
  E00404: { message: '요청한 데이터를 찾을 수 없습니다.', action: 'toast' },
  E00412: { message: '로그인이 만료되었습니다. 다시 로그인해 주세요.', action: 'logout' },
  E00500: { message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', action: 'toast' },
  fail: { message: '요청 처리에 실패했습니다.', action: 'toast' },
};

/**
 * HTTP 상태 코드별 기본 메시지
 */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: '인증이 필요합니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 데이터를 찾을 수 없습니다.',
  408: '요청 시간이 초과되었습니다.',
  500: '서버 오류가 발생했습니다.',
  502: '서버에 연결할 수 없습니다.',
  503: '서비스를 이용할 수 없습니다.',
};

/**
 * 네트워크 에러 여부 판별
 */
function isNetworkError(error: AxiosError): boolean {
  return !error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error');
}

/**
 * 타임아웃 에러 여부 판별
 */
function isTimeoutError(error: AxiosError): boolean {
  return error.code === 'ECONNABORTED' || error.code === 'ERR_CANCELED';
}

/**
 * API 에러 처리 메인 함수
 *
 * Axios 인터셉터에서 호출하여 에러 유형별 적절한 처리를 수행한다.
 * 401 에러는 client.ts의 토큰 갱신 로직에서 처리하므로 여기서는 skip.
 *
 * @returns 에러 메시지 문자열
 */
export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    const msg = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    showGlobalToast(msg, 'error');
    return msg;
  }

  // 네트워크 에러 (오프라인)
  if (isNetworkError(error)) {
    const msg = '네트워크에 연결할 수 없습니다. 인터넷 연결을 확인해 주세요.';
    showGlobalToast(msg, 'warning');
    return msg;
  }

  // 타임아웃 에러
  if (isTimeoutError(error)) {
    const msg = '요청 시간이 초과되었습니다. 다시 시도해 주세요.';
    showGlobalToast(msg, 'warning');
    return msg;
  }

  // 서버 응답이 있는 경우
  const response = error.response;
  if (!response) {
    const msg = '서버에 연결할 수 없습니다.';
    showGlobalToast(msg, 'error');
    return msg;
  }

  // 401은 client.ts의 토큰 갱신에서 처리 → 여기서는 무시
  if (response.status === 401) {
    return '인증이 필요합니다.';
  }

  // 서버 응답 body에서 에러 코드 추출
  const responseData = response.data as { code?: string; message?: string } | undefined;
  const serverCode = responseData?.code;
  const serverMessage = responseData?.message;

  // 1. 서버 에러 코드 매핑 확인
  if (serverCode && API_ERROR_CODES[serverCode]) {
    const config = API_ERROR_CODES[serverCode];
    const msg = serverMessage || config.message;

    switch (config.action) {
      case 'logout':
        showGlobalToast(msg, 'error');
        useAuthStore.getState().logout();
        break;
      case 'toast':
        showGlobalToast(msg, 'error');
        break;
      case 'silent':
        console.log('[ErrorHandler] Silent error:', serverCode, msg);
        break;
    }

    return msg;
  }

  // 2. 서버 메시지가 있으면 사용
  if (serverMessage) {
    showGlobalToast(serverMessage, 'error');
    return serverMessage;
  }

  // 3. HTTP 상태 코드 기본 메시지
  const httpMsg = HTTP_STATUS_MESSAGES[response.status] || `오류가 발생했습니다. (${response.status})`;
  showGlobalToast(httpMsg, 'error');
  return httpMsg;
}

/**
 * 에러에서 사용자 표시용 메시지 추출 (Toast 없이)
 *
 * 화면 내에서 에러 상태를 표시할 때 사용
 */
export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
  }

  if (isNetworkError(error)) {
    return '네트워크에 연결할 수 없습니다.';
  }

  if (isTimeoutError(error)) {
    return '요청 시간이 초과되었습니다.';
  }

  const responseData = error.response?.data as { message?: string } | undefined;
  if (responseData?.message) {
    return responseData.message;
  }

  if (error.response?.status) {
    return HTTP_STATUS_MESSAGES[error.response.status] || `오류가 발생했습니다. (${error.response.status})`;
  }

  return '알 수 없는 오류가 발생했습니다.';
}
