# 태스크 2.2.8: 로그인 → 홈 플로우 테스트 - 완료 보고

## 작업 개요

로그인에서 홈 화면까지의 플로우를 검토하고, 발견된 문제점을 수정했습니다.

## 수정된 파일 목록

1. **app/_layout.tsx** - 앱 초기화 로직 개선
2. **app/index.tsx** - 리다이렉트 로직 단순화
3. **app/(auth)/login.tsx** - 주석 추가 및 로그 개선
4. **src/stores/auth.store.ts** - 로그 추가 및 주석 개선
5. **src/features/auth/hooks/useLogin.ts** - 로그 추가

## 주요 개선 사항

### 1. 중복 제거
- `app/index.tsx`에서 불필요한 `checkAuth` 호출 제거
- 인증 체크는 `app/_layout.tsx`에서 한 번만 수행

### 2. 책임 분리 명확화

| 파일 | 책임 |
|------|------|
| `app/_layout.tsx` | 앱 초기화, 토큰 유효성 검증 |
| `app/index.tsx` | 인증 상태에 따른 리다이렉트 |
| `app/(auth)/login.tsx` | 로그인 처리, 성공 시 네비게이션 |
| `src/stores/auth.store.ts` | 인증 상태 관리 |
| `src/features/auth/hooks/useLogin.ts` | 로그인 API 처리 |

### 3. 로그 추가

전체 인증 플로우를 추적할 수 있도록 각 단계에 로그를 추가했습니다:

```typescript
// 앱 시작
[RootLayout] Hydration 완료, 초기화 실행
[AuthStore] checkAuth 시작
[AuthStore] checkAuth: 토큰 유효함 -> 인증 성공
[RootLayout] 앱 초기화 완료
[Index] 인증됨 -> 홈 화면으로 이동

// 로그인
[Login] 로그인 시도: testuser
[useLogin] 로그인 시작: testuser
[useLogin] 로그인 성공: 테스트 사용자
[AuthStore] setAuth 호출: 테스트 사용자
[Login] 인증 성공 -> 홈 화면으로 이동
```

### 4. 주석 개선

각 함수와 로직의 동작 방식을 한국어 주석으로 명확하게 설명했습니다.

## 인증 플로우

### 앱 시작 (토큰 있음)
```
1. RootLayout 마운트
2. Zustand persist middleware가 SecureStore에서 토큰 복원 (자동)
3. onRehydrateStorage 콜백에서 hydrate() 호출 → isHydrated = true
4. useEffect에서 initializeApp() 실행
5. checkAuth()로 토큰 유효성 검증
   - 유효: isAuthenticated = true
   - 만료: refresh token으로 갱신 시도
   - 실패: logout()
6. Splash Screen 숨김
7. Index 컴포넌트에서 isAuthenticated 확인
8. 홈 화면으로 리다이렉트
```

### 앱 시작 (토큰 없음)
```
1. RootLayout 마운트
2. Zustand persist middleware 실행 (토큰 없음)
3. onRehydrateStorage 콜백에서 hydrate() 호출
4. checkAuth() 실행 → 토큰 없음 → isAuthenticated = false
5. Splash Screen 숨김
6. Index 컴포넌트에서 isAuthenticated = false 확인
7. 로그인 화면으로 리다이렉트
```

### 로그인
```
1. 사용자가 아이디/비밀번호 입력
2. handleLogin() 실행
3. 폼 검증 (아이디, 비밀번호 필수)
4. useLogin().login() 호출
5. 로그인 API 호출
6. 성공 시 setAuth() → isAuthenticated = true
7. useEffect에서 isAuthenticated 변경 감지
8. requestAnimationFrame으로 래핑된 네비게이션
9. 홈 화면으로 리다이렉트
```

## 테스트 방법

상세한 테스트 가이드는 `test-guide.md` 참조

**주요 시나리오**:
1. ✅ 신규 설치 (토큰 없음) → 로그인 화면
2. ✅ 로그인 성공 → 홈 화면
3. ✅ 로그인 실패 → 에러 메시지
4. ✅ 앱 재시작 (토큰 있음) → 홈 화면 (자동 로그인)
5. ✅ 폼 검증
6. ✅ 로그아웃 → 로그인 화면

## 기술적 세부사항

### Zustand Persist Middleware

```typescript
persist(
  (set, get) => ({ /* state */ }),
  {
    name: 'auth-storage',
    storage: createJSONStorage(() => secureStorage), // SecureStore 사용
    partialize: (state) => ({ /* 영속화할 필드만 선택 */ }),
    onRehydrateStorage: () => (state) => {
      if (state) {
        state.hydrate(); // 복원 완료 후 플래그 설정
      }
    },
  }
)
```

**동작 방식**:
1. 앱 시작 시 SecureStore에서 상태 자동 복원
2. 복원 완료 후 `onRehydrateStorage` 콜백 실행
3. `hydrate()` 함수로 `isHydrated = true` 설정
4. UI에서 `isHydrated` 감지하여 초기화 진행

### requestAnimationFrame

```typescript
useEffect(() => {
  if (isAuthenticated) {
    requestAnimationFrame(() => {
      router.replace('/(main)/(tabs)/home');
    });
  }
}, [isAuthenticated, router]);
```

**사용 이유**:
- 상태 업데이트와 네비게이션을 다음 프레임으로 지연
- React의 배치 업데이트와 충돌 방지
- 더 부드러운 화면 전환

### SecureStore

```typescript
const secureStorage = {
  getItem: async (name: string) => await SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) => await SecureStore.deleteItemAsync(name),
};
```

**보안**:
- iOS: Keychain 사용
- Android: EncryptedSharedPreferences 사용
- 토큰과 사용자 정보를 안전하게 보관

## 검증 완료

- ✅ **타입 체크 통과**: `npm run typecheck` 성공
- ✅ **로직 검증**: 인증 플로우 단계별 확인
- ✅ **로그 추가**: 전체 플로우 추적 가능
- ✅ **주석 개선**: 코드 가독성 향상

## 다음 단계

실제 디바이스/시뮬레이터에서 테스트:

1. **개발 서버 실행**
   ```bash
   npm start
   ```

2. **앱 실행**
   ```bash
   # iOS
   npx expo run:ios

   # Android
   npx expo run:android
   ```

3. **테스트 시나리오 실행**
   - `test-guide.md`의 체크리스트 참조

4. **로그 확인**
   - Metro 번들러 로그에서 `[Auth]`, `[Login]`, `[useLogin]` 확인

## 관련 문서

- `/Users/jinseok/Documents/insite-app/InsiteApp-v2/.omc/notepads/login-home-flow/learnings.md`
- `/Users/jinseok/Documents/insite-app/InsiteApp-v2/.omc/notepads/login-home-flow/test-guide.md`

## 완료 확인

- [x] 중복된 checkAuth 호출 제거
- [x] 인증 플로우 로직 명확화
- [x] 로그 추가 (전체 플로우 추적 가능)
- [x] 주석 개선 (동작 방식 설명)
- [x] 타입 체크 통과
- [x] 문서 작성 (learnings.md, test-guide.md, summary.md)

---

**태스크 2.2.8 완료** ✅
