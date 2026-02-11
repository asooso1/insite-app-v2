# 로그인 → 홈 플로우 테스트 및 수정 (태스크 2.2.8)

## 날짜
2026-02-10

## 발견된 문제점

### 1. 중복된 checkAuth 호출
**위치**: `app/index.tsx`, `app/_layout.tsx`

**문제**:
- `app/_layout.tsx`에서 `checkAuth`를 호출하고 있었는데
- `app/index.tsx`에서도 중복으로 `checkAuth`를 호출하고 있었음
- 불필요한 API 호출 발생

**해결**:
- `app/index.tsx`의 `checkAuth` 호출 제거
- 인증 상태에 따른 리다이렉트만 수행하도록 단순화

### 2. hydrate 로직 혼란
**위치**: `src/stores/auth.store.ts`, `app/_layout.tsx`

**문제**:
- `hydrate()` 함수가 단순히 플래그만 설정하는 역할인데 명확하지 않음
- 실제 상태 복원은 Zustand persist middleware가 자동으로 처리

**해결**:
- 주석으로 동작 방식 명확화
- `onRehydrateStorage`에서 자동으로 `hydrate()` 호출됨을 명시

### 3. 로그 부족
**위치**: 전체 인증 플로우

**문제**:
- 인증 플로우가 어떻게 진행되는지 추적이 어려움

**해결**:
- 모든 주요 지점에 `console.log` 추가
- 인증 상태 변경, 로그인 시도/성공/실패, 네비게이션 등 추적 가능

## 수정된 파일

### 1. app/_layout.tsx
```typescript
// 변경 전: hydrate() 직접 호출
const hydrate = useAuthStore((state) => state.hydrate);
hydrate();

// 변경 후: persist middleware가 자동 호출
// hydrate는 onRehydrateStorage에서 자동 실행됨
```

### 2. app/index.tsx
```typescript
// 변경 전: checkAuth를 중복 호출
useEffect(() => {
  if (isHydrated) {
    checkAuth();
  }
}, [isHydrated, checkAuth]);

// 변경 후: 리다이렉트만 수행 (checkAuth는 _layout에서 실행)
// checkAuth 호출 제거
```

### 3. app/(auth)/login.tsx
```typescript
// 주석 추가로 동작 방식 명확화
/**
 * 인증 상태 변경 시 홈 화면으로 리다이렉트
 * requestAnimationFrame으로 래핑하여 상태 업데이트와 네비게이션이 원활하게 처리되도록 함
 */
useEffect(() => {
  if (isAuthenticated) {
    console.log('[Login] 인증 성공 -> 홈 화면으로 이동');
    requestAnimationFrame(() => {
      router.replace('/(main)/(tabs)/home');
    });
  }
}, [isAuthenticated, router]);
```

### 4. src/stores/auth.store.ts
```typescript
// 모든 액션에 로그 추가
setAuth: (user, token, refreshToken) => {
  console.log('[AuthStore] setAuth 호출:', user.name);
  // ...
},

logout: () => {
  console.log('[AuthStore] logout 호출');
  // ...
},

checkAuth: async () => {
  console.log('[AuthStore] checkAuth 시작');
  // ...
}
```

### 5. src/features/auth/hooks/useLogin.ts
```typescript
// 로그인 플로우 추적을 위한 로그 추가
console.log('[useLogin] 로그인 시작:', params.userId);
console.log('[useLogin] 로그인 응답 처리:', code);
console.log('[useLogin] 로그인 성공:', data.name);
```

## 정상 플로우 (앱 시작)

```
1. [RootLayout] isHydrated = false → 스플래시 화면 표시
2. [AuthStore] hydrate 완료 (persist middleware 자동 호출)
3. [RootLayout] Hydration 완료, 초기화 실행
4. [AuthStore] checkAuth 시작
5-a. 토큰 있음 → [AuthStore] checkAuth: 토큰 유효함 → 인증 성공
5-b. 토큰 없음 → [AuthStore] checkAuth: 토큰 없음 → 미인증 상태
6. [RootLayout] 앱 초기화 완료
7. [Index] 인증 상태에 따라 리다이렉트
   - 인증됨 → /(main)/(tabs)/home
   - 미인증 → /(auth)/login
```

## 정상 플로우 (로그인)

```
1. 사용자가 로그인 버튼 클릭
2. [Login] 로그인 시도: userId
3. [useLogin] 로그인 시작: userId
4. [useLogin] 로그인 응답 처리: success
5. [useLogin] 로그인 성공: userName
6. [AuthStore] setAuth 호출: userName
7. login.tsx에서 isAuthenticated 변경 감지
8. [Login] 인증 성공 -> 홈 화면으로 이동
9. router.replace('/(main)/(tabs)/home')
```

## 검증 방법

### 1. 신규 설치 (토큰 없음)
```bash
# 앱 데이터 삭제 후 실행
# 기대: 로그인 화면으로 이동
```

### 2. 로그인 성공
```bash
# 올바른 아이디/비밀번호 입력
# 기대: 홈 화면으로 이동
```

### 3. 앱 재시작 (토큰 있음)
```bash
# 앱 종료 후 재실행
# 기대: 자동으로 홈 화면으로 이동 (로그인 화면 스킵)
```

### 4. 토큰 만료
```bash
# 토큰 만료 후 앱 실행
# 기대: refresh token으로 갱신 시도 → 실패 시 로그인 화면으로 이동
```

## 주요 개선 사항

1. **중복 제거**: checkAuth 중복 호출 제거
2. **명확한 책임 분리**:
   - `_layout.tsx`: 앱 초기화, 인증 체크
   - `index.tsx`: 인증 상태에 따른 리다이렉트
   - `login.tsx`: 로그인 처리, 성공 시 네비게이션
3. **로그 추가**: 전체 플로우 추적 가능
4. **주석 개선**: 각 단계의 동작 방식 명확화

## 참고

- Zustand persist middleware는 자동으로 SecureStore에서 상태를 복원함
- `onRehydrateStorage` 콜백에서 `hydrate()` 함수가 자동 호출됨
- `requestAnimationFrame`을 사용하여 상태 업데이트 후 네비게이션이 원활하게 처리되도록 함
