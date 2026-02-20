import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { config } from '@/constants/config';
import { isTokenExpired } from '@/utils/jwt';
import { handleApiError } from './errorHandler';

// Create axios instance
export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;

    if (token && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    return requestConfig;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Refresh token 요청 중인지 추적 (중복 요청 방지)
let isRefreshing = false;
// Refresh 완료를 기다리는 요청들을 저장
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

/**
 * 대기 중인 요청들을 처리
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Token expired
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // 무한 루프 방지: _retry 플래그로 한 번만 재시도
      originalRequest._retry = true;

      const { refreshToken, token } = useAuthStore.getState();

      // Refresh token이 없으면 로그아웃
      if (!refreshToken) {
        console.log('[API] 401 에러: refresh token 없음, 로그아웃');
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      // 현재 토큰이 만료되지 않았으면 다른 이유의 401이므로 그냥 에러 반환
      if (token && !isTokenExpired(token, 0)) {
        console.log('[API] 401 에러: 토큰은 유효하나 인증 실패 (권한 문제 등)');
        return Promise.reject(error);
      }

      // 이미 refresh 중이면 대기열에 추가
      if (isRefreshing) {
        console.log('[API] 401 에러: refresh 중, 대기열에 추가');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        console.log('[API] 401 에러: 토큰 refresh 시도');

        // Refresh token API 호출
        const response = await axios.post(`${config.apiBaseUrl}/m/api/account/refresh`, {
          refreshToken,
        });

        if (response.data.code === 'success' && response.data.authToken) {
          const newToken = response.data.authToken;
          console.log('[API] 토큰 refresh 성공');

          // Store에 새 토큰 저장
          useAuthStore.getState().setToken(newToken);

          // refresh token도 갱신되었으면 함께 업데이트
          if (response.data.refreshToken) {
            useAuthStore
              .getState()
              .setAuth(useAuthStore.getState().user!, newToken, response.data.refreshToken);
          }

          // 대기 중인 요청들 처리
          processQueue(null, newToken);

          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          isRefreshing = false;
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh token response invalid');
        }
      } catch (refreshError) {
        console.error('[API] 토큰 refresh 실패:', refreshError);

        // 대기 중인 요청들에 에러 전파
        processQueue(error, null);

        // Refresh 실패 시 로그아웃
        useAuthStore.getState().logout();

        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors - 중앙 에러 핸들러로 처리
    handleApiError(error);
    return Promise.reject(error);
  }
);

// API Error type
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Helper to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    return apiError?.message || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

// Orval custom instance (mutator)
export const customInstance = <T>(
  config:
    | InternalAxiosRequestConfig
    | {
        url: string;
        method: string;
        headers?: Record<string, string>;
        data?: unknown;
        signal?: AbortSignal;
      }
): Promise<T> => {
  const source = axios.CancelToken.source();
  const promise = apiClient({
    ...config,
    cancelToken: source.token,
  } as InternalAxiosRequestConfig).then(({ data }) => data);

  // @ts-expect-error - cancel is added to promise
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
