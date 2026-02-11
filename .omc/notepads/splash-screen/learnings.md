# Splash Screen 구현 - 학습 내용

## 구현 날짜
2026-02-08

## 구현 항목

### 1. expo-splash-screen 설치
- 패키지: `expo-splash-screen`
- 네이티브 스플래시 화면 제어를 위한 Expo 공식 라이브러리

### 2. SplashScreen 컴포넌트 생성
**파일**: `/src/components/SplashScreen.tsx`

**주요 기능**:
- HDC Insite 로고 표시 (텍스트로 구현, 추후 이미지로 교체 가능)
- 로딩 인디케이터 (Spinner)
- 선택적 로딩 메시지 표시
- Tamagui를 사용한 중앙 정렬 레이아웃
- 하단 버전 정보 표시

**Props**:
- `showMessage?: boolean` - 로딩 메시지 표시 여부
- `message?: string` - 커스텀 로딩 메시지

**디자인**:
- 배경색: Primary 브랜드 컬러 (#0064FF)
- 텍스트 색상: 흰색
- 중앙 정렬 레이아웃
- 시니어 모드 자동 지원 (Tamagui 테마 시스템 활용)

### 3. Root Layout 통합
**파일**: `/app/_layout.tsx`

**변경 사항**:
1. **expo-splash-screen import 추가**
   ```typescript
   import * as SplashScreen from 'expo-splash-screen';
   ```

2. **네이티브 스플래시 화면 유지**
   ```typescript
   SplashScreen.preventAutoHideAsync();
   ```
   - 앱 로드 시 네이티브 스플래시 화면이 자동으로 숨겨지지 않도록 설정

3. **앱 초기화 로직 구현**
   ```typescript
   const initializeApp = useCallback(async () => {
     try {
       // 1. 인증 상태 복원 (hydrate)
       hydrate();

       // 2. 토큰 유효성 검증 (checkAuth)
       await checkAuth();

       // 3. 스플래시 화면 숨김
       await SplashScreen.hideAsync();
     } catch (error) {
       console.error('앱 초기화 오류:', error);
       await SplashScreen.hideAsync();
     }
   }, [hydrate, checkAuth]);
   ```

4. **커스텀 스플래시 화면 표시**
   - `isHydrated`가 `false`일 때 커스텀 스플래시 화면 표시
   - TamaguiProvider로 래핑하여 테마 시스템 사용 가능

### 4. app.config.ts 업데이트
**변경 사항**:
- `jsEngine: 'hermes'` 추가 (성능 최적화)
- 기존 splash 설정 유지
  - 이미지: `./assets/splash-icon.png`
  - 배경색: `#0064FF`
  - resizeMode: `contain`

## 동작 흐름

```
1. 앱 시작
   ↓
2. 네이티브 스플래시 화면 표시 (expo-splash-screen)
   ↓
3. Root Layout 로드
   ↓
4. SplashScreen.preventAutoHideAsync() 호출
   ↓
5. Zustand 상태 복원 대기 (isHydrated === false)
   ↓
6. 커스텀 SplashScreen 컴포넌트 표시
   ↓
7. isHydrated === true 되면
   ↓
8. initializeApp() 실행
   - 인증 상태 복원 (hydrate)
   - 토큰 유효성 검증 (checkAuth)
   ↓
9. SplashScreen.hideAsync() 호출
   ↓
10. 메인 화면 표시
```

## 기술적 포인트

### 1. 이중 스플래시 화면 전략
- **네이티브 스플래시**: 앱 로드 초기 단계
- **커스텀 스플래시**: 상태 복원 및 초기화 단계

이 전략을 사용하는 이유:
- 네이티브 스플래시는 JavaScript 번들이 로드되기 전에 표시됨
- 커스텀 스플래시는 React가 로드된 후 상태 복원 중에 표시됨
- 매끄러운 전환 제공

### 2. preventAutoHideAsync 패턴
```typescript
// 파일 최상단에서 즉시 호출 (함수 외부)
SplashScreen.preventAutoHideAsync();
```
- React 컴포넌트 렌더링 전에 호출되어야 함
- 모듈 로드 시 즉시 실행

### 3. useCallback 사용
```typescript
const initializeApp = useCallback(async () => {
  // ...
}, [hydrate, checkAuth]);
```
- 의존성 배열 관리로 무한 루프 방지
- 메모이제이션으로 불필요한 재생성 방지

### 4. 에러 처리
```typescript
try {
  // 초기화 로직
} catch (error) {
  console.error('앱 초기화 오류:', error);
  // 오류가 있어도 스플래시 화면은 숨김
  await SplashScreen.hideAsync();
}
```
- 초기화 실패 시에도 앱이 멈추지 않도록 처리

## 테스트 포인트

### 수동 테스트 항목
1. [ ] 앱 시작 시 스플래시 화면 표시 확인
2. [ ] 로딩 메시지 표시 확인
3. [ ] 초기화 완료 후 메인 화면 전환 확인
4. [ ] 시니어 모드에서 스플래시 화면 확인 (폰트 크기 등)
5. [ ] iOS에서 동작 확인
6. [ ] Android에서 동작 확인

### 성능 테스트
1. [ ] 스플래시 화면 표시 시간 측정
2. [ ] 초기화 시간 측정
3. [ ] 메모리 사용량 확인

## 개선 가능 항목

### 1. 실제 로고 이미지 추가
현재는 텍스트로 "Insite" 표시:
```typescript
<Text fontSize={48} fontWeight="bold" color="$white">
  {APP_NAME}
</Text>
```

개선 방안:
```typescript
<Image
  source={require('@/assets/logo.png')}
  style={{ width: 200, height: 200 }}
  contentFit="contain"
/>
```

### 2. 애니메이션 추가
- 로고 페이드인 애니메이션
- Spinner 회전 애니메이션 커스터마이징
- 화면 전환 애니메이션

### 3. 프로그레스 바
초기화 진행 상태 표시:
```typescript
<Progress value={initProgress} max={100} />
```

### 4. 오류 표시
초기화 실패 시 사용자에게 알림:
```typescript
{error && (
  <Text color="$error">
    초기화에 실패했습니다. 다시 시도해주세요.
  </Text>
)}
```

## 관련 파일

### 생성된 파일
- `/src/components/SplashScreen.tsx`

### 수정된 파일
- `/app/_layout.tsx`
- `/app.config.ts`
- `/package.json` (expo-splash-screen 추가)

### 관련 파일
- `/src/stores/auth.store.ts` (hydrate, checkAuth 메서드 사용)
- `/src/theme/tamagui.config.ts` (테마 설정)
- `/src/constants/config.ts` (APP_NAME 상수)

## 참고 문서
- [Expo Splash Screen 공식 문서](https://docs.expo.dev/versions/latest/sdk/splash-screen/)
- [Tamagui Documentation](https://tamagui.dev/docs)
- [React Navigation - Auth Flow](https://reactnavigation.org/docs/auth-flow/)
