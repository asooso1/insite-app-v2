# app/ - 화면 개발 규칙

> 이 디렉토리는 Expo Router를 사용한 페이지(Screen)를 포함합니다.
> 모든 화면은 반드시 시니어 모드를 지원해야 하며, 비즈니스 로직은 hooks/로 분리합니다.

## 파일 구조

```
app/
├── (auth)/           # 인증 화면 그룹 (로그인 전)
│   ├── login.tsx     # 로그인
│   ├── auto-login.tsx # 자동 로그인
│   └── _layout.tsx   # 인증 레이아웃
│
├── (main)/           # 메인 화면 그룹 (로그인 후)
│   ├── (tabs)/       # 탭 네비게이터
│   │   ├── home.tsx      # 홈
│   │   ├── my-work.tsx   # 내 작업
│   │   ├── scan.tsx      # 스캔
│   │   ├── calendar.tsx  # 캘린더
│   │   └── settings.tsx  # 설정
│   │
│   ├── work/         # 작업지시 (Stack)
│   │   ├── index.tsx # 목록
│   │   └── [id]/     # 상세/수정
│   │
│   ├── patrol/       # 순찰점검 (Stack)
│   │   ├── index.tsx # 목록
│   │   └── [id]/     # 상세/수정
│   │
│   └── dashboard/    # 대시보드 (Tab)
│       └── index.tsx
│
├── (modals)/         # 모달 화면
│   └── confirm.tsx
│
├── _layout.tsx       # 루트 레이아웃
└── index.tsx         # 진입점
```

## 필수 체크리스트

새 화면 생성 시 반드시 확인:

- [ ] `useSeniorStyles()` 훅 import 및 사용
- [ ] 시니어 모드 조건부 렌더링 구현
- [ ] `SText` 또는 조건부 fontSize 적용
- [ ] 터치 영역 56px 이상 확보 (시니어 모드)
- [ ] 아이콘에 텍스트 라벨 동반
- [ ] SafeAreaInsets 적용 (상단/하단)
- [ ] 모든 주석은 한국어로 작성
- [ ] 비즈니스 로직은 hooks/로 분리

## 필수 import

```typescript
// 시니어 모드
import { useSeniorStyles } from '@/contexts/SeniorModeContext';

// UI 컴포넌트
import { SText, SeniorButton, SeniorCard } from '@/components/ui';
import { GlassCard, GradientHeader } from '@/components/ui';
import { AppIcon } from '@/components/icons';

// 라우팅
import { useRouter, useLocalSearchParams } from 'expo-router';

// 레이아웃
import { YStack, XStack, ScrollView } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
```

## 화면 템플릿

### 1. 목록 화면 (List Screen)

```tsx
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorCard, SeniorCardListItem } from '@/components/ui';
import { GlassCard, GradientHeader } from '@/components/ui';
import { useRouter } from 'expo-router';
import { YStack, XStack } from 'tamagui';
import { FlatList } from 'react-native';

/**
 * 작업 목록 화면
 *
 * 시니어 모드에서는 SeniorCardListItem을,
 * 일반 모드에서는 CompactCard를 렌더링합니다.
 */
export default function ListScreen() {
  const router = useRouter();
  const { isSeniorMode, styles } = useSeniorStyles();

  // 비즈니스 로직은 훅으로 분리
  const { items, isLoading } = useItems();

  const handleItemPress = (id: string) => {
    router.push(`/(main)/work/${id}`);
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* 헤더 */}
      <GradientHeader
        title="목록"
        height={isSeniorMode ? 200 : 180}
      />

      {/* 필터바 (옵션) */}
      <XStack
        paddingHorizontal="$4"
        paddingVertical="$3"
        gap={isSeniorMode ? "$3" : "$2"}
      >
        {/* 필터 컴포넌트 */}
      </XStack>

      {/* 리스트 */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          isSeniorMode ? (
            <SeniorCardListItem
              label={item.title}
              value={item.status}
              onPress={() => handleItemPress(item.id)}
            />
          ) : (
            <CompactCard {...item} onPress={() => handleItemPress(item.id)} />
          )
        }
        contentContainerStyle={{
          padding: isSeniorMode ? 24 : 16,
          gap: isSeniorMode ? 16 : 12,
        }}
      />
    </YStack>
  );
}
```

### 2. 상세 화면 (Detail Screen)

```tsx
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorCard, SeniorCardTitle, SeniorCardDescription } from '@/components/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, YStack } from 'tamagui';

/**
 * 작업 상세 화면
 *
 * URL 파라미터로 전달된 ID를 기반으로 상세 정보를 표시합니다.
 */
export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isSeniorMode, styles } = useSeniorStyles();

  // 비즈니스 로직은 훅으로 분리
  const { data, isLoading } = useItemDetail(id);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <ScrollView flex={1} backgroundColor="$background">
      {isSeniorMode ? (
        <SeniorCard margin="$4">
          <SeniorCardTitle>{data.title}</SeniorCardTitle>
          <SeniorCardDescription>{data.description}</SeniorCardDescription>

          <YStack gap="$4" marginTop="$4">
            <SeniorCardListItem label="담당자" value={data.assignee} />
            <SeniorCardListItem label="상태" value={data.status} />
            <SeniorCardListItem label="기한" value={data.dueDate} />
          </YStack>

          <YStack gap="$3" marginTop="$6">
            <SeniorButton
              label="수정하기"
              variant="outline"
              onPress={() => router.push(`/(main)/work/${id}/edit`)}
            />
            <SeniorButton
              label="완료하기"
              variant="primary"
              onPress={handleComplete}
            />
          </YStack>
        </SeniorCard>
      ) : (
        <GlassCard margin="$4">
          {/* 일반 모드 UI */}
        </GlassCard>
      )}
    </ScrollView>
  );
}
```

### 3. 폼 화면 (Form Screen)

```tsx
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SText, TextField, SeniorButton } from '@/components/ui';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { YStack, ScrollView } from 'tamagui';

/**
 * 작업 등록/수정 화면
 *
 * 시니어 모드에서는 입력 필드와 버튼의 크기가 확대됩니다.
 */
export default function FormScreen() {
  const { isSeniorMode, styles } = useSeniorStyles();

  // Form 상태 관리는 react-hook-form 사용 권장
  const { control, handleSubmit } = useForm();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView flex={1} backgroundColor="$background">
        <YStack padding="$4" gap={isSeniorMode ? "$6" : "$4"}>
          {/* 입력 필드 */}
          <YStack gap="$2">
            <SText fontSize={isSeniorMode ? 18 : 14} fontWeight="600">
              제목
            </SText>
            <TextField
              placeholder="제목을 입력하세요"
              minHeight={isSeniorMode ? 60 : 48}
              fontSize={isSeniorMode ? 18 : 16}
            />
          </YStack>

          <YStack gap="$2">
            <SText fontSize={isSeniorMode ? 18 : 14} fontWeight="600">
              설명
            </SText>
            <TextField
              placeholder="설명을 입력하세요"
              multiline
              numberOfLines={4}
              minHeight={isSeniorMode ? 120 : 100}
              fontSize={isSeniorMode ? 18 : 16}
            />
          </YStack>

          {/* 제출 버튼 */}
          {isSeniorMode ? (
            <SeniorButton
              label="저장하기"
              variant="primary"
              onPress={handleSubmit(onSubmit)}
            />
          ) : (
            <Button onPress={handleSubmit(onSubmit)}>
              저장
            </Button>
          )}
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

## 라우팅 패턴

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// 1. 목록 → 상세
router.push(`/(main)/work/${item.id}`);

// 2. 상세 → 수정
router.push(`/(main)/work/${item.id}/edit`);

// 3. 모달 열기
router.push('/(modals)/confirm');

// 4. 뒤로가기
router.back();

// 5. 교체 (히스토리 대체)
router.replace('/(main)/(tabs)/home');

// 6. 탭 전환
router.push('/(main)/(tabs)/settings');
```

## 시니어 모드 스타일 적용

### 조건부 스타일링

```tsx
const { isSeniorMode, styles } = useSeniorStyles();

// 1. 폰트 크기
<SText fontSize={isSeniorMode ? styles.fontSize.large : 16}>
  텍스트
</SText>

// 2. 터치 영역
<Pressable
  minHeight={isSeniorMode ? styles.touchTarget.min : 44}
  onPress={handlePress}
>
  {/* 내용 */}
</Pressable>

// 3. 간격
<YStack gap={isSeniorMode ? styles.spacing.sectionGap : "$4"}>
  {/* 내용 */}
</YStack>

// 4. 아이콘 크기
<AppIcon
  name="work"
  size={isSeniorMode ? "lg" : "md"}
  color="$primary"
/>
```

## 금지 사항

### ❌ 하지 말 것

1. **아이콘만 있는 버튼** (시니어 모드에서 항상 텍스트 필요)
   ```tsx
   // ❌ 잘못된 예
   <Button icon="check" />

   // ✅ 올바른 예
   <SeniorButton icon="check" label="확인" />
   ```

2. **작은 터치 영역** (44px 미만)
   ```tsx
   // ❌ 잘못된 예
   <Pressable height={32}>작은 버튼</Pressable>

   // ✅ 올바른 예
   <Pressable minHeight={isSeniorMode ? 56 : 44}>버튼</Pressable>
   ```

3. **UI 컴포넌트 내 비즈니스 로직**
   ```tsx
   // ❌ 잘못된 예
   export default function Screen() {
     const [data, setData] = useState([]);
     useEffect(() => {
       fetch('/api/data').then(res => setData(res));
     }, []);
     // ...
   }

   // ✅ 올바른 예 (hooks/로 분리)
   export default function Screen() {
     const { data } = useData(); // 훅으로 분리
     // ...
   }
   ```

4. **시니어 모드 미지원**
   ```tsx
   // ❌ 잘못된 예 (조건부 렌더링 없음)
   <Card>{content}</Card>

   // ✅ 올바른 예
   {isSeniorMode ? (
     <SeniorCard>{content}</SeniorCard>
   ) : (
     <CompactCard>{content}</CompactCard>
   )}
   ```

## 테스트 체크리스트

새 화면 개발 완료 후 반드시 확인:

- [ ] 시니어 모드 토글 시 UI 정상 전환
- [ ] 모든 텍스트 18px 이상 (시니어 모드)
- [ ] 모든 버튼 56px 이상 터치 영역
- [ ] 아이콘에 텍스트 라벨 표시
- [ ] SafeAreaInsets 적용
- [ ] 로딩 상태 표시
- [ ] 에러 처리
- [ ] 비즈니스 로직 hooks/로 분리

## 참고 문서

- [시니어 모드 가이드](../docs/SENIOR-MODE-GUIDE.md)
- [컴포넌트 가이드](../src/components/AGENTS.md)
- [PRD](../docs/PRD-INSITE-V2-FINAL.md)

---

_마지막 업데이트: 2026-02-10_
