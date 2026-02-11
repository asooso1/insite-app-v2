# 시니어 모드 개발 가이드라인

> 이 문서는 Insite App v2.0의 시니어 모드 개발 규칙을 정의합니다.
> 모든 새 페이지 및 컴포넌트 개발 시 반드시 이 가이드를 따라주세요.

## 1. 시니어 모드 원칙

### 1.1 핵심 원칙
- **유니버설 디자인**: 시니어 전용이 아닌, 모든 연령이 편하게 사용할 수 있는 디자인
- **명확성**: 무엇을 눌러야 하는지 한눈에 파악 가능
- **두려움 제거**: 실수해도 되돌릴 수 있다는 안심감 제공
- **텍스트 우선**: 아이콘만 있는 버튼 지양, 항상 텍스트 라벨 함께 표시

### 1.2 접근성 기준
| 항목 | 기본 모드 | 시니어 모드 |
|------|----------|------------|
| 최소 폰트 크기 | 14px | 18px |
| 권장 폰트 크기 | 16px | 20px |
| 최소 터치 영역 | 44px | 56px |
| 버튼 높이 | 48px | 60px |
| 색상 대비 | 3:1 | 4.5:1 |
| 아이콘 크기 | 24px | 32px |

## 2. 필수 적용 사항

### 2.1 페이지 개발 시 필수 체크리스트
- [ ] `useSeniorStyles()` 훅으로 시니어 모드 상태 감지
- [ ] 조건부 렌더링으로 시니어/일반 UI 분기
- [ ] 모든 텍스트에 `SText` 또는 fontSize 조건부 적용
- [ ] 터치 영역 56px 이상 확보
- [ ] 아이콘에 텍스트 라벨 동반

### 2.2 필수 import
```typescript
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SText } from '@/components/ui/SText';
import { SeniorButton, SeniorCard } from '@/components/ui';
import { AppIcon } from '@/components/icons';
```

## 3. 컴포넌트 사용법

### 3.1 텍스트 (SText)
```tsx
// ✅ 권장: SText 사용
<SText fontSize={16} color="$gray900">
  시니어 모드에서 자동으로 1.2배 확대됩니다
</SText>

// ✅ 권장: 조건부 fontSize
const { isSeniorMode, styles } = useSeniorStyles();
<Text fontSize={isSeniorMode ? styles.fontSize.large : 16}>
  조건부 스타일링
</Text>
```

### 3.2 버튼 (SeniorButton)
```tsx
// ✅ 시니어 모드: 항상 텍스트 라벨 필수
<SeniorButton
  label="작업 완료"
  onPress={handleComplete}
  variant="primary"
/>

// ✅ 아이콘 + 텍스트
<SeniorIconButton
  icon="check"
  label="확인"
  onPress={handleConfirm}
/>
```

### 3.3 카드 (SeniorCard)
```tsx
<SeniorCard>
  <SeniorCardHeader
    title="작업 상세"
    action="수정"
    onAction={handleEdit}
  />
  <SeniorCardDescription>
    상세 내용이 여기에 표시됩니다.
  </SeniorCardDescription>
  <SeniorCardFooter>
    <SeniorButton label="확인" onPress={handleConfirm} />
  </SeniorCardFooter>
</SeniorCard>
```

### 3.4 아이콘 (AppIcon)
```tsx
// 시니어 모드에서 자동으로 크기 확대
<AppIcon name="work" size="md" color="$primary" />

// 크기 옵션
// xs: 16px (시니어: 20px)
// sm: 20px (시니어: 24px)
// md: 24px (시니어: 32px)
// lg: 32px (시니어: 40px)
// xl: 40px (시니어: 48px)
```

### 3.5 조건부 렌더링 패턴
```tsx
const { isSeniorMode, styles } = useSeniorStyles();

return (
  <YStack>
    {isSeniorMode ? (
      // 시니어 모드 UI
      <SeniorCard>
        <SeniorCardTitle>작업 목록</SeniorCardTitle>
        {items.map(item => (
          <SeniorCardListItem
            key={item.id}
            label={item.title}
            value={item.status}
            onPress={() => navigate(item.id)}
          />
        ))}
      </SeniorCard>
    ) : (
      // 일반 모드 UI
      <GlassCard>
        {items.map(item => (
          <WorkOrderCard key={item.id} {...item} />
        ))}
      </GlassCard>
    )}
  </YStack>
);
```

## 4. 스타일 상수 참조

### 4.1 폰트 크기 (SENIOR_FONT_SIZE)
```typescript
{
  small: 18,    // 보조 텍스트
  medium: 20,   // 본문
  large: 24,    // 제목
  xlarge: 28,   // 주요 제목
  title: 32,    // 페이지 타이틀
  display: 36,  // 강조 숫자
}
```

### 4.2 터치 영역 (SENIOR_TOUCH_TARGET)
```typescript
{
  min: 56,      // 최소 터치 영역
  button: 60,   // 버튼 높이
  listItem: 72, // 리스트 아이템
  tabBar: 72,   // 탭바 높이 (iOS 100px)
}
```

### 4.3 간격 (SENIOR_SPACING)
```typescript
{
  buttonGap: 12,     // 버튼 사이 간격
  sectionGap: 28,    // 섹션 사이 간격
  cardPadding: 24,   // 카드 내부 패딩
  itemGap: 16,       // 아이템 사이 간격
}
```

### 4.4 색상 (SENIOR_COLORS) - 고대비
```typescript
{
  primary: '#004D99',       // 더 진한 파란색
  primaryDark: '#003366',   // 눌림 상태
  text: '#000000',          // 완전한 검정
  textSecondary: '#333333', // 보조 텍스트
  border: '#666666',        // 눈에 띄는 테두리
  buttonBorder: '#000000',  // 버튼 테두리
  background: '#FFFFFF',    // 흰색 배경
}
```

## 5. 페이지별 적용 예시

### 5.1 목록 화면 템플릿
```tsx
export default function ListScreen() {
  const { isSeniorMode, styles } = useSeniorStyles();

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* 헤더 */}
      <GradientHeader
        title="작업 목록"
        height={isSeniorMode ? 200 : 180}
      />

      {/* 필터 */}
      <XStack
        paddingHorizontal="$4"
        gap={isSeniorMode ? "$3" : "$2"}
      >
        {filters.map(filter => (
          <FilterPill
            key={filter.id}
            label={filter.label}
            active={filter.active}
            minHeight={isSeniorMode ? 48 : 36}
          />
        ))}
      </XStack>

      {/* 리스트 */}
      <FlatList
        data={items}
        renderItem={({ item }) =>
          isSeniorMode ? (
            <SeniorCardListItem {...item} />
          ) : (
            <CompactCard {...item} />
          )
        }
      />
    </YStack>
  );
}
```

### 5.2 상세 화면 템플릿
```tsx
export default function DetailScreen() {
  const { isSeniorMode, styles } = useSeniorStyles();

  return (
    <ScrollView>
      {isSeniorMode ? (
        <SeniorCard>
          <SeniorCardTitle>{data.title}</SeniorCardTitle>
          <SeniorCardDescription>{data.description}</SeniorCardDescription>

          <YStack gap="$4" marginTop="$4">
            <SeniorCardListItem
              label="담당자"
              value={data.assignee}
            />
            <SeniorCardListItem
              label="상태"
              value={data.status}
              badge={<SeniorStatusBadge status={data.status} />}
            />
          </YStack>

          <SeniorCardFooter>
            <SeniorButton label="수정" variant="outline" />
            <SeniorButton label="완료" variant="primary" />
          </SeniorCardFooter>
        </SeniorCard>
      ) : (
        <GlassCard>
          {/* 일반 모드 UI */}
        </GlassCard>
      )}
    </ScrollView>
  );
}
```

### 5.3 폼 화면 템플릿
```tsx
export default function FormScreen() {
  const { isSeniorMode, styles } = useSeniorStyles();

  return (
    <KeyboardAvoidingView>
      <YStack gap={isSeniorMode ? "$6" : "$4"}>
        {/* 입력 필드 */}
        <YStack gap="$2">
          <SText
            fontSize={isSeniorMode ? 18 : 14}
            fontWeight="600"
          >
            제목
          </SText>
          <TextField
            placeholder="제목을 입력하세요"
            minHeight={isSeniorMode ? 60 : 48}
            fontSize={isSeniorMode ? 18 : 16}
          />
        </YStack>

        {/* 제출 버튼 */}
        {isSeniorMode ? (
          <SeniorButton label="저장하기" onPress={handleSubmit} />
        ) : (
          <Button onPress={handleSubmit}>저장</Button>
        )}
      </YStack>
    </KeyboardAvoidingView>
  );
}
```

## 6. 금지 사항

### ❌ 하지 말아야 할 것
1. 아이콘만 있는 버튼 (시니어 모드에서 항상 텍스트 라벨 필요)
2. 12px 이하 폰트 사용
3. 44px 미만 터치 영역
4. 낮은 색상 대비 (3:1 미만)
5. 호버/스와이프만으로 접근 가능한 기능
6. 시간 제한이 있는 인터랙션
7. 복잡한 제스처 (핀치, 멀티터치)

### ✅ 해야 할 것
1. 모든 버튼에 명확한 텍스트 라벨
2. 충분한 터치 영역 (56px+)
3. 고대비 색상 조합
4. 명확한 시각적 피드백
5. 실수 시 되돌리기 옵션
6. 단계별 안내 (Progressive Disclosure)

## 7. 테스트 체크리스트

새 페이지 개발 완료 후 반드시 확인:

- [ ] 시니어 모드 토글 시 UI 정상 전환
- [ ] 모든 텍스트 18px 이상 (시니어 모드)
- [ ] 모든 버튼 56px 이상 터치 영역
- [ ] 색상 대비 4.5:1 이상
- [ ] 아이콘에 텍스트 라벨 표시
- [ ] 에러 메시지 명확하게 표시
- [ ] 로딩 상태 명확하게 표시

---

*마지막 업데이트: 2026-02-10*
*참고: src/theme/seniorMode.ts, src/contexts/SeniorModeContext.tsx*
