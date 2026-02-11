# Insite App v2.0 - 아키텍처

## 프로젝트 개요

- **목표**: 시설관리 모바일 플랫폼 현대화
- **기간**: 2026-02-10 ~ 2026-07-01 (20주)
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
├── (auth)/            # 인증: login, guest-login, change-password
├── (main)/
│   ├── (tabs)/        # 탭: home, my-work, scan, calendar, settings
│   ├── work/          # 작업지시: 목록, 상세, 생성, 결과
│   ├── patrol/        # 순찰: 목록, 상세
│   └── dashboard/     # 대시보드: 운영, 알람

src/
├── api/               # API 레이어
│   ├── client.ts      # Axios 인스턴스 (인터셉터)
│   ├── generated/     # Orval 자동 생성
│   └── auth.ts        # 인증 API
├── components/
│   ├── ui/            # 공용 UI (Button, Card, SeniorCard...)
│   └── icons/         # AppIcon, TabIcon
├── features/          # 도메인별 모듈
│   ├── auth/hooks/    # useLogin, useGuestLogin
│   ├── work/          # 작업지시 관련
│   ├── patrol/        # 순찰 관련
│   └── dashboard/     # 대시보드 관련
├── stores/            # Zustand 스토어
│   ├── auth.store.ts  # 인증 상태
│   └── ui.store.ts    # UI 상태 (시니어 모드)
├── contexts/          # React Context
│   └── SeniorModeContext.tsx
├── theme/             # Tamagui 테마
│   ├── tamagui.config.ts
│   ├── tokens.ts
│   ├── themes.ts
│   └── seniorMode.ts  # 시니어 스타일 상수
└── utils/             # 유틸리티
```

---

## 개발 플로우

### 새 화면 개발 시

1. **태스크 확인**: TASK-TRACKER.md에서 태스크 ID 확인
2. **화면 생성**: app/ 디렉토리에 파일 생성
3. **시니어 모드 적용**: useSeniorStyles() 훅 사용
4. **아이콘 사용**: AppIcon 컴포넌트 사용 (이모지 금지)
5. **타입 체크**: `npm run typecheck`
6. **태스크 완료**: TASK-TRACKER.md 업데이트

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

| Milestone | 날짜 | 기준 |
|-----------|------|------|
| **M0: POC 완료** | 02-28 | AppGuard + NFC + Dev Client 동작 확인 |
| **M1: Core 완료** | 03-21 | API/State/UI 인프라 완료 |
| **M2: Auth + Main 완료** | 04-25 | 인증 + 메인 탭 + 작업지시 화면 완료 |
| **M3: All Screens 완료** | 05-23 | 순찰 + 대시보드 화면 완료 |
| **M4: Native 완료** | 06-13 | Push/OTA/성능 최적화 완료 |
| **M5: Launch** | 07-01 | 스토어 배포 완료 |

---

## v1 앱 참조

v1 앱(InsiteApp/)의 기능 요구사항과 비즈니스 로직만 참조:
- 기능 스펙 및 화면 구성
- API 엔드포인트 및 데이터 스키마
- 디자인 가이드라인 (색상, 폰트 등)

**주의**: v1 코드는 복사하지 않음. 모든 코드는 새로 작성.

---

_마지막 업데이트: 2026-02-10_
