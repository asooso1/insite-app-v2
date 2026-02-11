# 로그인 → 홈 플로우 테스트 가이드

## 테스트 환경 준비

### 1. 개발 서버 실행
```bash
cd /Users/jinseok/Documents/insite-app/InsiteApp-v2
npm start
```

### 2. 앱 실행
- iOS: `npx expo run:ios`
- Android: `npx expo run:android`
- Expo Go: QR 코드 스캔

## 테스트 시나리오

### 시나리오 1: 신규 설치 (토큰 없음)

**목적**: 토큰이 없는 상태에서 로그인 화면으로 올바르게 리다이렉트되는지 확인

**절차**:
1. 앱 데이터 삭제
   - iOS Simulator: Device > Erase All Content and Settings
   - Android Emulator: Settings > Apps > [App] > Clear Data
2. 앱 실행
3. Metro 로그 확인

**기대 결과**:
```
[RootLayout] Hydration 완료, 초기화 실행
[AuthStore] checkAuth 시작
[AuthStore] checkAuth: 토큰 없음 -> 미인증 상태
[RootLayout] 앱 초기화 완료
[Index] 미인증 -> 로그인 화면으로 이동
```

**UI 확인**:
- [ ] 스플래시 화면이 표시됨
- [ ] 로그인 화면으로 이동
- [ ] "스테이징 서버 연결됨" 배지 표시
- [ ] 아이디/비밀번호 입력 필드 활성화

---

### 시나리오 2: 로그인 성공

**목적**: 올바른 자격증명으로 로그인 후 홈 화면으로 이동하는지 확인

**절차**:
1. 로그인 화면에서 테스트 계정 입력
   - 아이디: (테스트 계정)
   - 비밀번호: (테스트 비밀번호)
2. "로그인" 버튼 클릭
3. Metro 로그 확인

**기대 결과**:
```
[Login] 로그인 시도: testuser
[useLogin] 로그인 시작: testuser
[useLogin] 로그인 응답 처리: success
[useLogin] 로그인 성공: 테스트 사용자
[AuthStore] setAuth 호출: 테스트 사용자
[Login] 인증 성공 -> 홈 화면으로 이동
[Index] 인증됨 -> 홈 화면으로 이동
```

**UI 확인**:
- [ ] 로딩 인디케이터 표시
- [ ] 홈 화면으로 이동
- [ ] 헤더에 사용자 이름 표시: "안녕하세요, 테스트 사용자님"
- [ ] 현장명 배지 표시
- [ ] 오늘의 업무 현황 카드 표시

---

### 시나리오 3: 로그인 실패 (잘못된 자격증명)

**목적**: 잘못된 자격증명으로 로그인 시 에러 처리가 올바른지 확인

**절차**:
1. 로그인 화면에서 잘못된 계정 입력
   - 아이디: wronguser
   - 비밀번호: wrongpassword
2. "로그인" 버튼 클릭
3. Metro 로그 확인

**기대 결과**:
```
[Login] 로그인 시도: wronguser
[useLogin] 로그인 시작: wronguser
[useLogin] 로그인 응답 처리: fail
[useLogin] 로그인 실패: 인증 오류
```

**UI 확인**:
- [ ] 로딩 인디케이터 표시
- [ ] Alert 표시: "아이디와 비밀번호를 정확히 입력해주세요."
- [ ] 에러 메시지 표시: "아이디 또는 비밀번호가 올바르지 않습니다."
- [ ] 로그인 화면 유지

---

### 시나리오 4: 앱 재시작 (유효한 토큰 있음)

**목적**: 유효한 토큰이 있으면 자동 로그인되어 홈 화면으로 이동하는지 확인

**절차**:
1. 시나리오 2 완료 후 (로그인 성공 상태)
2. 앱 완전 종료 (백그라운드에서도 제거)
3. 앱 재실행
4. Metro 로그 확인

**기대 결과**:
```
[RootLayout] Hydration 완료, 초기화 실행
[AuthStore] checkAuth 시작
[AuthStore] checkAuth: 토큰 유효함 -> 인증 성공
[RootLayout] 앱 초기화 완료
[Index] 인증됨 -> 홈 화면으로 이동
```

**UI 확인**:
- [ ] 스플래시 화면이 표시됨
- [ ] 로그인 화면을 거치지 않고 바로 홈 화면으로 이동
- [ ] 사용자 정보가 그대로 유지됨

---

### 시나리오 5: 폼 검증

**목적**: 입력 필드 검증이 올바르게 작동하는지 확인

**절차 5-1**: 아이디 미입력
1. 비밀번호만 입력
2. "로그인" 버튼 클릭

**기대 결과**:
- [ ] 에러 메시지 표시: "아이디를 입력하세요"
- [ ] API 호출 없음

**절차 5-2**: 비밀번호 미입력
1. 아이디만 입력
2. "로그인" 버튼 클릭

**기대 결과**:
- [ ] 에러 메시지 표시: "비밀번호를 입력하세요"
- [ ] API 호출 없음

**절차 5-3**: 비밀번호 표시/숨김
1. 비밀번호 입력
2. "보기" 버튼 클릭
3. "숨김" 버튼 클릭

**기대 결과**:
- [ ] "보기" 클릭 시 비밀번호 평문 표시
- [ ] "숨김" 클릭 시 비밀번호 마스킹

---

### 시나리오 6: 로그아웃 후 재로그인

**목적**: 로그아웃 후 토큰이 제거되고 다시 로그인할 수 있는지 확인

**절차**:
1. 홈 화면에서 프로필 탭으로 이동
2. "로그아웃" 버튼 클릭
3. Metro 로그 확인
4. 다시 로그인

**기대 결과**:
```
[AuthStore] logout 호출
[Index] 미인증 -> 로그인 화면으로 이동
```

**UI 확인**:
- [ ] 로그인 화면으로 리다이렉트
- [ ] 입력 필드가 비어있음
- [ ] 다시 로그인 가능

---

## 성능 테스트

### 로그인 속도
- [ ] 로그인 버튼 클릭부터 홈 화면 표시까지 **2초 이내**
- [ ] 앱 시작부터 첫 화면 표시까지 **1초 이내**

### 메모리 누수
- [ ] 로그인/로그아웃 반복 10회 후 메모리 사용량 확인
- [ ] 앱 재시작 반복 10회 후 메모리 사용량 확인

---

## 디버깅 팁

### Metro 로그 확인
```bash
# 로그 필터링
# Mac/Linux
npm start -- --reset-cache 2>&1 | grep '\[Auth\]\|\[Login\]\|\[useLogin\]\|\[Index\]\|\[RootLayout\]'

# Windows PowerShell
npm start -- --reset-cache 2>&1 | Select-String -Pattern '\[Auth\]|\[Login\]|\[useLogin\]|\[Index\]|\[RootLayout\]'
```

### SecureStore 확인
```typescript
// 토큰 확인
import * as SecureStore from 'expo-secure-store';
const token = await SecureStore.getItemAsync('auth-storage');
console.log('Stored token:', token);
```

### Redux DevTools (선택사항)
```typescript
// Zustand DevTools 활성화
import { devtools } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // ...
      }),
      // ...
    ),
    { name: 'AuthStore' }
  )
);
```

---

## 문제 해결

### "토큰이 만료되었습니다"
→ refresh token API가 올바르게 작동하는지 확인
→ `src/api/auth.ts`의 `refreshTokenApi` 확인

### 무한 리다이렉트
→ `isAuthenticated` 상태가 올바르게 설정되는지 확인
→ `app/_layout.tsx`의 초기화 로직 확인

### 로그인 후 홈 화면으로 이동하지 않음
→ `isAuthenticated` 상태 변경이 감지되는지 확인
→ `app/(auth)/login.tsx`의 useEffect 확인

### 앱 시작 시 화면이 깜빡임
→ Splash Screen 설정 확인
→ `isHydrated` 플래그 타이밍 확인

---

## 체크리스트

- [ ] 시나리오 1: 신규 설치
- [ ] 시나리오 2: 로그인 성공
- [ ] 시나리오 3: 로그인 실패
- [ ] 시나리오 4: 앱 재시작
- [ ] 시나리오 5: 폼 검증
- [ ] 시나리오 6: 로그아웃 후 재로그인
- [ ] 성능 테스트: 로그인 속도
- [ ] 성능 테스트: 메모리 누수

---

## 결과 보고

테스트 완료 후 아래 정보를 기록:

```markdown
### 테스트 결과

**날짜**: 2026-02-10
**환경**: iOS Simulator / Android Emulator / 실제 디바이스
**OS 버전**: iOS 17.0 / Android 13

#### 통과한 시나리오
- [ ] 시나리오 1
- [ ] 시나리오 2
- [ ] 시나리오 3
- [ ] 시나리오 4
- [ ] 시나리오 5
- [ ] 시나리오 6

#### 발견된 문제
1. [문제 설명]
   - 재현 방법: [...]
   - 기대 결과: [...]
   - 실제 결과: [...]
   - 로그: [...]

#### 개선 제안
1. [...]
```
