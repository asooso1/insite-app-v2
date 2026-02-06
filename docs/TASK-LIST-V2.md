# Insite App v2.0 - Task List

## Overview

| Phase   | 기간    | Sprint 수 | 태스크 수 |
| ------- | ------- | --------- | --------- |
| Phase 0 | 1-3주   | 3         | 24        |
| Phase 1 | 4-6주   | 3         | 28        |
| Phase 2 | 7-11주  | 5         | 42        |
| Phase 3 | 12-15주 | 4         | 28        |
| Phase 4 | 16-18주 | 3         | 21        |
| Phase 5 | 19-20주 | 2         | 18        |
| **Total** | **20주** | **20** | **161** |

---

## Phase 0: Setup & POC (Week 1-3)

### Sprint 0.1 - Project Setup (Week 1)

#### 프로젝트 초기화

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 0.1.1 | Expo SDK 54 프로젝트 생성 (`npx create-expo-app`) | P0 | 2h | - |
| 0.1.2 | TypeScript Strict Mode 설정 (tsconfig.json) | P0 | 1h | 0.1.1 |
| 0.1.3 | ESLint + Prettier 설정 | P1 | 2h | 0.1.1 |
| 0.1.4 | 폴더 구조 생성 (app/, src/, specs/, assets/) | P0 | 1h | 0.1.1 |
| 0.1.5 | Git 저장소 초기화 + .gitignore 설정 | P0 | 30m | 0.1.1 |

#### EAS Build 설정

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 0.1.6 | EAS CLI 설치 및 로그인 | P0 | 30m | 0.1.1 |
| 0.1.7 | eas.json 생성 (development/staging/production) | P0 | 1h | 0.1.6 |
| 0.1.8 | app.config.ts 환경별 설정 (bundleId, package) | P0 | 2h | 0.1.7 |
| 0.1.9 | Development Build 생성 및 테스트 (iOS) | P0 | 2h | 0.1.8 |
| 0.1.10 | Development Build 생성 및 테스트 (Android) | P0 | 2h | 0.1.8 |

**Sprint 0.1 Deliverable**: 프로젝트 스캐폴딩 완료, Dev Build 동작 확인

---

### Sprint 0.2 - POC: Native Modules (Week 2)

#### NFC POC

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 0.2.1 | react-native-nfc-manager 설치 | P0 | 1h | 0.1.10 |
| 0.2.2 | NFC Config Plugin 설정 (app.config.ts) | P0 | 2h | 0.2.1 |
| 0.2.3 | NFC 읽기 테스트 화면 구현 | P0 | 3h | 0.2.2 |
| 0.2.4 | 실제 NFC 태그 스캔 테스트 (물리 기기) | P0 | 2h | 0.2.3 |

#### AppGuard POC

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 0.2.5 | AppGuard SDK 문서 검토 및 Expo 호환성 조사 | P0 | 4h | 0.1.10 |
| 0.2.6 | AppGuard Config Plugin 작성 시도 | P0 | 8h | 0.2.5 |
| 0.2.7 | AppGuard 동작 테스트 (또는 대안 조사) | P0 | 4h | 0.2.6 |

#### POC 결과 문서화

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 0.2.8 | POC 결과 보고서 작성 | P0 | 3h | 0.2.4, 0.2.7 |
| 0.2.9 | Phase 0 Gate 리뷰 미팅 | P0 | 2h | 0.2.8 |

**Sprint 0.2 Deliverable**: POC 결과 보고서, Go/No-Go 결정

**🚨 Phase 0 Gate**: AppGuard 실패 시 Sentry Session Replay로 대체 결정

---

### Sprint 0.3 - Theme System (Week 3)

#### Tamagui 설정

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 0.3.1 | Tamagui 패키지 설치 | P0 | 1h | 0.2.9 |
| 0.3.2 | tamagui.config.ts 기본 설정 | P0 | 2h | 0.3.1 |
| 0.3.3 | Design Tokens 정의 (colors, spacing, radius) | P0 | 4h | 0.3.2 |
| 0.3.4 | Typography Tokens 정의 (fontSizes, fontWeights) | P0 | 2h | 0.3.2 |

#### Senior Mode Theme

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 0.3.5 | Base Theme 구현 (light) | P0 | 3h | 0.3.4 |
| 0.3.6 | Senior Theme 구현 (1.2x scale) | P0 | 3h | 0.3.5 |
| 0.3.7 | Theme Provider 설정 및 동적 전환 테스트 | P0 | 2h | 0.3.6 |
| 0.3.8 | Senior Mode 토글 테스트 화면 구현 | P1 | 2h | 0.3.7 |

**Sprint 0.3 Deliverable**: Tamagui 테마 시스템 완료, Senior Mode 동작 확인

---

## Phase 1: Core Infrastructure (Week 4-6)

### Sprint 1.1 - API Layer (Week 4)

#### Axios Client 설정

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 1.1.1 | Axios 인스턴스 생성 (src/api/client.ts) | P0 | 2h | 0.3.8 |
| 1.1.2 | Request Interceptor (Auth Token 주입) | P0 | 2h | 1.1.1 |
| 1.1.3 | Response Interceptor (Error Handling) | P0 | 3h | 1.1.1 |
| 1.1.4 | Token Refresh 로직 구현 | P0 | 4h | 1.1.2 |
| 1.1.5 | 환경별 Base URL 설정 | P0 | 1h | 1.1.1 |

#### Orval 설정

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 1.1.6 | Orval 패키지 설치 | P0 | 30m | 1.1.5 |
| 1.1.7 | orval.config.ts 작성 | P0 | 2h | 1.1.6 |
| 1.1.8 | OpenAPI 스펙 파일 준비 (specs/openapi.yaml) | P0 | 4h | - |
| 1.1.9 | Orval 코드 생성 테스트 | P0 | 2h | 1.1.7, 1.1.8 |
| 1.1.10 | 생성된 Hook 동작 테스트 | P0 | 2h | 1.1.9 |

**Sprint 1.1 Deliverable**: API Client + Orval 자동 생성 파이프라인 완료

---

### Sprint 1.2 - State Management (Week 5)

#### Zustand Stores

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 1.2.1 | Zustand 패키지 설치 | P0 | 30m | 1.1.10 |
| 1.2.2 | Auth Store 구현 (user, token, isAuthenticated) | P0 | 3h | 1.2.1 |
| 1.2.3 | UI Store 구현 (loading, seniorMode, theme) | P0 | 2h | 1.2.1 |
| 1.2.4 | Settings Store 구현 (notifications, favorites) | P1 | 2h | 1.2.1 |

#### Persist 설정

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 1.2.5 | expo-secure-store 설치 및 설정 | P0 | 1h | 1.2.2 |
| 1.2.6 | Auth Store Persist (SecureStore) | P0 | 3h | 1.2.5 |
| 1.2.7 | Settings Store Persist (AsyncStorage) | P1 | 2h | 1.2.4 |

#### TanStack Query 설정

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 1.2.8 | TanStack Query 패키지 설치 | P0 | 30m | 1.2.1 |
| 1.2.9 | QueryClient 설정 (defaultOptions) | P0 | 1h | 1.2.8 |
| 1.2.10 | PersistQueryClient 설정 (Offline 지원) | P1 | 3h | 1.2.9 |

**Sprint 1.2 Deliverable**: Zustand + TanStack Query 상태 관리 완료

---

### Sprint 1.3 - Design System Components (Week 6)

#### Atomic Components

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 1.3.1 | Button 컴포넌트 (variants: primary, secondary, ghost) | P0 | 3h | 1.2.10 |
| 1.3.2 | Input 컴포넌트 (text, password, search) | P0 | 3h | 0.3.8 |
| 1.3.3 | Card 컴포넌트 | P0 | 2h | 0.3.8 |
| 1.3.4 | Badge 컴포넌트 | P1 | 1h | 0.3.8 |
| 1.3.5 | Avatar 컴포넌트 | P1 | 1h | 0.3.8 |
| 1.3.6 | Divider 컴포넌트 | P2 | 30m | 0.3.8 |

#### Form Components

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 1.3.7 | TextField 컴포넌트 (label, error, helper) | P0 | 3h | 1.3.2 |
| 1.3.8 | Select 컴포넌트 | P0 | 3h | 0.3.8 |
| 1.3.9 | Checkbox 컴포넌트 | P0 | 2h | 0.3.8 |
| 1.3.10 | Switch 컴포넌트 | P1 | 1h | 0.3.8 |
| 1.3.11 | DatePicker 컴포넌트 | P1 | 4h | 0.3.8 |

#### Feedback Components

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 1.3.12 | Modal 컴포넌트 | P0 | 3h | 0.3.8 |
| 1.3.13 | Toast 컴포넌트 | P0 | 2h | 0.3.8 |
| 1.3.14 | LoadingOverlay 컴포넌트 | P0 | 1h | 0.3.8 |
| 1.3.15 | Skeleton 컴포넌트 | P1 | 2h | 0.3.8 |
| 1.3.16 | EmptyState 컴포넌트 | P1 | 1h | 0.3.8 |
| 1.3.17 | ErrorBoundary 컴포넌트 | P0 | 2h | 0.3.8 |

**Sprint 1.3 Deliverable**: 공통 UI 컴포넌트 17종 완료

---

## Phase 2: Screen Development - Part A (Week 7-11)

### Sprint 2.1 - Auth Screens (Week 7)

#### Login Screen

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.1.1 | app/(auth)/_layout.tsx 구현 | P0 | 1h | 1.3.17 |
| 2.1.2 | Login 화면 UI 구현 | P0 | 4h | 2.1.1 |
| 2.1.3 | Login Form (react-hook-form + zod) | P0 | 3h | 2.1.2 |
| 2.1.4 | useLogin 훅 구현 (API 연동) | P0 | 3h | 2.1.3 |
| 2.1.5 | 로그인 성공 후 토큰 저장 및 라우팅 | P0 | 2h | 2.1.4 |

#### Guest NFC Login

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.1.6 | Guest Login 화면 UI 구현 | P0 | 3h | 2.1.1 |
| 2.1.7 | NFC 스캔 로직 통합 | P0 | 3h | 2.1.6, 0.2.4 |
| 2.1.8 | 게스트 토큰 처리 로직 | P0 | 2h | 2.1.7 |

#### Device Approval

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.1.9 | Device Pending 화면 UI 구현 | P0 | 2h | 2.1.1 |
| 2.1.10 | 승인 상태 폴링 로직 | P0 | 2h | 2.1.9 |

**Sprint 2.1 Deliverable**: 인증 화면 3종 완료 (Login, Guest NFC, Device Pending)

---

### Sprint 2.2 - Auth Completion & Root Layout (Week 8)

#### Password Change

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.2.1 | Password Change 화면 UI 구현 | P1 | 2h | 2.1.5 |
| 2.2.2 | Password Change Form 구현 | P1 | 2h | 2.2.1 |
| 2.2.3 | useChangePassword 훅 구현 | P1 | 2h | 2.2.2 |

#### Root Layout & Navigation

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.2.4 | app/_layout.tsx (Root Layout) 구현 | P0 | 3h | 2.1.5 |
| 2.2.5 | 인증 상태에 따른 라우팅 분기 | P0 | 3h | 2.2.4 |
| 2.2.6 | Splash Screen 구현 | P0 | 2h | 2.2.4 |
| 2.2.7 | 자동 로그인 (토큰 검증) 로직 | P0 | 3h | 2.2.5 |

#### Auth Flow 테스트

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.2.8 | 로그인 → 홈 플로우 테스트 | P0 | 2h | 2.2.7 |
| 2.2.9 | 토큰 만료 → 재로그인 플로우 테스트 | P0 | 2h | 2.2.8 |
| 2.2.10 | 로그아웃 로직 구현 | P0 | 1h | 2.2.8 |

**Sprint 2.2 Deliverable**: 인증 플로우 완료, Root Navigation 완료

---

### Sprint 2.3 - Main Tabs (Week 9)

#### Tab Navigator

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.3.1 | app/(main)/_layout.tsx (Tab Navigator) | P0 | 3h | 2.2.10 |
| 2.3.2 | Tab Bar 커스텀 스타일링 | P0 | 2h | 2.3.1 |
| 2.3.3 | Tab 아이콘 설정 | P0 | 1h | 2.3.2 |

#### Home Screen

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.3.4 | Home 화면 레이아웃 구현 | P0 | 3h | 2.3.1 |
| 2.3.5 | 오늘의 작업 섹션 구현 | P0 | 3h | 2.3.4 |
| 2.3.6 | 알림/공지 섹션 구현 | P1 | 2h | 2.3.4 |
| 2.3.7 | 퀵 액션 버튼 구현 | P1 | 2h | 2.3.4 |

#### My Work Screen

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.3.8 | My Work 화면 레이아웃 구현 | P0 | 2h | 2.3.1 |
| 2.3.9 | 배정된 작업 목록 구현 | P0 | 3h | 2.3.8 |
| 2.3.10 | 작업 상태별 필터 구현 | P0 | 2h | 2.3.9 |

#### Scan Screen

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.3.11 | Scan 화면 레이아웃 구현 | P0 | 2h | 2.3.1 |
| 2.3.12 | NFC 스캔 모드 구현 | P0 | 3h | 2.3.11 |
| 2.3.13 | QR 스캔 모드 구현 | P0 | 3h | 2.3.11 |

**Sprint 2.3 Deliverable**: 메인 탭 3종 완료 (Home, My Work, Scan)

---

### Sprint 2.4 - Main Tabs Completion (Week 10)

#### Calendar Screen

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.4.1 | Calendar 화면 레이아웃 구현 | P0 | 2h | 2.3.1 |
| 2.4.2 | 캘린더 컴포넌트 구현 (월간 뷰) | P0 | 4h | 2.4.1 |
| 2.4.3 | 일정 목록 연동 | P0 | 3h | 2.4.2 |
| 2.4.4 | 날짜 선택 시 일정 상세 표시 | P0 | 2h | 2.4.3 |

#### Settings Screen

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.4.5 | Settings 화면 레이아웃 구현 | P0 | 2h | 2.3.1 |
| 2.4.6 | 사용자 정보 섹션 구현 | P0 | 2h | 2.4.5 |
| 2.4.7 | Senior Mode 토글 구현 | P0 | 2h | 2.4.5 |
| 2.4.8 | 알림 설정 섹션 구현 | P1 | 2h | 2.4.5 |
| 2.4.9 | 앱 정보 섹션 구현 | P2 | 1h | 2.4.5 |
| 2.4.10 | 로그아웃 버튼 구현 | P0 | 1h | 2.4.5 |

**Sprint 2.4 Deliverable**: 메인 탭 5종 모두 완료

---

### Sprint 2.5 - Work Order Screens (Week 11)

#### Work Order List

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.5.1 | app/(main)/work/index.tsx 레이아웃 | P0 | 2h | 2.4.10 |
| 2.5.2 | 작업 목록 무한 스크롤 구현 | P0 | 3h | 2.5.1 |
| 2.5.3 | 검색 기능 구현 | P0 | 2h | 2.5.1 |
| 2.5.4 | 필터 (상태, 날짜) 구현 | P0 | 3h | 2.5.1 |
| 2.5.5 | Pull to Refresh 구현 | P0 | 1h | 2.5.2 |

#### Work Order Detail

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.5.6 | app/(main)/work/[id]/index.tsx 레이아웃 | P0 | 2h | 2.5.1 |
| 2.5.7 | 작업 상세 정보 표시 | P0 | 3h | 2.5.6 |
| 2.5.8 | 첨부 파일 표시 | P1 | 2h | 2.5.7 |
| 2.5.9 | 작업 시작/완료 버튼 | P0 | 2h | 2.5.7 |

#### Work Order Create & Result

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 2.5.10 | Work Create 화면 구현 | P0 | 4h | 2.5.1 |
| 2.5.11 | Work Result 화면 구현 | P0 | 3h | 2.5.6 |
| 2.5.12 | 카메라 연동 (사진 첨부) | P0 | 3h | 2.5.11 |
| 2.5.13 | 체크리스트 컴포넌트 구현 | P0 | 3h | 2.5.7 |

**Sprint 2.5 Deliverable**: 작업지시 화면 5종 완료

---

## Phase 3: Screen Development - Part B (Week 12-15)

### Sprint 3.1 - Patrol Screens (Week 12)

#### Patrol List

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 3.1.1 | app/(main)/patrol/index.tsx 레이아웃 | P0 | 2h | 2.5.13 |
| 3.1.2 | 순찰 일정 목록 구현 | P0 | 3h | 3.1.1 |
| 3.1.3 | 오늘의 순찰 강조 표시 | P0 | 1h | 3.1.2 |
| 3.1.4 | 순찰 상태 필터 | P1 | 2h | 3.1.2 |

#### Patrol Detail

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 3.1.5 | app/(main)/patrol/[id].tsx 레이아웃 | P0 | 2h | 3.1.1 |
| 3.1.6 | 순찰 경로 표시 | P0 | 3h | 3.1.5 |
| 3.1.7 | 체크포인트 목록 구현 | P0 | 2h | 3.1.6 |
| 3.1.8 | 체크포인트 완료 상태 표시 | P0 | 2h | 3.1.7 |

**Sprint 3.1 Deliverable**: 순찰 목록/상세 화면 완료

---

### Sprint 3.2 - Patrol Scan & NFC (Week 13)

#### Patrol Scan

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 3.2.1 | app/(main)/patrol/scan.tsx 레이아웃 | P0 | 2h | 3.1.8 |
| 3.2.2 | NFC 스캔 UI 구현 | P0 | 3h | 3.2.1 |
| 3.2.3 | 체크포인트 태그 검증 로직 | P0 | 3h | 3.2.2 |
| 3.2.4 | 스캔 결과 저장 및 피드백 | P0 | 2h | 3.2.3 |
| 3.2.5 | 다음 체크포인트 자동 안내 | P1 | 2h | 3.2.4 |

#### NFC 최적화

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 3.2.6 | NFC 스캔 성능 최적화 | P1 | 3h | 3.2.5 |
| 3.2.7 | 스캔 실패 시 재시도 UX | P1 | 2h | 3.2.6 |
| 3.2.8 | 오프라인 스캔 결과 저장 | P0 | 3h | 3.2.4 |

**Sprint 3.2 Deliverable**: 순찰 NFC 스캔 완료

---

### Sprint 3.3 - Dashboard: BEMS (Week 14)

#### BEMS Dashboard

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 3.3.1 | app/(main)/dashboard/bems.tsx 레이아웃 | P1 | 2h | 3.2.8 |
| 3.3.2 | 차트 라이브러리 설정 | P1 | 2h | 3.3.1 |
| 3.3.3 | 에너지 사용량 차트 구현 | P1 | 4h | 3.3.2 |
| 3.3.4 | 기간 선택 필터 구현 | P1 | 2h | 3.3.3 |
| 3.3.5 | 에너지 요약 카드 구현 | P1 | 2h | 3.3.1 |

#### Alarm Dashboard

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 3.3.6 | app/(main)/dashboard/alarm.tsx 레이아웃 | P1 | 2h | 3.2.8 |
| 3.3.7 | 알람 목록 구현 | P1 | 3h | 3.3.6 |
| 3.3.8 | 알람 심각도별 필터 | P1 | 2h | 3.3.7 |
| 3.3.9 | 알람 상세 모달 | P1 | 2h | 3.3.7 |

**Sprint 3.3 Deliverable**: BEMS + 알람 대시보드 완료

---

### Sprint 3.4 - Dashboard: Operating (Week 15)

#### Operating Dashboard

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 3.4.1 | app/(main)/dashboard/operating.tsx 레이아웃 | P1 | 2h | 3.3.9 |
| 3.4.2 | 운영 통계 요약 카드 | P1 | 3h | 3.4.1 |
| 3.4.3 | 작업 현황 차트 | P1 | 3h | 3.4.1 |
| 3.4.4 | 순찰 현황 차트 | P1 | 3h | 3.4.1 |

#### Dashboard Common

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 3.4.5 | 대시보드 탭 네비게이션 | P1 | 2h | 3.4.4 |
| 3.4.6 | 대시보드 데이터 새로고침 | P1 | 1h | 3.4.5 |
| 3.4.7 | 로딩 상태 UI | P1 | 1h | 3.4.5 |

**Sprint 3.4 Deliverable**: 모든 대시보드 완료

---

## Phase 4: Native & Performance (Week 16-18)

### Sprint 4.1 - Push Notifications (Week 16)

#### expo-notifications 설정

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 4.1.1 | expo-notifications 설치 | P0 | 1h | 3.4.7 |
| 4.1.2 | FCM 설정 (Android) | P0 | 3h | 4.1.1 |
| 4.1.3 | APNs 설정 (iOS) | P0 | 3h | 4.1.1 |
| 4.1.4 | Push Token 서버 등록 로직 | P0 | 2h | 4.1.2, 4.1.3 |

#### Notification Handling

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 4.1.5 | Foreground 알림 핸들링 | P0 | 2h | 4.1.4 |
| 4.1.6 | Background 알림 핸들링 | P0 | 2h | 4.1.4 |
| 4.1.7 | 알림 탭 시 딥링크 처리 | P0 | 3h | 4.1.5 |
| 4.1.8 | 알림 권한 요청 UI | P0 | 2h | 4.1.4 |

**Sprint 4.1 Deliverable**: Push Notification + 딥링크 완료

---

### Sprint 4.2 - OTA Updates (Week 17)

#### expo-updates 설정

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 4.2.1 | expo-updates 설정 확인 | P0 | 1h | 4.1.8 |
| 4.2.2 | 업데이트 채널 정책 수립 | P0 | 2h | 4.2.1 |
| 4.2.3 | 런타임 버전 관리 전략 수립 | P0 | 2h | 4.2.2 |
| 4.2.4 | 업데이트 체크 로직 구현 | P0 | 3h | 4.2.3 |

#### Update UX

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 4.2.5 | 업데이트 가능 시 알림 UI | P0 | 2h | 4.2.4 |
| 4.2.6 | 업데이트 다운로드 진행률 표시 | P1 | 2h | 4.2.5 |
| 4.2.7 | 강제 업데이트 처리 | P0 | 2h | 4.2.5 |

**Sprint 4.2 Deliverable**: OTA 업데이트 시스템 완료

---

### Sprint 4.3 - Performance Optimization (Week 18)

#### Performance Profiling

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 4.3.1 | Flashlight 성능 측정 설정 | P0 | 2h | 4.2.7 |
| 4.3.2 | Cold Start 시간 측정 | P0 | 2h | 4.3.1 |
| 4.3.3 | 화면별 렌더링 성능 측정 | P0 | 3h | 4.3.1 |
| 4.3.4 | 메모리 사용량 분석 | P1 | 2h | 4.3.1 |

#### Optimization

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 4.3.5 | Tamagui Static Extraction 최적화 | P0 | 3h | 4.3.3 |
| 4.3.6 | 이미지 최적화 (lazy loading, caching) | P0 | 3h | 4.3.3 |
| 4.3.7 | 번들 크기 분석 및 최적화 | P0 | 3h | 4.3.3 |
| 4.3.8 | 불필요한 리렌더링 제거 | P1 | 2h | 4.3.3 |

**Sprint 4.3 Deliverable**: 성능 목표 달성 (TTI < 1.2초, 60 FPS)

---

## Phase 5: QA & Launch (Week 19-20)

### Sprint 5.1 - QA Testing (Week 19)

#### Automated Testing

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 5.1.1 | Jest 단위 테스트 작성 (커버리지 80%) | P0 | 8h | 4.3.8 |
| 5.1.2 | Maestro E2E 테스트 시나리오 작성 | P0 | 4h | 5.1.1 |
| 5.1.3 | 로그인 플로우 E2E 테스트 | P0 | 2h | 5.1.2 |
| 5.1.4 | 작업지시 플로우 E2E 테스트 | P0 | 2h | 5.1.2 |
| 5.1.5 | 순찰 플로우 E2E 테스트 | P0 | 2h | 5.1.2 |

#### Manual Testing

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 5.1.6 | 전수 기능 테스트 (체크리스트) | P0 | 8h | 5.1.5 |
| 5.1.7 | 물리 기기 5종 테스트 | P0 | 6h | 5.1.6 |
| 5.1.8 | Senior Mode 전체 화면 테스트 | P0 | 3h | 5.1.6 |
| 5.1.9 | 오프라인 시나리오 테스트 | P0 | 2h | 5.1.6 |

**Sprint 5.1 Deliverable**: QA 테스트 완료, 버그 리스트 작성

---

### Sprint 5.2 - Bug Fix & Launch (Week 20)

#### Bug Fix

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 5.2.1 | Critical 버그 수정 | P0 | 12h | 5.1.9 |
| 5.2.2 | High 버그 수정 | P0 | 8h | 5.2.1 |
| 5.2.3 | Medium 버그 수정 (시간 허용 시) | P1 | 4h | 5.2.2 |

#### Store Submission

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 5.2.4 | App Store 스크린샷 준비 | P0 | 2h | 5.2.2 |
| 5.2.5 | Play Store 스크린샷 준비 | P0 | 2h | 5.2.2 |
| 5.2.6 | 스토어 설명 텍스트 작성 | P0 | 2h | 5.2.2 |
| 5.2.7 | Production Build 생성 | P0 | 2h | 5.2.3 |
| 5.2.8 | App Store 제출 | P0 | 1h | 5.2.4, 5.2.7 |
| 5.2.9 | Play Store 제출 | P0 | 1h | 5.2.5, 5.2.7 |

#### Launch Preparation

| ID | Task | Priority | Est. | Dependencies |
|----|------|----------|------|--------------|
| 5.2.10 | Sentry 프로덕션 환경 설정 | P0 | 1h | 5.2.7 |
| 5.2.11 | 운영 모니터링 대시보드 활성화 | P0 | 1h | 5.2.10 |
| 5.2.12 | 롤백 계획 문서화 | P0 | 1h | 5.2.7 |

**Sprint 5.2 Deliverable**: 스토어 제출 완료, 런칭 준비 완료

---

## Summary by Priority

### P0 (Must Have) - 128 Tasks

| Phase | P0 Tasks |
|-------|----------|
| Phase 0 | 22 |
| Phase 1 | 23 |
| Phase 2 | 38 |
| Phase 3 | 18 |
| Phase 4 | 15 |
| Phase 5 | 12 |

### P1 (Should Have) - 28 Tasks

| Phase | P1 Tasks |
|-------|----------|
| Phase 0 | 2 |
| Phase 1 | 5 |
| Phase 2 | 4 |
| Phase 3 | 10 |
| Phase 4 | 5 |
| Phase 5 | 2 |

### P2 (Nice to Have) - 5 Tasks

| Phase | P2 Tasks |
|-------|----------|
| Phase 0 | 0 |
| Phase 1 | 0 |
| Phase 2 | 0 |
| Phase 3 | 0 |
| Phase 4 | 0 |
| Phase 5 | 0 |

---

## Milestone Checklist

- [ ] **M0 (Week 3)**: POC 완료, AppGuard + NFC 동작 확인
- [ ] **M1 (Week 6)**: Core Infrastructure 완료 (API, State, UI 컴포넌트)
- [ ] **M2 (Week 11)**: Auth + Main Tabs + Work Order 화면 완료
- [ ] **M3 (Week 15)**: Patrol + Dashboard 화면 완료
- [ ] **M4 (Week 18)**: Push/OTA/성능 최적화 완료
- [ ] **M5 (Week 20)**: 스토어 배포 완료

---

_Task List Version: 1.0_
_Created: 2026-02-06_
_Total Tasks: 161_
