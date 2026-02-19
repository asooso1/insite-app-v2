# Insite App v2.0 - 아키텍처

## 프로젝트 개요

- **목표**: 시설관리 모바일 플랫폼 현대화
- **기간**: 2026-02-06 ~ 2026-05-09 (약 13주, 원래 20주 대비 단축)
- **현재 진행률**: [TASK-TRACKER.md](./TASK-TRACKER.md) 참조

## 기술 스택

### Core
- Expo SDK 54 + React 19 + React Native 0.81
- TypeScript 5.6 (Strict Mode)
- expo-router 4.x (파일 기반 라우팅)

### UI
- Tamagui (스타일링)
- @tamagui/lucide-icons (아이콘)
- expo-blur, expo-linear-gradient (효과)

### 상태 관리
- Zustand 5.x (전역 상태)
- TanStack Query 5.x (서버 상태)
- expo-secure-store (토큰 저장)

### API
- Axios (HTTP 클라이언트)
- Orval (OpenAPI -> React Query 훅 자동 생성)
- Zod (런타임 검증)

---

## 폴더 구조

```
app/                    # 화면 (Expo Router)
├── (auth)/            # 인증: login, guest-login, device-pending
├── (main)/
│   ├── (home)/        # 홈 및 하위 화면
│   │   ├── index.tsx  # 홈 화면
│   │   ├── work/      # 작업지시: 목록, 상세, 결과
│   │   ├── patrol/    # 순찰: 목록, 상세, 스캔
│   │   ├── dashboard/ # 대시보드: 운영, 알람
│   │   ├── claim/     # 민원: 목록, 상세, 생성
│   │   ├── facility/  # 설비: 목록, 상세
│   │   ├── personal-task/ # 개인 업무: 목록, 생성, 상세
│   │   └── approval/  # 승인/확인: 목록
│   ├── (my-work)/     # 내 작업
│   ├── (scan)/        # QR/NFC 스캔 + 출퇴근
│   ├── (calendar)/    # 캘린더
│   └── (settings)/    # 설정

src/
├── api/               # API 레이어
│   ├── client.ts      # Axios 인스턴스 (인터셉터)
│   ├── generated/     # Orval 자동 생성
│   │   ├── account/   # 인증 API
│   │   ├── devices/   # 기기 API
│   │   ├── complain/  # 민원 API
│   │   ├── facility/  # 설비 API
│   │   ├── personal/  # 개인 업무 API
│   │   ├── tasks/     # 승인/태스크 API
│   │   └── models/    # 공유 DTO 모델
│   └── queryPersister.ts  # TanStack Query 영속화
├── components/
│   ├── ui/            # 공용 UI (Button, Card, GlassCard, CollapsibleGradientHeader...)
│   ├── icons/         # AppIcon, TabIcon
│   ├── SplashScreen.tsx
│   └── VideoIntroScreen.tsx
├── features/          # 도메인별 모듈
│   ├── auth/hooks/    # useLogin, useGuestLogin
│   ├── work/          # 작업지시 관련
│   ├── patrol/        # 순찰 관련
│   ├── dashboard/     # 대시보드 관련
│   ├── attendance/    # 출퇴근 관련
│   ├── claim/         # 민원 관련
│   ├── facility/      # 설비 관련
│   ├── personal-task/ # 개인 업무 관련
│   └── approval/      # 승인/확인 관련
├── stores/            # Zustand 스토어
│   ├── auth.store.ts  # 인증 상태
│   ├── ui.store.ts    # UI 상태 (시니어 모드)
│   ├── attendance.store.ts # 출퇴근 상태
│   ├── network.store.ts    # 네트워크 상태
│   └── offlineQueue.store.ts # 오프라인 큐
├── services/          # 서비스 레이어
│   ├── nfc.ts         # NFC 서비스
│   ├── nfcSync.ts     # NFC 오프라인 동기화
│   ├── syncService.ts # 오프라인 큐 동기화
│   ├── locationService.ts # GPS 위치 서비스
│   └── qrScanner.ts   # QR 스캐너 서비스
├── hooks/             # 커스텀 훅
│   ├── useNFC.ts      # NFC 훅
│   ├── useQRScanner.ts # QR 스캐너 훅
│   ├── usePermission.ts # 권한 훅
│   └── useNotifications.ts # 알림 훅
├── contexts/          # React Context
│   └── SeniorModeContext.tsx
├── theme/             # Tamagui 테마
│   ├── tamagui.config.ts
│   ├── tokens.ts
│   ├── themes.ts
│   └── seniorMode.ts  # 시니어 스타일 상수
├── types/             # 공유 타입
│   └── permission.types.ts
└── utils/             # 유틸리티
    ├── notifications.ts
    ├── deeplink.ts
    ├── updates.ts
    ├── lazyLoad.tsx
    └── scanParser.ts
```

---

## 개발 플로우

### 새 화면 개발 시

1. **태스크 확인**: TASK-TRACKER.md에서 태스크 ID 확인
2. **화면 생성**: app/ 디렉토리에 파일 생성
3. **Collapsible 헤더 사용**: 목록 화면은 반드시 CollapsibleGradientHeader 사용
4. **시니어 모드 적용**: useSeniorStyles() 훅 사용
5. **아이콘 사용**: AppIcon 컴포넌트 사용 (이모지 금지)
6. **타입 체크**: `npm run typecheck`
7. **태스크 완료**: TASK-TRACKER.md 업데이트

### 목록 화면 기본 템플릿

```tsx
import React, { useRef } from 'react';
import { Animated, RefreshControl, View } from 'react-native';
import { YStack } from 'tamagui';
import { CollapsibleGradientHeader } from '@/components/ui/CollapsibleGradientHeader';
import { GlassSearchInput } from '@/components/ui/GlassSearchInput';
import { useSeniorStyles } from '@/contexts/SeniorModeContext';

export default function ListScreen() {
  const { isSeniorMode } = useSeniorStyles();

  // 스크롤 애니메이션 (필수)
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <YStack flex={1} backgroundColor="$gray50">
      {/* Collapsible 헤더 (필수) */}
      <CollapsibleGradientHeader
        scrollY={scrollY}
        title="화면 제목"
        expandedHeight={160}    // 검색창 있으면 160, subtitle 있으면 120, 타이틀만 있으면 100
        collapsedHeight={80}    // 축소 높이 (고정)
        bottomContent={<GlassSearchInput placeholder="검색" />}
      />

      {/* Animated.FlatList 또는 Animated.ScrollView 사용 (필수) */}
      <Animated.FlatList
        data={items}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        // ...
      />
    </YStack>
  );
}
```

**주의사항:**
- FlatList → Animated.FlatList, ScrollView → Animated.ScrollView 사용
- onScroll에 Animated.event 연결 필수
- scrollEventThrottle={16} 설정 필수

### 스프린트 완료 시

1. 모든 태스크 완료 확인
2. 커밋 작성 (CLAUDE.md 커밋 규칙 참조)

---

## API 패턴

### Orval 사용
```typescript
// specs/insite-api.yaml에 OpenAPI 스펙 정의
// npm run api:generate로 훅 자동 생성
import { useGetWorkOrderList } from '@/api/generated/work/work';

const { data, isLoading } = useGetWorkOrderList();
```

### 커스텀 훅 래핑
```typescript
// src/features/work/hooks/useWorkOrders.ts
export function useWorkOrders() {
  const { data, isLoading } = useGetWorkOrderList();
  // 추가 로직...
  return { workOrders: data, isLoading };
}
```

---

## 시니어 모드 패턴

모든 화면에서 반드시 적용:

```typescript
import { useSeniorStyles } from '@/contexts/SeniorModeContext';
import { SeniorCard, SeniorButton } from '@/components/ui';
import { AppIcon } from '@/components/icons';

export default function SomeScreen() {
  const { isSeniorMode, styles } = useSeniorStyles();

  return (
    <YStack>
      {isSeniorMode ? (
        <SeniorCard>
          <SeniorCardListItem
            label="항목"
            right={<AppIcon name="chevronRight" />}
          />
        </SeniorCard>
      ) : (
        <GlassCard>{/* 일반 UI */}</GlassCard>
      )}
    </YStack>
  );
}
```

---

## 환경 설정

### API 엔드포인트
| 환경 | Main API |
|------|----------|
| Development | 121.133.17.22:8083 |
| Staging | stage.hdc-insite.com:8083 |
| Production | www.hdc-insite.com:8083 |

### EAS Build 프로파일
- `development`: 개발용 (Dev Client)
- `staging`: 내부 테스트용
- `production`: 스토어 배포용

---

## 파일 명명 규칙

```
컴포넌트: PascalCase.tsx (Button.tsx, WorkOrderCard.tsx)
훅: use*.ts (useAuth.ts, useWorkOrders.ts)
스토어: *.store.ts (auth.store.ts)
유틸: camelCase.ts (validation.ts, storage.ts)
타입: *.types.ts 또는 types/index.ts
```

---

## 마일스톤

| Milestone | 날짜 | 기준 | 상태 |
|-----------|------|------|------|
| **M0: POC 완료** | 02-28 | NFC 검증 완료. AppGuard Contingency 적용 | ⏳ 진행중 |
| **M1: Core 완료** | 02-08 | API/State/UI 인프라 완료 | ✅ 달성 |
| **M2: Auth + Main 완료** | 02-10 | 인증 + 메인 탭 + 작업지시 화면 완료 | ✅ 달성 |
| **M3: All Screens 완료** | 02-12 | 순찰 + 대시보드 + 추가 화면 완료 | ✅ 달성 |
| **M4: Native + 잔여 태스크** | 03-14 | 프로덕션 빌드 테스트 + 성능 최적화 + StyleSheet 전환 | ⏳ 예정 |
| **M5: API 연동** | 04-04 | 백엔드 스펙 확정 후 Mock → 실 API 교체 | ⏳ 예정 |
| **M6: QA** | 04-25 | 기능 테스트 + E2E + 성능 벤치마크 | ⏳ 예정 |
| **M7: Launch** | 05-09 | 스토어 배포 완료 + 운영 모니터링 | ⏳ 예정 |

---

## v1 앱 참조

v1 앱(InsiteApp/)의 기능 요구사항과 비즈니스 로직만 참조:
- 기능 스펙 및 화면 구성
- API 엔드포인트 및 데이터 스키마
- 디자인 가이드라인 (색상, 폰트 등)

**주의**: v1 코드는 복사하지 않음. 모든 코드는 새로 작성.

---

_마지막 업데이트: 2026-02-19_
