/**
 * 인증 API (v1)
 *
 * 기기인증 없는 기본 로그인 API
 */

import { apiClient } from './client';

// 로그인 응답 코드
export const LOGIN_RESPONSE_CODES = {
  SUCCESS: 'success',
  FAIL: 'fail',
  MOBILE_DUPLICATE: 'MOBILE_DUPLICATE',
} as const;

export type LoginResponseCode = (typeof LOGIN_RESPONSE_CODES)[keyof typeof LOGIN_RESPONSE_CODES];

// 타입 정의
export interface LoginRequest {
  userId: string;
  passwd: string;
  fcmToken?: string;
}

export interface UserInfo {
  id: string;
  userId: string;
  name: string;
  email?: string;
  role: string;
  siteId?: string;
  siteName?: string;
  buildingId?: string;
  buildingName?: string;
  mobile?: string;
}

export interface LoginResponse {
  code: LoginResponseCode;
  message?: string;
  authToken?: string;
  data?: UserInfo;
}

export interface GuestLoginRequest {
  mobile: string;
  buildingId: string;
  fcmToken?: string;
}

/**
 * v1 로그인 API 호출
 */
export const login = async (params: {
  userId: string;
  passwd: string;
  fcmToken?: string;
}): Promise<LoginResponse> => {
  const requestData: LoginRequest = {
    userId: params.userId,
    passwd: params.passwd,
    fcmToken: params.fcmToken || '',
  };

  console.log('[Auth] v1 로그인 요청:', {
    userId: params.userId,
  });

  const response = await apiClient.post<LoginResponse>('/m/api/account/login', requestData);

  console.log('[Auth] v1 로그인 응답:', {
    code: response.data.code,
    hasToken: !!response.data.authToken,
    hasData: !!response.data.data,
  });

  return response.data;
};

/**
 * v1 게스트 로그인 API 호출
 */
export const guestLogin = async (params: {
  mobile: string;
  buildingId: string;
  fcmToken?: string;
}): Promise<LoginResponse> => {
  const requestData: GuestLoginRequest = {
    mobile: params.mobile,
    buildingId: params.buildingId,
    fcmToken: params.fcmToken || '',
  };

  console.log('[Auth] 게스트 로그인 요청:', {
    mobile: params.mobile,
    buildingId: params.buildingId,
  });

  const response = await apiClient.post<LoginResponse>('/m/api/account/temporary', requestData);

  console.log('[Auth] 게스트 로그인 응답:', response.data);
  return response.data;
};

/**
 * 로그아웃 API
 */
export const logoutApi = async (): Promise<void> => {
  try {
    await apiClient.post('/m/api/account/logout');
  } catch (error) {
    console.log('[Auth] 로그아웃 API 오류 (무시됨):', error);
  }
};

export default {
  login,
  guestLogin,
  logoutApi,
  LOGIN_RESPONSE_CODES,
};
