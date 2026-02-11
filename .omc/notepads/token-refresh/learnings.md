# 토큰 만료 처리 로직 개선 - 학습 내용

**날짜**: 2026-02-10
**태스크**: 2.2.9 - 토큰 만료 처리 로직 개선

## 구현 내용

### 1. JWT 유틸리티 생성 (src/utils/jwt.ts)

JWT 토큰을 디코딩하고 만료 여부를 검사하는 유틸리티를 구현했습니다.

**주요 기능**:
- `decodeJWT()`: JWT 토큰을 디코딩하여 페이로드 반환
- `isTokenExpired()`: 토큰 만료 여부 확인 (버퍼 시간 지원)
- `getTokenRemainingTime()`: 토큰 남은 유효 시간 반환

**기술적 고려사항**:
- Base64 URL 인코딩 처리 (`-` → `+`, `_` → `/`)
- 패딩 자동 추가
- 만료 버퍼 (기본 60초) - 만료 직전에 미리 갱신

### 2. Auth Store checkAuth() 구현 (src/stores/auth.store.ts)

앱 시작 시 토큰 유효성을 검사하고 필요 시 갱신하는 로직을 구현했습니다.

**처리 흐름**:
1. 토큰 존재 여부 확인
2. JWT 디코딩하여 만료 여부 확인
3. 만료된 경우 refresh token으로 갱신 시도
4. 갱신 실패 시 로그아웃

### 3. API Client 401 에러 처리 개선 (src/api/client.ts)

API 호출 중 401 에러 발생 시 자동으로 토큰을 갱신하고 원래 요청을 재시도하는 로직을 구현했습니다.

**핵심 개선사항**:
- **무한 루프 방지**: `_retry` 플래그로 한 번만 재시도
- **중복 요청 방지**: `isRefreshing` 플래그로 동시 refresh 방지
- **대기열 관리**: 여러 API가 동시에 401 에러 시 대기열에 추가하여 한 번만 refresh
- **권한 문제 구분**: 토큰이 유효하나 401 에러 시 권한 문제로 간주하고 refresh 시도하지 않음

**처리 흐름**:
1. 401 에러 감지
2. `_retry` 플래그 확인 (이미 재시도했으면 중단)
3. Refresh token 존재 여부 확인
4. 토큰 만료 여부 확인 (만료 안 됐으면 권한 문제)
5. 이미 refresh 중이면 대기열에 추가
6. Refresh token API 호출
7. 성공 시 store 업데이트 및 대기 중인 요청들 처리
8. 실패 시 로그아웃

### 4. Refresh Token API 추가 (src/api/auth.ts)

서버에 refresh token을 보내 새 access token을 받는 API를 추가했습니다.

**엔드포인트**: `POST /m/api/account/refresh`

**요청**:
```typescript
{
  refreshToken: string
}
```

**응답**:
```typescript
{
  code: string
  authToken?: string
  refreshToken?: string  // 새 refresh token도 함께 갱신 가능
}
```

## 학습 내용

### 1. JWT 구조
- **Header.Payload.Signature** 형식
- Base64 URL 인코딩 사용 (표준 Base64와 다름)
- `exp` 필드: UNIX timestamp (초 단위)

### 2. Token Refresh 패턴
- **버퍼 시간**: 만료 1분 전에 미리 갱신하여 사용자 경험 개선
- **Queue 패턴**: 여러 API가 동시에 401 에러 시 하나만 refresh 요청
- **Flag 기반 재시도 제어**: 무한 루프 방지

### 3. TypeScript 타입 안정성
- `parts[1]`은 `string | undefined`이므로 명시적 체크 필요
- `new Array(n).join()` 대신 `'='.repeat(n)` 사용으로 타입 안정성 개선

## 테스트 시나리오

### 정상 플로우
1. 유효한 토큰 → 그대로 사용
2. 만료 임박 토큰 → checkAuth()에서 미리 갱신
3. 만료된 토큰 → API 호출 시 401 에러 → 자동 갱신 → 원래 요청 재시도

### 에러 플로우
1. Refresh token 없음 → 즉시 로그아웃
2. Refresh API 실패 → 로그아웃
3. 권한 문제 (토큰은 유효하나 401) → refresh 시도하지 않고 에러 반환

## 추후 개선 사항

1. **Refresh Token Rotation**: 보안 강화를 위해 refresh token도 주기적으로 갱신
2. **백그라운드 갱신**: 앱 포그라운드 복귀 시 자동으로 checkAuth() 호출
3. **오프라인 처리**: 네트워크 에러와 인증 에러 구분
4. **로깅 개선**: 프로덕션 환경에서는 민감한 정보 로깅 제거
