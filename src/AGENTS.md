# src/ - 소스 코드 규칙

> 이 디렉토리는 앱의 핵심 로직, 컴포넌트, API 클라이언트, 스토어 등을 포함합니다.
> 모든 코드는 TypeScript strict mode를 준수하며, 한국어 주석을 사용합니다.

## 폴더 구조

```
src/
├── api/                    # API 레이어
│   ├── client.ts          # Axios 인스턴스
│   ├── generated/         # Orval 자동 생성 (수정 금지)
│   └── hooks/             # 커스텀 래퍼 훅
│
├── components/            # 공용 컴포넌트
│   ├── ui/               # 기본 UI (Button, Card, Input...)
│   ├── icons/            # 아이콘 (AppIcon, TabIcon...)
│   ├── forms/            # Form 컴포넌트
│   ├── layout/           # Layout 컴포넌트
│   └── feedback/         # Toast, Modal, Loading...
│
├── contexts/              # React Context
│   └── SeniorModeContext.tsx
│
├── features/              # 도메인별 모듈 (Feature-First)
│   ├── auth/
│   │   ├── components/   # 인증 전용 컴포넌트
│   │   ├── hooks/        # 인증 훅
│   │   ├── utils/        # 인증 유틸
│   │   └── types.ts      # 인증 타입
│   │
│   ├── work/             # 작업지시
│   ├── patrol/           # 순찰점검
│   └── dashboard/        # 대시보드
│
├── stores/                # Zustand 스토어
│   ├── auth.store.ts
│   ├── ui.store.ts
│   └── ...
│
├── theme/                 # Tamagui 테마
│   ├── config.ts         # Tamagui 설정
│   ├── tokens.ts         # 디자인 토큰
│   └── seniorMode.ts     # 시니어 모드 스타일
│
├── constants/             # 상수
│   ├── api.ts
│   └── ...
│
├── types/                 # 전역 타입 정의
│   ├── global.d.ts
│   └── ...
│
└── utils/                 # 유틸리티
    ├── validation.ts
    ├── storage.ts
    └── ...
```

## 명명 규칙

| 유형 | 패턴 | 예시 |
|------|------|------|
| **컴포넌트** | PascalCase.tsx | `Button.tsx`, `WorkOrderCard.tsx` |
| **훅** | use*.ts | `useLogin.ts`, `useWorkOrders.ts` |
| **스토어** | *.store.ts | `auth.store.ts`, `ui.store.ts` |
| **타입** | *.types.ts | `work.types.ts`, `patrol.types.ts` |
| **유틸** | camelCase.ts | `validation.ts`, `formatDate.ts` |
| **상수** | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_FILE_SIZE` |

## import 순서 규칙

모든 파일에서 다음 순서를 준수합니다:

```typescript
// 1. React 및 React Native
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

// 2. 외부 라이브러리 (알파벳 순)
import { YStack, XStack, Button } from 'tamagui';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// 3. 내부 모듈 - 절대 경로 (@/)
import { useAuthStore } from '@/stores/auth.store';
import { Button, Card } from '@/components/ui';
import { API_BASE_URL } from '@/constants/api';

// 4. 같은 feature 내부 - 상대 경로
import { useWorkOrders } from './hooks/useWorkOrders';
import { formatWorkStatus } from './utils';

// 5. 타입 (마지막에 별도 블록)
import type { WorkOrderDTO } from './types';
import type { User } from '@/types';
```

## 컴포넌트 작성 규칙

### 1. 컴포넌트 템플릿

```typescript
// src/components/ui/ExampleComponent.tsx

import React from 'react';
import { YStack, XStack } from 'tamagui';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { AppIcon } from '@/components/icons';
import type { ReactNode } from 'react';

/**
 * 예시 컴포넌트
 *
 * 시니어 모드를 자동으로 지원하며,
 * 폰트 크기와 터치 영역이 자동으로 조정됩니다.
 *
 * @param title - 컴포넌트 제목
 * @param description - 부가 설명 (선택)
 * @param onPress - 클릭 핸들러
 */
interface ExampleComponentProps {
  /** 제목 */
  title: string;
  /** 부가 설명 */
  description?: string;
  /** 클릭 핸들러 */
  onPress?: () => void;
  /** 자식 요소 */
  children?: ReactNode;
}

export function ExampleComponent({
  title,
  description,
  onPress,
  children,
}: ExampleComponentProps) {
  const { isSeniorMode, styles } = useSeniorStyles();

  return (
    <YStack
      padding={isSeniorMode ? styles.spacing.cardPadding : '$4'}
      minHeight={isSeniorMode ? styles.touchTarget.min : 44}
      onPress={onPress}
      gap="$2"
    >
      <XStack alignItems="center" gap="$2">
        <AppIcon name="info" size={isSeniorMode ? 'lg' : 'md'} />
        <Text fontSize={isSeniorMode ? styles.fontSize.large : 18}>
          {title}
        </Text>
      </XStack>

      {description && (
        <Text
          fontSize={isSeniorMode ? styles.fontSize.medium : 14}
          color="$gray600"
        >
          {description}
        </Text>
      )}

      {children}
    </YStack>
  );
}
```

### 2. Props 타입 정의

```typescript
// ✅ 권장: Interface 사용
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
  onPress?: () => void;
}

// ✅ 권장: JSDoc으로 설명 추가
interface CardProps {
  /** 카드 제목 */
  title: string;
  /** 카드 내용 */
  children: ReactNode;
  /** 클릭 가능 여부 */
  interactive?: boolean;
}
```

## 훅 작성 규칙

### 1. 데이터 페칭 훅

```typescript
// src/features/work/hooks/useWorkOrders.ts

import { useQuery } from '@tanstack/react-query';
import { getWorkOrderList } from '@/api/generated';
import type { WorkOrderDTO, WorkOrderFilter } from '../types';

/**
 * 작업지시 목록 조회 훅
 *
 * React Query를 사용하여 작업지시 목록을 가져오고,
 * 자동으로 캐싱 및 리프레시를 관리합니다.
 *
 * @param filter - 필터 옵션 (상태, 날짜 등)
 * @returns 작업 목록, 로딩 상태, 에러
 *
 * @example
 * ```tsx
 * const { workOrders, isLoading } = useWorkOrders({ status: 'pending' });
 * ```
 */
export function useWorkOrders(filter?: WorkOrderFilter) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['workOrders', filter],
    queryFn: () => getWorkOrderList(filter),
    staleTime: 1000 * 60 * 5, // 5분
  });

  // 데이터 가공 (필요한 경우)
  const workOrders = useMemo(() => {
    if (!data) return [];
    return data.map(order => ({
      ...order,
      statusLabel: getStatusLabel(order.status),
    }));
  }, [data]);

  return {
    workOrders,
    isLoading,
    error,
    refetch,
  };
}

/**
 * 작업 상태 라벨 변환
 */
function getStatusLabel(status: string): string {
  const labels = {
    pending: '대기',
    inProgress: '진행중',
    completed: '완료',
  };
  return labels[status] || status;
}
```

### 2. 비즈니스 로직 훅

```typescript
// src/features/work/hooks/useWorkOrderActions.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWorkOrder } from '@/api/generated';
import { useToast } from '@/components/feedback/Toast';

/**
 * 작업지시 액션 훅
 *
 * 작업 완료, 수정 등의 액션을 처리합니다.
 */
export function useWorkOrderActions() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // 작업 완료
  const completeWorkOrder = useMutation({
    mutationFn: (id: string) => updateWorkOrder(id, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
      showToast({ message: '작업이 완료되었습니다.', type: 'success' });
    },
    onError: (error) => {
      showToast({ message: '작업 완료에 실패했습니다.', type: 'error' });
    },
  });

  return {
    completeWorkOrder: completeWorkOrder.mutate,
    isCompleting: completeWorkOrder.isPending,
  };
}
```

## 스토어 작성 규칙

### Zustand 스토어 템플릿

```typescript
// src/stores/example.store.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 예시 스토어 상태
 */
interface ExampleState {
  // State
  items: Item[];
  selectedId: string | null;
  isLoading: boolean;

  // Actions
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  reset: () => void;
}

interface Item {
  id: string;
  name: string;
}

/**
 * 초기 상태
 */
const initialState = {
  items: [],
  selectedId: null,
  isLoading: false,
};

/**
 * 예시 스토어
 *
 * AsyncStorage에 자동으로 영속화됩니다.
 */
export const useExampleStore = create<ExampleState>()(
  persist(
    (set, get) => ({
      // State
      ...initialState,

      // Actions
      setItems: (items) => set({ items }),

      addItem: (item) => set({
        items: [...get().items, item],
      }),

      removeItem: (id) => set({
        items: get().items.filter(item => item.id !== id),
      }),

      selectItem: (id) => set({ selectedId: id }),

      reset: () => set(initialState),
    }),
    {
      name: 'example-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

## 타입 정의 규칙

### Feature 타입 파일

```typescript
// src/features/work/types.ts

/**
 * 작업 상태
 */
export type WorkStatus = 'pending' | 'inProgress' | 'completed' | 'cancelled';

/**
 * 작업 우선순위
 */
export type WorkPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * 작업지시 DTO
 */
export interface WorkOrderDTO {
  id: string;
  title: string;
  description: string;
  status: WorkStatus;
  priority: WorkPriority;
  assignee: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 작업 필터
 */
export interface WorkOrderFilter {
  status?: WorkStatus;
  priority?: WorkPriority;
  assignee?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 작업 생성 요청
 */
export interface CreateWorkOrderRequest {
  title: string;
  description: string;
  priority: WorkPriority;
  assignee: string;
  dueDate: string;
}
```

## 유틸리티 작성 규칙

### 유틸 함수 템플릿

```typescript
// src/utils/formatDate.ts

/**
 * 날짜를 한국어 형식으로 포맷팅
 *
 * @param date - ISO 날짜 문자열 또는 Date 객체
 * @param format - 포맷 옵션 (short, medium, long)
 * @returns 포맷팅된 날짜 문자열
 *
 * @example
 * formatDate('2026-02-10') // '2026년 2월 10일'
 * formatDate('2026-02-10', 'short') // '2월 10일'
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  switch (format) {
    case 'short':
      return `${month}월 ${day}일`;
    case 'medium':
      return `${year}년 ${month}월 ${day}일`;
    case 'long':
      const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
      return `${year}년 ${month}월 ${day}일 (${weekday})`;
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * 상대 시간 표시 (몇 분 전, 몇 시간 전)
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return formatDate(d, 'short');
}
```

## 금지 사항

### ❌ 절대 하지 말 것

1. **any 타입 사용**
   ```typescript
   // ❌ 잘못된 예
   const data: any = await fetchData();

   // ✅ 올바른 예
   const data: WorkOrderDTO = await fetchData();
   ```

2. **StyleSheet 사용** (Tamagui로 통일)
   ```typescript
   // ❌ 잘못된 예
   import { StyleSheet } from 'react-native';
   const styles = StyleSheet.create({ ... });

   // ✅ 올바른 예
   import { styled, YStack } from 'tamagui';
   ```

3. **직접 API 호출** (Orval 생성 함수 사용)
   ```typescript
   // ❌ 잘못된 예
   const response = await fetch('/api/work-orders');

   // ✅ 올바른 예
   import { getWorkOrderList } from '@/api/generated';
   const data = await getWorkOrderList();
   ```

4. **영어 주석**
   ```typescript
   // ❌ 잘못된 예
   // Fetch work orders from API

   // ✅ 올바른 예
   // API에서 작업지시 목록 조회
   ```

## 코드 리뷰 체크리스트

PR 전 반드시 확인:

- [ ] TypeScript strict mode 준수 (no `any`)
- [ ] 모든 주석 한국어 작성
- [ ] import 순서 준수
- [ ] 시니어 모드 지원
- [ ] JSDoc으로 함수 설명 추가
- [ ] 에러 처리 구현
- [ ] 타입 안정성 확보

## 참고 문서

- [화면 개발 가이드](../app/AGENTS.md)
- [컴포넌트 가이드](./components/AGENTS.md)
- [시니어 모드 가이드](../docs/SENIOR-MODE-GUIDE.md)

---

_마지막 업데이트: 2026-02-10_
