/**
 * JWT 유틸리티 함수
 *
 * JWT 토큰을 디코딩하고 유효성을 검사합니다.
 */

interface JWTPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

/**
 * Base64 URL 디코딩
 * JWT는 Base64 URL 인코딩을 사용하므로 표준 Base64와 다릅니다.
 */
const base64UrlDecode = (str: string): string => {
  // Base64 URL을 Base64로 변환 (- -> +, _ -> /)
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // 패딩 추가
  const pad = base64.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('Invalid base64 string');
    }
    base64 += '='.repeat(4 - pad);
  }

  try {
    // Base64 디코딩 후 UTF-8 문자열로 변환
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    throw new Error('Failed to decode base64 string');
  }
};

/**
 * JWT 토큰 디코딩
 *
 * @param token - JWT 토큰 문자열
 * @returns 디코딩된 페이로드
 * @throws 유효하지 않은 JWT 형식일 경우 에러
 */
export const decodeJWT = (token: string): JWTPayload => {
  try {
    // JWT는 헤더.페이로드.서명 형식
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // 페이로드 부분 디코딩
    const payloadPart = parts[1];
    if (!payloadPart) {
      throw new Error('Missing JWT payload');
    }

    const payload = base64UrlDecode(payloadPart);
    return JSON.parse(payload) as JWTPayload;
  } catch (error) {
    throw new Error(
      `Failed to decode JWT: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * JWT 토큰 만료 여부 확인
 *
 * @param token - JWT 토큰 문자열
 * @param bufferSeconds - 만료 버퍼 시간 (초) - 기본 60초 (1분 전에 미리 만료 처리)
 * @returns 토큰이 만료되었거나 곧 만료될 경우 true
 */
export const isTokenExpired = (token: string, bufferSeconds: number = 60): boolean => {
  try {
    const payload = decodeJWT(token);

    if (!payload.exp) {
      // exp 필드가 없으면 만료 시간이 없는 것으로 간주 (유효함)
      return false;
    }

    // 현재 시간 (초 단위)
    const currentTime = Math.floor(Date.now() / 1000);

    // 버퍼를 고려한 만료 시간
    const expirationTime = payload.exp - bufferSeconds;

    return currentTime >= expirationTime;
  } catch {
    // 디코딩 실패 시 만료된 것으로 간주
    return true;
  }
};

/**
 * JWT 토큰의 남은 유효 시간 반환 (초 단위)
 *
 * @param token - JWT 토큰 문자열
 * @returns 남은 시간 (초), 만료되었거나 오류 시 0
 */
export const getTokenRemainingTime = (token: string): number => {
  try {
    const payload = decodeJWT(token);

    if (!payload.exp) {
      return Infinity;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const remainingTime = payload.exp - currentTime;

    return Math.max(0, remainingTime);
  } catch {
    return 0;
  }
};
