# 새 화면 생성

시니어 모드가 적용된 새 화면 템플릿을 생성합니다.

## 사용법

```
/new-screen work/create      # app/(main)/work/create.tsx 생성
/new-screen patrol/scan      # app/(main)/patrol/scan.tsx 생성
```

## 생성되는 파일

```typescript
/**
 * [화면명] 화면
 *
 * 시니어 모드 지원
 */
import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, Text } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { SeniorCard, SeniorCardTitle } from '@/components/ui/SeniorCard';
import { SeniorButton } from '@/components/ui/SeniorButton';
import { AppIcon } from '@/components/icons';
import { SText } from '@/components/ui/SText';

export default function [ScreenName]Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isSeniorMode, styles } = useSeniorStyles();

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* 헤더 */}
      <GradientHeader
        title="[화면명]"
        height={isSeniorMode ? 200 : 180}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: isSeniorMode ? 120 : 100
        }}
      >
        {isSeniorMode ? (
          // 시니어 모드 UI
          <YStack padding="$4" gap="$4">
            <SeniorCard>
              <SeniorCardTitle>제목</SeniorCardTitle>
              <SText fontSize={styles.fontSize.medium}>
                내용
              </SText>
            </SeniorCard>

            <SeniorButton
              label="확인"
              onPress={() => router.back()}
            />
          </YStack>
        ) : (
          // 일반 모드 UI
          <YStack padding="$4" gap="$4">
            <GlassCard>
              <Text fontSize={16} fontWeight="600">제목</Text>
              <Text fontSize={14}>내용</Text>
            </GlassCard>
          </YStack>
        )}
      </ScrollView>
    </YStack>
  );
}
```

## 옵션

```
/new-screen work/create --type=form    # 폼 화면 템플릿
/new-screen work/result --type=detail  # 상세 화면 템플릿
/new-screen patrol/list --type=list    # 목록 화면 템플릿
```
