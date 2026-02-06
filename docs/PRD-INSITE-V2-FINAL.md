# Product Requirements Document (PRD)

# Insite App v2.0 - Phoenix (신규 개발)

---

## Document Control

| 항목                | 내용                       |
| ------------------- | -------------------------- |
| **문서 버전**       | 2.1                        |
| **작성일**          | 2026-02-05                 |
| **최종 수정일**     | 2026-02-06                 |
| **프로젝트 코드명** | Insite v2 (Phoenix)        |
| **프로젝트 유형**   | **신규 개발** (Greenfield) |
| **예상 기간**       | 20주 (5개월)               |
| **목표 출시일**     | 2026-07-01                 |

---

## 1. Executive Summary

### 1.1 프로젝트 개요

Insite App v2.0은 **완전히 새로운 프로젝트**로 개발됩니다. 기존 v1 앱의 **기능 요구사항과 비즈니스 로직**만 참조하고, 코드베이스는 처음부터 현대적인 아키텍처로 새로 작성합니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                        개발 전략                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   v1 앱 (참조용)              v2 앱 (신규 개발)                  │
│   ┌─────────────┐            ┌─────────────────┐                │
│   │ 기능 스펙   │ ────────▶  │ 기능 구현       │                │
│   │ 화면 구성   │            │ (새 코드)       │                │
│   │ API 연동    │            │                 │                │
│   └─────────────┘            └─────────────────┘                │
│                                                                  │
│   ❌ 코드 복사 안함                                              │
│   ❌ 점진적 마이그레이션 안함                                    │
│   ✅ 기능 1:1 재구현                                             │
│   ✅ 처음부터 TypeScript + Tamagui + Expo                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 핵심 목표 (Success Metrics)

| 목표              | 측정 지표            | v1 현재 | v2 목표            | 측정 도구           |
| ----------------- | -------------------- | ------- | ------------------ | ------------------- |
| **앱 성능**       | TTI (Cold Start)     | 2.5초   | **< 1.2초**        | Sentry / Flashlight |
| **코드 품질**     | TypeScript 적용률    | ~5%     | **100%** (Strict)  | tsc --noEmit        |
| **개발 생산성**   | 새 화면 개발 시간    | 2-3일   | **< 4시간**        | Git History         |
| **안정성**        | Crash-free Sessions  | 99.7%   | **> 99.9%**        | Sentry              |
| **접근성**        | Senior Mode 지원     | 부분적  | **완벽 (p95)**     | 사용자 테스트       |
| **번들 크기**     | APK/IPA 크기         | 25MB    | **< 18MB**         | EAS Build           |

### 1.3 범위 정의

**v1에서 가져올 것 (참조만):**
- 기능 요구사항 및 비즈니스 로직
- 화면 구성 및 사용자 플로우
- API 엔드포인트 및 데이터 스키마
- 디자인 가이드라인 (색상, 폰트 등)

**v2에서 새로 작성:**
- 전체 코드베이스 (100% TypeScript)
- UI 컴포넌트 (Tamagui 기반)
- 상태 관리 (Zustand + TanStack Query)
- 네비게이션 (Expo Router)
- 빌드 시스템 (EAS Build)

**제외 (Out of Scope):**
- 사용자 대상 신규 비즈니스 기능 추가
- 백엔드 API 변경
- 웹 버전 개발

---

## 2. v1 기능 분석 (참조 문서)

### 2.1 v1 화면 목록

v2에서 **1:1 재구현**할 화면 목록입니다.

#### 인증 (Auth)

| 화면               | v1 파일                    | 핵심 기능                    |
| ------------------ | -------------------------- | ---------------------------- |
| 로그인             | Login.js (1500줄)          | 이메일/비밀번호, 자동 로그인 |
| 게스트 NFC 로그인  | GuestNfcLogin.js           | NFC 태그로 게스트 인증       |
| 비밀번호 변경      | PasswordChange.js          | 비밀번호 변경                |
| 기기 승인 대기     | DeviceApprovalPending.js   | 관리자 승인 대기 화면        |

#### 메인 탭 (Main Tabs)

| 화면      | v1 파일        | 핵심 기능                       |
| --------- | -------------- | ------------------------------- |
| 홈        | HomePage.js    | 대시보드, 오늘의 작업, 알림     |
| 내 작업   | MyWorkPage.js  | 배정된 작업 목록                |
| 스캔      | ScanPage.js    | NFC/QR 스캔 화면                |
| 캘린더    | CalendarPage.js| 일정 캘린더                     |
| 설정      | SettingPage.js | 개인설정, 앱 설정               |

#### 작업지시 (Work Order)

| 화면           | v1 파일              | 핵심 기능                    |
| -------------- | -------------------- | ---------------------------- |
| 작업 목록      | WorkOrderList.js     | 필터/검색, 목록 조회         |
| 작업 상세      | WorkOrderDetail.js   | 작업 상세 정보               |
| 작업 등록      | WorkOrderCreate.js   | 새 작업 등록 폼              |
| 작업 결과 입력 | WorkResult.js        | 사진/텍스트 결과 입력        |
| 체크리스트     | ChecklistView.js     | 체크리스트 항목 처리         |

#### 순찰점검 (Patrol)

| 화면       | v1 파일          | 핵심 기능                  |
| ---------- | ---------------- | -------------------------- |
| 순찰 목록  | PatrolList.js    | 순찰 일정 목록             |
| 순찰 상세  | PatrolDetail.js  | 순찰 경로 및 체크포인트    |
| 순찰 스캔  | PatrolScan.js    | NFC/QR 체크포인트 스캔     |

#### 대시보드 (Dashboard)

| 화면       | v1 파일           | 핵심 기능                  |
| ---------- | ----------------- | -------------------------- |
| BEMS       | BemsDashboard.js  | 에너지 모니터링 차트       |
| 알람       | AlarmDashboard.js | 알람 현황 대시보드         |
| 운영 현황  | OperatingDashboard.js | 운영 통계 대시보드     |

### 2.2 v1 API 연동 현황

| API 영역   | Base URL           | 주요 엔드포인트                        |
| ---------- | ------------------ | -------------------------------------- |
| Main API   | :8083/api          | /auth, /work-orders, /patrols, /users  |
| BEMS API   | :8086/bems         | /energy, /alarms, /reports             |
| PC API     | :8081/pc           | /sync, /export                         |

### 2.3 v1 핵심 기능 요구사항

#### Senior Mode (접근성)
- 폰트 크기 1.2배 확대
- 터치 영역 확대 (44px → 53px)
- 고대비 색상 옵션

#### Offline 지원
- 토큰/설정 로컬 저장
- 작업 결과 로컬 저장 후 복구 시 동기화

#### NFC 기능
- 게스트 로그인
- 순찰 체크포인트 스캔
- 설비 태그 스캔

---

## 3. v2 기술 스택 (The "Phoenix" Stack)

### 3.1 Core Framework

```json
{
  "expo": "^54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.x",
  "expo-router": "^4.0.0",
  "typescript": "^5.6.0"
}
```

### 3.2 UI Framework

```json
{
  "tamagui": "latest",
  "@tamagui/config": "latest"
}
```

- **Tamagui**: Compiler-optimized, Theme-nesting 지원
- **Senior Mode**: Dynamic Theme Nesting으로 즉시 전환

### 3.3 State & Data

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

- **TanStack Query**: Server State + PersistQueryClient (Offline)
- **Zustand**: Client State + Persist Middleware
- **Orval**: Swagger → Query Hook 자동 생성

### 3.4 Native & Security

```json
{
  "expo-secure-store": "~15.0.x",
  "expo-camera": "~17.0.x",
  "expo-notifications": "~0.32.x",
  "expo-updates": "~29.0.x",
  "react-native-nfc-manager": "^3.14.0",
  "@sentry/react-native": "latest"
}
```

- **AppGuard/Diresu**: EAS Build 단계에서 삽입 (POC 검증 필요)
- **Sentry**: Error Tracking + Session Replay

### 3.5 Build & Deploy

```json
{
  "eas-cli": "latest",
  "expo-dev-client": "~5.0.x"
}
```

- **EAS Build**: Dev / Staging / Production 프로파일
- **expo-updates**: OTA 업데이트 (Fingerprint 검증)

---

## 4. v2 아키텍처

### 4.1 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Expo Router │  │   Screens   │  │   Tamagui Design    │  │
│  │   v4        │  │ (features/) │  │      System         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      State Management                        │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │   TanStack Query    │  │         Zustand             │   │
│  │   (Server State)    │  │     (Client State)          │   │
│  │   + Offline Cache   │  │   + Persist Storage         │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                       Data Layer                             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐     │
│  │ Orval       │  │ SecureStore  │  │  AsyncStorage   │     │
│  │ (API Gen)   │  │   (Tokens)   │  │   (Settings)    │     │
│  └─────────────┘  └──────────────┘  └─────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│                    Native & Security                         │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────────┐     │
│  │   NFC   │  │  Camera  │  │  Push   │  │  AppGuard  │     │
│  └─────────┘  └──────────┘  └─────────┘  └────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 폴더 구조

```
InsiteApp-v2/                     # 새 프로젝트 루트
├── app/                          # Expo Router (파일 기반 라우팅)
│   ├── _layout.tsx               # Root Layout
│   ├── index.tsx                 # Entry (Splash → Auth check)
│   │
│   ├── (auth)/                   # Auth Group (미인증 사용자)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── guest-login.tsx
│   │   └── device-pending.tsx
│   │
│   ├── (main)/                   # Main Group (인증된 사용자)
│   │   ├── _layout.tsx           # Tab Navigator
│   │   ├── (tabs)/
│   │   │   ├── home.tsx
│   │   │   ├── my-work.tsx
│   │   │   ├── scan.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── settings.tsx
│   │   │
│   │   ├── work/
│   │   │   ├── index.tsx         # 작업 목록
│   │   │   ├── create.tsx        # 작업 등록
│   │   │   └── [id]/
│   │   │       ├── index.tsx     # 작업 상세
│   │   │       └── result.tsx    # 결과 입력
│   │   │
│   │   ├── patrol/
│   │   │   ├── index.tsx
│   │   │   ├── [id].tsx
│   │   │   └── scan.tsx
│   │   │
│   │   └── dashboard/
│   │       ├── bems.tsx
│   │       ├── alarm.tsx
│   │       └── operating.tsx
│   │
│   └── (modals)/                 # Modal Routes
│       ├── password-change.tsx
│       └── settings-detail.tsx
│
├── src/
│   ├── api/                      # API Layer
│   │   ├── client.ts             # Axios instance + Interceptors
│   │   ├── generated/            # Orval 자동 생성
│   │   │   ├── auth.ts
│   │   │   ├── work-orders.ts
│   │   │   ├── patrols.ts
│   │   │   └── model/            # TypeScript 타입
│   │   └── hooks/                # 커스텀 래퍼 (필요시)
│   │
│   ├── components/               # Tamagui 컴포넌트
│   │   ├── ui/                   # Atomic (Button, Input, Card...)
│   │   ├── forms/                # Form 컴포넌트
│   │   ├── layout/               # Layout 컴포넌트
│   │   └── feedback/             # Toast, Modal, Loading...
│   │
│   ├── features/                 # Feature 모듈
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   ├── work/
│   │   ├── patrol/
│   │   └── dashboard/
│   │
│   ├── stores/                   # Zustand Stores
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── settings.store.ts
│   │
│   ├── theme/                    # Tamagui Theme
│   │   ├── tamagui.config.ts
│   │   ├── tokens.ts
│   │   └── themes.ts             # Senior Mode 포함
│   │
│   ├── constants/                # 상수
│   │   └── config.ts
│   │
│   ├── types/                    # 공유 타입
│   │   └── index.ts
│   │
│   └── utils/                    # 유틸리티
│       ├── storage.ts
│       ├── nfc.ts
│       └── validation.ts
│
├── specs/                        # API Swagger 스펙
│   └── openapi.yaml
│
├── assets/                       # 정적 리소스
│   ├── images/
│   └── fonts/
│
├── app.config.ts                 # Expo 설정
├── eas.json                      # EAS Build 프로파일
├── orval.config.ts               # Orval 설정
├── tsconfig.json                 # TypeScript 설정
├── tamagui.config.ts             # Tamagui 설정
└── package.json
```

---

## 5. 기능 요구사항 (Functional Requirements)

### FR-01: 인증 시스템

| ID       | 요구사항                     | 우선순위 | v1 참조 파일       |
| -------- | ---------------------------- | -------- | ------------------ |
| FR-01-01 | 이메일/비밀번호 로그인       | P0       | Login.js           |
| FR-01-02 | 기기 등록 및 관리자 승인     | P0       | DeviceApproval.js  |
| FR-01-03 | 게스트 NFC 로그인            | P0       | GuestNfcLogin.js   |
| FR-01-04 | 자동 로그인 (토큰 갱신)      | P0       | App.js             |
| FR-01-05 | 비밀번호 변경                | P1       | PasswordChange.js  |
| FR-01-06 | 로그아웃                     | P1       | SettingPage.js     |

### FR-02: Senior Mode (지능형 테마)

| ID       | 요구사항                                                    | 우선순위 |
| -------- | ----------------------------------------------------------- | -------- |
| FR-02-01 | Dynamic Theme: 전역 폰트/터치영역/대비 즉시 전환            | P0       |
| FR-02-02 | Adaptive Layout: 배율에 따라 XStack↔YStack 자동 전환        | P1       |
| FR-02-03 | 앱 재시작 없이 즉시 적용                                    | P1       |

### FR-03: 작업지시 관리

| ID       | 요구사항                       | 우선순위 | v1 참조 파일       |
| -------- | ------------------------------ | -------- | ------------------ |
| FR-03-01 | 작업 목록 조회 (필터/검색)     | P0       | WorkOrderList.js   |
| FR-03-02 | 작업 상세 조회                 | P0       | WorkOrderDetail.js |
| FR-03-03 | 작업 등록                      | P0       | WorkOrderCreate.js |
| FR-03-04 | 작업 결과 입력 (사진/텍스트)   | P0       | WorkResult.js      |
| FR-03-05 | 체크리스트 항목 처리           | P0       | ChecklistView.js   |

### FR-04: 순찰점검

| ID       | 요구사항               | 우선순위 | v1 참조 파일     |
| -------- | ---------------------- | -------- | ---------------- |
| FR-04-01 | 순찰 일정 조회         | P0       | PatrolList.js    |
| FR-04-02 | NFC/QR 체크포인트 스캔 | P0       | PatrolScan.js    |
| FR-04-03 | 순찰 결과 기록         | P0       | PatrolDetail.js  |
| FR-04-04 | 순찰 현황 대시보드     | P1       | -                |

### FR-05: 대시보드

| ID       | 요구사항                        | 우선순위 | v1 참조 파일           |
| -------- | ------------------------------- | -------- | ---------------------- |
| FR-05-01 | BEMS 대시보드 (에너지 모니터링) | P1       | BemsDashboard.js       |
| FR-05-02 | 알람 대시보드                   | P1       | AlarmDashboard.js      |
| FR-05-03 | 운영 현황 대시보드              | P1       | OperatingDashboard.js  |

### FR-06: 설정 및 기타

| ID       | 요구사항                  | 우선순위 | 비고              |
| -------- | ------------------------- | -------- | ----------------- |
| FR-06-01 | 개인정보 관리             | P1       | -                 |
| FR-06-02 | 알림 설정                 | P1       | -                 |
| FR-06-03 | Senior Mode 토글          | P1       | -                 |
| FR-06-04 | 환경 전환 (개발자 메뉴)   | P2       | 신규 (Dev Tools)  |
| FR-06-05 | 즐겨찾기 메뉴 설정        | P2       | -                 |

### FR-07: Offline 지원

| ID       | 요구사항                                           | 우선순위 |
| -------- | -------------------------------------------------- | -------- |
| FR-07-01 | 토큰/설정 로컬 영속화                              | P0       |
| FR-07-02 | 작업 결과 오프라인 저장 → 복구 시 자동 동기화      | P1       |
| FR-07-03 | 목록 데이터 캐싱 (TanStack Query Persist)          | P1       |

---

## 6. 비기능 요구사항 (Non-Functional Requirements)

### NFR-01: 성능

| ID        | 요구사항      | 기준        |
| --------- | ------------- | ----------- |
| NFR-01-01 | Cold Start    | < 1.2초     |
| NFR-01-02 | 화면 전환     | < 100ms     |
| NFR-01-03 | API 응답 처리 | < 500ms     |
| NFR-01-04 | 목록 스크롤   | 60 FPS 유지 |

### NFR-02: 보안

| ID        | 요구사항        | 기준                            |
| --------- | --------------- | ------------------------------- |
| NFR-02-01 | 토큰 저장       | expo-secure-store 사용          |
| NFR-02-02 | API 통신        | HTTPS 필수                      |
| NFR-02-03 | 앱 무결성       | AppGuard/Diresu (EAS Build)     |
| NFR-02-04 | 세션 관리       | 30분 미사용 시 재인증           |

### NFR-03: 가용성

| ID        | 요구사항      | 기준              |
| --------- | ------------- | ----------------- |
| NFR-03-01 | Crash-free    | > 99.9%           |
| NFR-03-02 | ANR 발생률    | < 0.05%           |
| NFR-03-03 | Offline 기능  | 토큰/설정/작업 유지 |

### NFR-04: 호환성

| ID        | 요구사항          | 기준                 |
| --------- | ----------------- | -------------------- |
| NFR-04-01 | iOS 최소 버전     | iOS 15.1+            |
| NFR-04-02 | Android 최소 버전 | Android 10 (API 29)+ |
| NFR-04-03 | 화면 크기         | 5"-7" 최적화         |

---

## 7. 개발 일정 (20주)

### 7.1 Phase Overview

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

### 7.2 Detailed Schedule

#### Phase 0: Setup & POC (1-3주)

| 주차 | 태스크                                                               | 산출물                       |
| ---- | -------------------------------------------------------------------- | ---------------------------- |
| 1주  | Expo SDK 54 프로젝트 생성, EAS Build 파이프라인 구축                 | 프로젝트 스캐폴딩            |
| 2주  | **POC: AppGuard + NFC + Expo Dev Client 호환성 검증**                | POC 결과 보고서              |
| 3주  | Tamagui 설정, 디자인 토큰 정의, Senior Mode 테마 구현                | 테마 시스템 완료             |

**Phase 0 Gate**: POC 실패 시 대안 전략 결정

#### Phase 1: Core Infrastructure (4-6주)

| 주차 | 태스크                                                               | 산출물                       |
| ---- | -------------------------------------------------------------------- | ---------------------------- |
| 4주  | Orval 설정, API Client 구현, Interceptor (Auth, Error)               | API 레이어 완료              |
| 5주  | Zustand 스토어 설계 (Auth, UI, Settings), Persist 설정               | 상태 관리 완료               |
| 6주  | Tamagui 공통 컴포넌트 20종 개발 (Button, Input, Card, Modal 등)      | 디자인 시스템 완료           |

#### Phase 2: Screen Development - Part A (7-11주)

| 주차   | 태스크                                                        | 화면 수 |
| ------ | ------------------------------------------------------------- | ------- |
| 7-8주  | 인증 화면 (로그인, 게스트 NFC, 기기 승인, 비밀번호 변경)      | 4       |
| 9주    | 메인 탭 (홈, 내 작업, 스캔, 캘린더, 설정)                     | 5       |
| 10-11주| 작업지시 (목록, 상세, 등록, 결과 입력, 체크리스트)            | 5       |

#### Phase 3: Screen Development - Part B (12-15주)

| 주차   | 태스크                                                        | 화면 수 |
| ------ | ------------------------------------------------------------- | ------- |
| 12-13주| 순찰점검 (목록, 상세, NFC 스캔)                               | 3       |
| 14-15주| 대시보드 (BEMS, 알람, 운영현황) + 차트 연동                   | 3       |

#### Phase 4: Native & Performance (16-18주)

| 주차 | 태스크                                                               |
| ---- | -------------------------------------------------------------------- |
| 16주 | Push Notification (expo-notifications) + 딥링크 처리                 |
| 17주 | OTA 업데이트 (expo-updates) 정책 수립, 런타임 버전 관리              |
| 18주 | 성능 최적화 (Hermes 분석, Tamagui Static Extraction, 번들 최적화)    |

#### Phase 5: QA & Launch (19-20주)

| 주차 | 태스크                                                               |
| ---- | -------------------------------------------------------------------- |
| 19주 | 전수 기능 테스트, 물리 기기 5종 성능 벤치마크, 버그 수정             |
| 20주 | 스토어 제출 (App Store, Play Store), 운영 모니터링 활성화            |

### 7.3 Milestones

| Milestone               | 날짜  | 기준                                       |
| ----------------------- | ----- | ------------------------------------------ |
| **M0: POC 완료**        | 02-28 | AppGuard + NFC + Dev Client 동작 확인      |
| **M1: Core 완료**       | 03-21 | API/State/UI 인프라 완료                   |
| **M2: Auth + Main 완료**| 04-25 | 인증 + 메인 탭 + 작업지시 화면 완료        |
| **M3: All Screens 완료**| 05-23 | 순찰 + 대시보드 화면 완료                  |
| **M4: Native 완료**     | 06-13 | Push/OTA/성능 최적화 완료                  |
| **M5: Launch**          | 07-01 | 스토어 배포 완료                           |

---

## 8. 리스크 관리

### 8.1 기술 리스크

| 리스크                        | 확률 | 영향 | 완화 전략                                              |
| ----------------------------- | ---- | ---- | ------------------------------------------------------ |
| AppGuard + Expo 미호환        | 중   | HIGH | Phase 0 POC에서 검증, 실패 시 Sentry만 사용            |
| NFC + Dev Client 이슈         | 중   | HIGH | Config Plugin 사전 준비, Bare eject 백업 플랜          |
| expo-updates 정책 복잡성      | 중   | MED  | 단순한 채널 전략으로 시작, 점진적 고도화               |
| Tamagui 학습 곡선             | 저   | MED  | Phase 0에서 충분한 셋업, 문서화                        |

### 8.2 일정 리스크

| 리스크                  | 확률 | 영향 | 완화 전략                                |
| ----------------------- | ---- | ---- | ---------------------------------------- |
| 화면 개발 지연          | 중   | MED  | Orval 자동 생성으로 보일러플레이트 최소화 |
| 대시보드 차트 복잡성    | 중   | LOW  | P2로 우선순위 낮춤, 필요 시 v2.1 연기    |
| QA 기간 부족            | 저   | MED  | 자동화 테스트 우선 구축                  |

### 8.3 Contingency Plans

1. **AppGuard 호환 실패**: Sentry Session Replay로 대체, 앱 무결성은 Play Integrity / DeviceCheck 사용
2. **일정 2주 지연**: 대시보드를 v2.1로 연기
3. **성능 목표 미달**: Hermes 최적화, Lazy Loading 강화

---

## 9. 테스트 전략

### 9.1 테스트 유형

| 유형              | 도구          | 커버리지 목표    |
| ----------------- | ------------- | ---------------- |
| Unit Tests        | Jest + RTL    | 80%              |
| Integration Tests | Jest + MSW    | 70%              |
| E2E Tests         | Maestro       | 주요 플로우 100% |
| Performance Tests | Flashlight    | 모든 화면        |

### 9.2 성능 벤치마크 (물리 기기 5종)

| 시나리오           | 측정 항목           | 기준    |
| ------------------ | ------------------- | ------- |
| Cold Start         | TTI                 | < 1.2초 |
| 작업 목록 로드     | FCP                 | < 800ms |
| 화면 전환          | Animation Complete  | < 100ms |
| 목록 스크롤        | Frame Rate          | 60 FPS  |

---

## 10. 개발 가이드라인

### 10.1 코드 규칙

1. **100% TypeScript**: `any` 사용 금지, Strict Mode 필수
2. **Tamagui Only**: StyleSheet 사용 금지 (예외: 네이티브 모듈 연동)
3. **No Logic in UI**: 비즈니스 로직은 `src/features/*/hooks/`에만 작성
4. **Security First**: SecureStore 외 민감 정보 저장 금지

### 10.2 파일 명명 규칙

```
컴포넌트: PascalCase.tsx (Button.tsx, WorkOrderCard.tsx)
훅: use*.ts (useAuth.ts, useWorkOrders.ts)
스토어: *.store.ts (auth.store.ts)
유틸: camelCase.ts (validation.ts, storage.ts)
```

### 10.3 커밋 규칙

```
feat: 새로운 기능
fix: 버그 수정
refactor: 리팩토링
style: 코드 스타일
docs: 문서
test: 테스트
chore: 빌드/설정
```

---

## 11. Appendix

### A. v1 → v2 사용자 데이터 이관

v1 앱에서 v2 앱으로 **사용자 입장에서** 이관할 데이터:

| 데이터        | 이관 방법                        | 비고                    |
| ------------- | -------------------------------- | ----------------------- |
| 로그인 상태   | 재로그인 필요                    | v2 첫 실행 시           |
| 설정 (테마)   | 재설정 필요                      | Senior Mode 등          |
| 즐겨찾기      | 재설정 필요                      | 서버 저장 시 자동 복구  |

**참고**: 서버에 저장된 데이터(작업지시, 순찰 기록 등)는 API를 통해 자동으로 조회됨

### B. 용어 정의

| 용어          | 정의                                                   |
| ------------- | ------------------------------------------------------ |
| CNG           | Continuous Native Generation (Expo의 네이티브 코드 생성) |
| Dev Client    | Expo 개발용 커스텀 빌드                                |
| EAS           | Expo Application Services                              |
| Orval         | OpenAPI → TypeScript + React Query 생성기              |
| POC           | Proof of Concept                                       |
| Senior Mode   | 고령 사용자를 위한 확대 UI 모드                        |
| TTI           | Time to Interactive                                    |

---

_Document End_
_PRD Version: 2.1 (Phoenix - Greenfield)_
_Last Updated: 2026-02-06_
