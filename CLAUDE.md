# Insite App v2.0 - 개발 가이드

## 프로젝트 개요

- **프로젝트명**: Insite App v2.0 (Phoenix)
- **프로젝트 유형**: 신규 개발 (Greenfield) - v1 기능 1:1 재구현
- **목표**: 시설관리 모바일 플랫폼 현대화
- **기간**: 20주 (2026-02-10 ~ 2026-07-01)
- **기술 스택**: Expo SDK 54 + Tamagui + TypeScript

---

## 문서 구조

### 핵심 문서 (docs/)

| 문서 | 설명 | 상태 |
|------|------|------|
| [PRD-INSITE-V2-FINAL.md](./docs/PRD-INSITE-V2-FINAL.md) | **최종 PRD** - 프로젝트 요구사항 정의 | 최신 |
| [TASK-LIST-V2.md](./docs/TASK-LIST-V2.md) | **전체 태스크 목록** - 161개 태스크 상세 | 최신 |
| [MIGRATION-PLAN-2026-REVIEWED.md](./docs/MIGRATION-PLAN-2026-REVIEWED.md) | **검토된 마이그레이션 플랜** - 기술 스택 결정 | 최신 |

### 참조 문서 (docs/)

| 문서 | 설명 |
|------|------|
| [PRD-INSITE-V2.md](./docs/PRD-INSITE-V2.md) | PRD 초기 버전 |
| [PRD-insite-migration-2026.md](./docs/PRD-insite-migration-2026.md) | 마이그레이션 PRD (시니어 모드 디자인 포함) |
| [MIGRATION-PLAN-2026.md](./docs/MIGRATION-PLAN-2026.md) | 마이그레이션 플랜 초기 버전 |
| [migration-document.md](./docs/migration-document.md) | 통합 마이그레이션 문서 |

### 추적 문서 (루트)

| 문서 | 설명 |
|------|------|
| [TASK-TRACKER.md](./TASK-TRACKER.md) | **진행 상황 추적** - 실시간 업데이트 |
| CLAUDE.md (이 파일) | 개발 가이드 및 규칙 |

---

## 필수 규칙

### 1. 언어 규칙
- **모든 커밋 메시지, 주석, 문서는 반드시 한국어로 작성**
- 코드 내 변수명/함수명은 영어 사용 가능
- PR 설명, 이슈 설명도 한국어로 작성

### 2. 커밋 규칙
- **각 스프린트 완료 시 반드시 커밋 작성**
- 커밋 메시지 형식:
  ```
  [Sprint X.Y] 스프린트 제목

  완료된 태스크:
  - 태스크 ID: 태스크 설명
  - 태스크 ID: 태스크 설명

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

### 3. 태스크 관리 규칙
- **TASK-TRACKER.md 파일에서 진행 상황 추적**
- 태스크 시작 시: `⏳ 진행중` 으로 변경
- 태스크 완료 시: `✅ 완료` 로 변경 + 완료 날짜 기록
- 스프린트 완료 시: 스프린트 상태를 `🎯 완료`로 변경

### 4. 코드 규칙
- **100% TypeScript**: `any` 사용 금지
- **Strict Mode**: tsconfig.json strict: true 유지
- **Tamagui Only**: StyleSheet 사용 금지 (네이티브 모듈 연동 제외)
- **비즈니스 로직 분리**: UI 컴포넌트에 로직 작성 금지, hooks/로 분리

### 5. 파일 명명 규칙
```
컴포넌트: PascalCase.tsx (Button.tsx, WorkOrderCard.tsx)
훅: use*.ts (useAuth.ts, useWorkOrders.ts)
스토어: *.store.ts (auth.store.ts)
유틸: camelCase.ts (validation.ts, storage.ts)
타입: *.types.ts 또는 types/index.ts
```

### 6. 커밋 메시지 타입
```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
style: 코드 포맷팅 (기능 변경 없음)
docs: 문서 수정
test: 테스트 추가/수정
chore: 빌드/설정 변경
```

---

## 기술 스택 요약

### Core Framework
```json
{
  "expo": "^54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.x",
  "expo-router": "^4.0.0",
  "typescript": "^5.6.0"
}
```

### UI Framework
```json
{
  "tamagui": "latest",
  "@tamagui/config": "latest"
}
```

### State & Data
```json
{
  "@tanstack/react-query": "^5.60.0",
  "zustand": "^5.0.0",
  "axios": "^1.7.0",
  "orval": "^7.x",
  "zod": "^3.24.0",
  "react-hook-form": "^7.54.0"
}
```

### Native & Security
```json
{
  "expo-secure-store": "~15.0.x",
  "expo-camera": "~17.0.x",
  "expo-notifications": "~0.32.x",
  "expo-updates": "~29.0.x",
  "react-native-nfc-manager": "^3.14.0"
}
```

---

## 폴더 구조

```
InsiteApp-v2/
├── app/                    # Expo Router 페이지
│   ├── (auth)/            # 인증 화면 그룹
│   ├── (main)/            # 메인 화면 그룹
│   │   ├── (tabs)/        # 탭 네비게이터
│   │   ├── work/          # 작업지시
│   │   ├── patrol/        # 순찰점검
│   │   └── dashboard/     # 대시보드
│   └── (modals)/          # 모달 화면
├── src/
│   ├── api/               # API 클라이언트 + Orval 생성
│   │   ├── client.ts      # Axios 인스턴스
│   │   ├── generated/     # Orval 자동 생성
│   │   └── hooks/         # 커스텀 래퍼
│   ├── components/        # 공용 컴포넌트
│   │   ├── ui/           # Atomic (Button, Input, Card...)
│   │   ├── forms/        # Form 컴포넌트
│   │   ├── layout/       # Layout 컴포넌트
│   │   └── feedback/     # Toast, Modal, Loading...
│   ├── features/          # 기능별 모듈
│   │   ├── auth/
│   │   ├── work/
│   │   ├── patrol/
│   │   └── dashboard/
│   ├── stores/            # Zustand 스토어
│   ├── theme/             # Tamagui 테마
│   ├── constants/         # 상수
│   ├── types/             # 타입 정의
│   └── utils/             # 유틸리티
├── specs/                  # OpenAPI 스펙
├── docs/                   # 📚 프로젝트 문서 (신규)
│   ├── PRD-INSITE-V2-FINAL.md
│   ├── TASK-LIST-V2.md
│   ├── MIGRATION-PLAN-2026-REVIEWED.md
│   └── ...
├── CLAUDE.md              # 이 파일 (개발 가이드)
└── TASK-TRACKER.md        # 태스크 추적
```

---

## 환경 설정

### API 엔드포인트
| 환경 | Main API | BEMS API |
|------|----------|----------|
| Development | stage.hdc-insite.com:8083 | stage.hdc-insite.com:8086 |
| Staging | stage.hdc-insite.com:8083 | stage.hdc-insite.com:8086 |
| Production | www.hdc-insite.com:8083 | www.hdc-insite.com:8086 |

### EAS Build 프로파일
- `development`: 개발용 (Dev Client)
- `staging`: 내부 테스트용
- `production`: 스토어 배포용

---

## 주요 명령어

```bash
# 개발 서버 시작
npm start

# iOS 실행
npx expo run:ios

# Android 실행
npx expo run:android

# 타입 체크
npm run typecheck

# 린트
npm run lint

# EAS 빌드
npm run build:dev      # 개발
npm run build:staging  # 스테이징
npm run build:prod     # 프로덕션
```

---

## 개발 일정 요약

### Phase Overview (20주)

```
2026-02-10 ─────────────────────────────────────────────── 2026-07-01
     │                                                          │
     ▼                                                          ▼
┌─────────┬───────────┬───────────┬───────────┬─────────┬─────────┐
│ Phase 0 │  Phase 1  │  Phase 2  │  Phase 3  │ Phase 4 │ Phase 5 │
│ Setup & │   Core    │  Screen   │  Screen   │ Native  │   QA    │
│  POC    │   Infra   │  Part A   │  Part B   │ & Tune  │ Launch  │
│  3주    │    3주    │    5주    │    4주    │   3주   │   2주   │
└─────────┴───────────┴───────────┴───────────┴─────────┴─────────┘
```

### 마일스톤

| Milestone | 날짜 | 기준 |
|-----------|------|------|
| **M0: POC 완료** | 02-28 | AppGuard + NFC + Dev Client 동작 확인 |
| **M1: Core 완료** | 03-21 | API/State/UI 인프라 완료 |
| **M2: Auth + Main 완료** | 04-25 | 인증 + 메인 탭 + 작업지시 화면 완료 |
| **M3: All Screens 완료** | 05-23 | 순찰 + 대시보드 화면 완료 |
| **M4: Native 완료** | 06-13 | Push/OTA/성능 최적화 완료 |
| **M5: Launch** | 07-01 | 스토어 배포 완료 |

---

## 현재 진행 상황

> 이 섹션은 스프린트 완료 시 자동 업데이트됩니다.

| Phase | 상태 | 진행률 |
|-------|------|--------|
| Phase 0: Setup & POC | 🚧 진행중 | 30% |
| Phase 1: Core Infrastructure | 🚧 진행중 | 38% |
| Phase 2: Screen Development A | 🚧 진행중 | 63% |
| Phase 3: Screen Development B | ⏳ 대기 | 0% |
| Phase 4: Native & Performance | ⏳ 대기 | 0% |
| Phase 5: QA & Launch | ⏳ 대기 | 0% |

**전체 진행률**: 57/187 태스크 완료 (30%)

---

## v1 앱 참조

v1 앱(InsiteApp/)의 기능 요구사항과 비즈니스 로직만 참조합니다:
- 기능 스펙 및 화면 구성
- API 엔드포인트 및 데이터 스키마
- 디자인 가이드라인 (색상, 폰트 등)

**⚠️ 주의**: v1 코드는 복사하지 않습니다. 모든 코드는 새로 작성합니다.

---

_마지막 업데이트: 2026-02-06_
