# src/components/ - UI 컴포넌트 규칙

> 이 디렉토리는 재사용 가능한 UI 컴포넌트를 포함합니다.
> 모든 컴포넌트는 시니어 모드를 지원하며, Tamagui를 기반으로 구현됩니다.

## 폴더 구조

```
src/components/
├── ui/               # 기본 UI 컴포넌트
│   ├── Button.tsx           # 기본 버튼
│   ├── SeniorButton.tsx     # 시니어 모드 버튼
│   ├── SText.tsx            # 시니어 모드 텍스트
│   ├── TextField.tsx        # 입력 필드
│   ├── Card.tsx             # 기본 카드
│   ├── SeniorCard.tsx       # 시니어 모드 카드
│   ├── GlassCard.tsx        # 글라스모피즘 카드
│   ├── Badge.tsx            # 배지
│   ├── Avatar.tsx           # 아바타
│   ├── Switch.tsx           # 스위치
│   ├── Checkbox.tsx         # 체크박스
│   ├── Modal.tsx            # 모달
│   ├── ProgressBar.tsx      # 프로그레스바
│   └── ...
│
├── icons/            # 아이콘
│   ├── AppIcon.tsx          # 통합 아이콘 컴포넌트
│   └── TabIcon.tsx          # 탭바 아이콘
│
├── forms/            # Form 컴포넌트
│   ├── FormField.tsx        # Form 필드 래퍼
│   ├── FormSelect.tsx       # 선택 필드
│   └── FormDatePicker.tsx   # 날짜 선택
│
├── layout/           # 레이아웃 컴포넌트
│   ├── GradientHeader.tsx   # 그라디언트 헤더
│   ├── SafeContainer.tsx    # SafeArea 래퍼
│   └── SectionHeader.tsx    # 섹션 헤더
│
└── feedback/         # 피드백 컴포넌트
    ├── Toast.tsx            # 토스트
    ├── LoadingOverlay.tsx   # 로딩 오버레이
    └── EmptyState.tsx       # 빈 상태
```

## 컴포넌트 분류

### 1. 기본 UI (ui/)

기본적인 UI 요소들을 포함합니다. 모든 컴포넌트는 시니어 모드를 지원합니다.

| 컴포넌트 | 용도 | 시니어 모드 |
|---------|------|------------|
| `Button` | 기본 버튼 | 자동 지원 |
| `SeniorButton` | 시니어 전용 버튼 | 전용 |
| `SText` | 자동 스케일링 텍스트 | 자동 지원 |
| `TextField` | 입력 필드 | 자동 지원 |
| `Card` | 기본 카드 | 자동 지원 |
| `SeniorCard` | 시니어 전용 카드 | 전용 |
| `GlassCard` | 글라스모피즘 카드 | 일반 모드 전용 |
| `Badge` | 상태 배지 | 자동 지원 |
| `Avatar` | 아바타 | 자동 지원 |
| `Switch` | 스위치 | 자동 지원 |

### 2. 아이콘 (icons/)

통합된 아이콘 시스템을 제공합니다.

| 컴포넌트 | 용도 |
|---------|------|
| `AppIcon` | 앱 전역 아이콘 |
| `TabIcon` | 탭바 전용 아이콘 |

### 3. Form (forms/)

Form 관련 컴포넌트를 포함합니다.

| 컴포넌트 | 용도 |
|---------|------|
| `FormField` | react-hook-form 래퍼 |
| `FormSelect` | 선택 필드 |
| `FormDatePicker` | 날짜 선택 필드 |

### 4. 레이아웃 (layout/)

화면 레이아웃 관련 컴포넌트입니다.

| 컴포넌트 | 용도 |
|---------|------|
| `GradientHeader` | 그라디언트 헤더 |
| `SafeContainer` | SafeArea 래퍼 |
| `SectionHeader` | 섹션 헤더 |

### 5. 피드백 (feedback/)

사용자 피드백 관련 컴포넌트입니다.

| 컴포넌트 | 용도 |
|---------|------|
| `Toast` | 토스트 메시지 |
| `LoadingOverlay` | 전체 화면 로딩 |
| `EmptyState` | 빈 상태 화면 |

## 컴포넌트 작성 규칙

### 템플릿

```typescript
// src/components/ui/ExampleComponent.tsx

import React from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { AppIcon } from '@/components/icons';
import type { ReactNode } from 'react';

/**
 * 예시 컴포넌트
 *
 * 시니어 모드를 자동으로 지원하며,
 * 폰트 크기와 터치 영역이 자동으로 조정됩니다.
 */
interface ExampleComponentProps {
  /** 컴포넌트 제목 */
  title: string;
  /** 부가 설명 (선택) */
  description?: string;
  /** 아이콘 이름 (선택) */
  icon?: string;
  /** 클릭 핸들러 */
  onPress?: () => void;
  /** 자식 요소 */
  children?: ReactNode;
}

export function ExampleComponent({
  title,
  description,
  icon,
  onPress,
  children,
}: ExampleComponentProps) {
  const { isSeniorMode, styles } = useSeniorStyles();

  return (
    <YStack
      padding={isSeniorMode ? styles.spacing.cardPadding : '$4'}
      minHeight={isSeniorMode ? styles.touchTarget.min : 44}
      backgroundColor="$background"
      borderRadius="$4"
      pressStyle={{ opacity: 0.8 }}
      onPress={onPress}
      gap="$2"
    >
      {/* 헤더 */}
      <XStack alignItems="center" gap="$2">
        {icon && (
          <AppIcon
            name={icon}
            size={isSeniorMode ? 'lg' : 'md'}
            color="$primary"
          />
        )}
        <Text
          fontSize={isSeniorMode ? styles.fontSize.large : 18}
          fontWeight="600"
          color="$gray900"
        >
          {title}
        </Text>
      </XStack>

      {/* 설명 */}
      {description && (
        <Text
          fontSize={isSeniorMode ? styles.fontSize.medium : 14}
          color="$gray600"
        >
          {description}
        </Text>
      )}

      {/* 자식 요소 */}
      {children}
    </YStack>
  );
}

// 기본값 설정
ExampleComponent.defaultProps = {
  description: undefined,
  icon: undefined,
  onPress: undefined,
  children: undefined,
};
```

## 시니어 모드 컴포넌트

### 1. SText - 자동 스케일링 텍스트

```tsx
import { SText } from '@/components/ui/SText';

// 기본 사용
<SText fontSize={16}>
  시니어 모드에서 자동으로 1.2배 확대됩니다.
</SText>

// 폰트 가중치
<SText fontSize={18} fontWeight="600">
  제목 텍스트
</SText>

// 색상
<SText fontSize={14} color="$gray600">
  부가 설명
</SText>
```

### 2. SeniorButton - 시니어 전용 버튼

```tsx
import { SeniorButton } from '@/components/ui/SeniorButton';

// 기본 버튼
<SeniorButton
  label="확인"
  onPress={handleConfirm}
  variant="primary"
/>

// 아웃라인 버튼
<SeniorButton
  label="취소"
  onPress={handleCancel}
  variant="outline"
/>

// 비활성화
<SeniorButton
  label="완료"
  onPress={handleComplete}
  disabled={!isValid}
/>

// 아이콘 포함
<SeniorButton
  label="저장"
  icon="save"
  onPress={handleSave}
/>
```

### 3. SeniorCard - 시니어 전용 카드

```tsx
import {
  SeniorCard,
  SeniorCardTitle,
  SeniorCardDescription,
  SeniorCardListItem,
  SeniorCardFooter,
} from '@/components/ui/SeniorCard';

// 기본 카드
<SeniorCard>
  <SeniorCardTitle>작업 상세</SeniorCardTitle>
  <SeniorCardDescription>
    작업 내용이 여기에 표시됩니다.
  </SeniorCardDescription>

  <YStack gap="$3" marginTop="$4">
    <SeniorCardListItem
      label="담당자"
      value="홍길동"
    />
    <SeniorCardListItem
      label="상태"
      value="진행중"
      badge={<Badge status="inProgress" />}
    />
  </YStack>

  <SeniorCardFooter>
    <SeniorButton label="수정" variant="outline" />
    <SeniorButton label="완료" variant="primary" />
  </SeniorCardFooter>
</SeniorCard>
```

### 4. AppIcon - 통합 아이콘

```tsx
import { AppIcon } from '@/components/icons';

// 기본 사용
<AppIcon name="work" size="md" color="$primary" />

// 크기 옵션 (시니어 모드에서 자동 확대)
<AppIcon name="home" size="xs" /> // 16px → 20px
<AppIcon name="scan" size="sm" /> // 20px → 24px
<AppIcon name="work" size="md" /> // 24px → 32px
<AppIcon name="calendar" size="lg" /> // 32px → 40px
<AppIcon name="settings" size="xl" /> // 40px → 48px

// 사용 가능한 아이콘 목록
// home, work, scan, calendar, settings, patrol, alarm, search,
// check, close, edit, delete, add, filter, sort, refresh,
// user, bell, mail, phone, location, camera, image, file,
// arrow-up, arrow-down, arrow-left, arrow-right, chevron-down
```

## 조건부 렌더링 패턴

### 패턴 1: 완전히 다른 UI

```tsx
const { isSeniorMode } = useSeniorStyles();

return (
  <YStack>
    {isSeniorMode ? (
      // 시니어 모드 전용 UI
      <SeniorCard>
        <SeniorCardTitle>제목</SeniorCardTitle>
        <SeniorButton label="확인" />
      </SeniorCard>
    ) : (
      // 일반 모드 전용 UI
      <GlassCard>
        <Text>제목</Text>
        <Button>확인</Button>
      </GlassCard>
    )}
  </YStack>
);
```

### 패턴 2: 스타일만 조건부

```tsx
const { isSeniorMode, styles } = useSeniorStyles();

return (
  <YStack
    padding={isSeniorMode ? styles.spacing.cardPadding : '$4'}
    gap={isSeniorMode ? '$4' : '$2'}
  >
    <Text fontSize={isSeniorMode ? styles.fontSize.large : 16}>
      제목
    </Text>
    <Button
      minHeight={isSeniorMode ? styles.touchTarget.button : 48}
    >
      확인
    </Button>
  </YStack>
);
```

### 패턴 3: SText 자동 스케일링

```tsx
// 가장 간단한 방법 (권장)
<SText fontSize={16}>
  자동으로 스케일링됩니다
</SText>

// 시니어 모드: 19.2px (16 * 1.2)
// 일반 모드: 16px
```

## 스타일 상수 참조

### 폰트 크기 (styles.fontSize)

```typescript
// 시니어 모드
{
  small: 18,    // 보조 텍스트
  medium: 20,   // 본문
  large: 24,    // 제목
  xlarge: 28,   // 주요 제목
  title: 32,    // 페이지 타이틀
  display: 36,  // 강조 숫자
}

// 일반 모드
{
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
  title: 24,
  hero: 28,
}
```

### 터치 영역 (styles.touchTarget)

```typescript
// 시니어 모드
{
  min: 56,         // 최소 터치 영역
  button: 60,      // 버튼 높이
  listItem: 72,    // 리스트 아이템
  tabBar: 72,      // 탭바 아이템 (iOS는 100px)
  iconButton: 56,  // 아이콘 버튼
}

// 일반 모드
{
  min: 44,
  button: 48,
  tabBar: 64,
  listItem: 56,
  iconButton: 44,
}
```

### 간격 (styles.spacing)

```typescript
// 시니어 모드
{
  buttonGap: 12,     // 버튼 사이 간격
  sectionGap: 28,    // 섹션 사이 간격
  cardPadding: 24,   // 카드 내부 패딩
  listItemGap: 16,   // 리스트 아이템 사이 간격
  inlineGap: 12,     // 인라인 요소 간격
}

// 일반 모드
{
  buttonGap: 8,
  sectionGap: 20,
  cardPadding: 16,
  listItemGap: 12,
  inlineGap: 8,
}
```

### 아이콘 크기 (styles.iconSize)

```typescript
// 시니어 모드
{
  small: 24,    // 작은 아이콘
  medium: 32,   // 중간 아이콘
  large: 40,    // 큰 아이콘
  tabBar: 32,   // 탭바 아이콘
  emoji: 32,    // 이모지 대체
}

// 일반 모드
{
  small: 20,
  medium: 24,
  large: 32,
  tabBar: 24,
  emoji: 24,
}
```

### 색상 (styles.colors)

```typescript
// 시니어 모드 - 고대비
{
  primary: '#004D99',       // 진한 파란색
  primaryDark: '#003366',   // 눌림 상태
  text: '#000000',          // 완전한 검정
  textSecondary: '#333333', // 보조 텍스트
  border: '#666666',        // 눈에 띄는 테두리
  buttonBorder: '#000000',  // 버튼 테두리
}

// 일반 모드
{
  primary: '#0066CC',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
}
```

## 금지 사항

### ❌ 하지 말 것

1. **아이콘만 있는 버튼** (시니어 모드)
   ```tsx
   // ❌ 잘못된 예
   <Button icon="check" />

   // ✅ 올바른 예
   <SeniorButton icon="check" label="확인" />
   ```

2. **작은 폰트 크기**
   ```tsx
   // ❌ 잘못된 예 (시니어 모드에서 18px 미만)
   <Text fontSize={12}>작은 텍스트</Text>

   // ✅ 올바른 예
   <SText fontSize={14}>읽기 쉬운 텍스트</SText>
   ```

3. **낮은 색상 대비**
   ```tsx
   // ❌ 잘못된 예 (3:1 미만)
   <Text color="#CCCCCC">회색 텍스트</Text>

   // ✅ 올바른 예
   <Text color="$gray600">적절한 대비</Text>
   ```

4. **StyleSheet 사용**
   ```tsx
   // ❌ 잘못된 예
   import { StyleSheet } from 'react-native';
   const styles = StyleSheet.create({ ... });

   // ✅ 올바른 예
   import { YStack } from 'tamagui';
   <YStack padding="$4" />
   ```

## 테스트 체크리스트

새 컴포넌트 개발 완료 후 반드시 확인:

- [ ] 시니어 모드 토글 시 정상 동작
- [ ] Props 타입 정의 및 JSDoc 작성
- [ ] 최소 터치 영역 56px (시니어 모드)
- [ ] 색상 대비 4.5:1 이상
- [ ] 아이콘에 텍스트 라벨 동반 (버튼)
- [ ] 한국어 주석 작성
- [ ] TypeScript strict mode 준수

## 참고 문서

- [시니어 모드 가이드](../../docs/SENIOR-MODE-GUIDE.md)
- [화면 개발 가이드](../../app/AGENTS.md)
- [소스 코드 규칙](../AGENTS.md)

---

_마지막 업데이트: 2026-02-10_
