# 시니어 모드 폰트 스케일링 구현 - 학습 내용

## 2026-02-10

### 구현 개요

시니어 모드에서 폰트 크기가 자동으로 1.2배 확대되도록 구현했습니다.

### 핵심 패턴

#### 1. Context를 통한 전역 상태 공유

**SeniorModeContext** (`src/contexts/SeniorModeContext.tsx`):
- `useUIStore`의 `isSeniorMode`를 구독
- `fontScale` (1.0 또는 1.2) 제공
- `useSeniorMode()` 훅으로 앱 전체에서 사용 가능

```typescript
// 사용 예시
const { isSeniorMode, fontScale } = useSeniorMode();
const fontSize = 16 * fontScale; // 시니어: 19.2, 일반: 16
```

#### 2. 래핑 컴포넌트를 통한 자동 스케일링

**SText** (`src/components/ui/SText.tsx`):
- Tamagui의 `Text`를 래핑
- `fontSize` prop을 자동으로 `fontScale`만큼 곱함
- 모든 Tamagui Text props 지원 (color, fontWeight 등)

```typescript
<SText fontSize={16} color="$gray900">
  {/* 시니어 모드: 19.2px, 일반: 16px */}
</SText>
```

#### 3. Provider 계층 구조

`app/_layout.tsx`에서 Provider 순서:
1. `TamaguiProvider` (최상위)
2. `Theme` (테마 전환)
3. `SeniorModeProvider` (폰트 스케일링)
4. `PersistQueryClientProvider` (데이터 캐싱)

### 설정 화면 Tamagui 전환

#### React Native → Tamagui 마이그레이션 패턴

1. **StyleSheet 제거**
   - `StyleSheet.create()` 삭제
   - 모든 스타일을 Tamagui props로 변환

2. **컴포넌트 교체**
   ```tsx
   // Before
   <View style={styles.section}>
     <Text style={styles.title}>제목</Text>
   </View>

   // After
   <YStack px="$4" py="$4">
     <SText fontSize={16} color="$gray900">제목</SText>
   </YStack>
   ```

3. **색상 토큰 활용**
   - `#0066CC` → `$primary`
   - `#2C2C2C` → `$gray900`
   - `#C9C9C9` → `$gray300`

4. **간격 토큰 활용**
   - `padding: 16` → `px="$4" py="$4"`
   - `marginTop: 16` → `mt="$4"`
   - `marginBottom: 12` → `mb="$3"`

### Switch 컴포넌트 차이점

**React Native Switch**:
```tsx
<Switch
  value={isSeniorMode}
  onValueChange={toggleSeniorMode}
  trackColor={{ false: '#C9C9C9', true: '#0064FF' }}
  thumbColor="#FFFFFF"
/>
```

**Tamagui Switch**:
```tsx
<Switch
  checked={isSeniorMode}
  onCheckedChange={toggleSeniorMode}
  backgroundColor={isSeniorMode ? '$primary' : '$gray300'}
>
  <Switch.Thumb backgroundColor="$white" />
</Switch>
```

주요 차이:
- `value` → `checked`
- `onValueChange` → `onCheckedChange`
- `trackColor` → `backgroundColor` (조건부)
- `thumbColor` → `Switch.Thumb`의 `backgroundColor`

### 성공 요인

1. **단일 책임 원칙**: SText는 폰트 스케일링만, Context는 상태 관리만
2. **컴포지션**: Tamagui Text를 래핑하여 모든 기능 유지
3. **타입 안정성**: `TextProps`를 그대로 사용하여 타입 안전성 보장
4. **일관된 패턴**: 모든 텍스트에 SText 사용 → 일관된 시니어 모드 지원

### 향후 확장 가능성

1. **다국어 지원**: Context에 locale 추가 가능
2. **접근성**: 시스템 폰트 스케일과 연동 가능
3. **테마 연동**: 시니어 테마와 폰트 스케일 동기화
4. **성능 최적화**: React.memo로 불필요한 리렌더링 방지

### 주의사항

1. **Provider 필수**: `useSeniorMode()`는 반드시 `SeniorModeProvider` 내부에서 사용
2. **숫자만 스케일링**: `fontSize={16}`은 스케일링되지만, `fontSize="$4"`는 토큰이므로 그대로
3. **일관성 유지**: 기존 `Text` 대신 항상 `SText` 사용 권장

### 테스트 가이드

1. **시니어 모드 토글**:
   - 설정 화면에서 시니어 모드 ON/OFF
   - 모든 텍스트 크기가 즉시 변경되는지 확인

2. **테마 전환과 동시 동작**:
   - 시니어 모드 + Light 테마
   - 시니어 모드 + Dark 테마 (향후)
   - 색상과 폰트 크기가 모두 정상 적용되는지 확인

3. **타입 안전성**:
   - `npm run typecheck` 실행
   - 모든 타입 에러가 없어야 함

### 관련 파일

- `src/contexts/SeniorModeContext.tsx` - Context 정의
- `src/components/ui/SText.tsx` - 래핑 컴포넌트
- `app/_layout.tsx` - Provider 추가
- `app/(main)/(tabs)/settings.tsx` - Tamagui 전환 완료
- `src/theme/tokens.ts` - `SENIOR_SCALE_FACTOR` 상수 정의

### 기술적 결정

1. **Context vs Zustand 직접 사용**:
   - Context 선택 이유: 컴포넌트 계층에서 명확한 의존성 표현
   - zustand를 직접 사용하면 Provider 없이도 동작하지만, 의존성이 암시적

2. **래핑 vs HOC**:
   - 래핑 선택 이유: 더 간단한 API, 타입 추론 용이
   - HOC는 복잡도 증가 및 타입 추론 어려움

3. **자동 스케일링 vs 수동 스케일링**:
   - 자동 선택 이유: 개발자가 매번 계산할 필요 없음
   - 일관성 보장 및 실수 방지
