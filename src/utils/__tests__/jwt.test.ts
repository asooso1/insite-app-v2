/**
 * JWT 유틸리티 단위 테스트
 */
import { decodeJWT, isTokenExpired, getTokenRemainingTime } from '../jwt';

/**
 * 테스트용 JWT 토큰 생성 헬퍼
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function createTestJWT(payload: Record<string, unknown>): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe('decodeJWT', () => {
  it('유효한 JWT를 디코딩한다', () => {
    const token = createTestJWT({ sub: 'user1', exp: 9999999999 });

    const payload = decodeJWT(token);

    expect(payload.sub).toBe('user1');
    expect(payload.exp).toBe(9999999999);
  });

  it('한글 데이터가 포함된 JWT를 디코딩한다', () => {
    const token = createTestJWT({ name: '테스트유저', role: '관리자' });

    const payload = decodeJWT(token);

    expect(payload.name).toBe('테스트유저');
    expect(payload.role).toBe('관리자');
  });

  it('3개 부분이 아닌 토큰은 에러를 던진다', () => {
    expect(() => decodeJWT('invalid.token')).toThrow('Failed to decode JWT');
    expect(() => decodeJWT('only-one-part')).toThrow('Failed to decode JWT');
    expect(() => decodeJWT('')).toThrow('Failed to decode JWT');
  });

  it('잘못된 Base64 페이로드는 에러를 던진다', () => {
    expect(() => decodeJWT('header.!!!invalid!!!.signature')).toThrow('Failed to decode JWT');
  });
});

describe('isTokenExpired', () => {
  it('만료되지 않은 토큰은 false를 반환한다', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1시간 후
    const token = createTestJWT({ exp: futureExp });

    expect(isTokenExpired(token)).toBe(false);
  });

  it('만료된 토큰은 true를 반환한다', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600; // 1시간 전
    const token = createTestJWT({ exp: pastExp });

    expect(isTokenExpired(token)).toBe(true);
  });

  it('버퍼 시간 이내의 토큰은 만료로 처리한다 (기본 60초)', () => {
    const soonExp = Math.floor(Date.now() / 1000) + 30; // 30초 후 (60초 버퍼 이내)
    const token = createTestJWT({ exp: soonExp });

    expect(isTokenExpired(token)).toBe(true);
  });

  it('버퍼 시간을 0으로 설정하면 정확한 만료 시점까지 유효하다', () => {
    const soonExp = Math.floor(Date.now() / 1000) + 30; // 30초 후
    const token = createTestJWT({ exp: soonExp });

    expect(isTokenExpired(token, 0)).toBe(false);
  });

  it('exp 필드가 없으면 만료되지 않은 것으로 간주한다', () => {
    const token = createTestJWT({ sub: 'user1' });

    expect(isTokenExpired(token)).toBe(false);
  });

  it('디코딩 실패 시 만료된 것으로 간주한다', () => {
    expect(isTokenExpired('invalid-token')).toBe(true);
  });
});

describe('getTokenRemainingTime', () => {
  it('유효한 토큰의 남은 시간을 반환한다', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = createTestJWT({ exp: futureExp });

    const remaining = getTokenRemainingTime(token);

    // 3600초 근처 (실행 시간 오차 허용)
    expect(remaining).toBeGreaterThan(3590);
    expect(remaining).toBeLessThanOrEqual(3600);
  });

  it('만료된 토큰은 0을 반환한다', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 100;
    const token = createTestJWT({ exp: pastExp });

    expect(getTokenRemainingTime(token)).toBe(0);
  });

  it('exp 필드가 없으면 Infinity를 반환한다', () => {
    const token = createTestJWT({ sub: 'user1' });

    expect(getTokenRemainingTime(token)).toBe(Infinity);
  });

  it('디코딩 실패 시 0을 반환한다', () => {
    expect(getTokenRemainingTime('bad-token')).toBe(0);
  });
});
