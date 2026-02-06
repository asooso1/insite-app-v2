시니어 크로스플랫폼 아키텍트의 관점에서, **Tamagui UI 프레임워크**와 **엔터프라이즈 보안 요구사항**을 모두 반영하여 정교하게 다듬어진 **Insite v2.0 (Phoenix) 통합 PRD 및 상세 태스크 플랜**입니다.

---

# [Master Document] Insite App v2.0 현대화 프로젝트

## 1. 프로젝트 개요 (Executive Summary)

본 프로젝트는 레거시 JS 기반 Bare React Native 앱을 **Expo SDK 54 및 Tamagui 기반**의 현대적 아키텍처로 완전히 재구축하는 프로젝트입니다. 단순히 코드를 옮기는 것이 아니라, 향후 5년 이상의 확장성과 유지보수성을 보장하는 **엔터프라이즈 모바일 표준**을 정립하는 것을 목표로 합니다.

### 1.1 핵심 목표 (Success Metrics)

| 지표                  | 목표                             | 측정 도구           |
| :-------------------- | :------------------------------- | :------------------ |
| **TTI (시동 성능)**   | **1.2초 이내** (Cold Start 기준) | Sentry / Flashlight |
| **TypeScript 적용률** | **100%** (Strict Mode)           | tsc --noEmit        |
| **개발 속도**         | **새 화면 개발 4시간 이내**      | Jira / Git History  |
| **안정성**            | **Crash-free Sessions 99.9%**    | Sentry              |
| **접근성**            | **Senior Mode 완벽 지원**        | 사용자 테스트 (p95) |

---

## 2. 기술 스택 (The "Phoenix" Stack)

### 2.1 Core Framework

- **Engine:** Expo SDK 54 (Managed Workflow via CNG)
- **UI Framework:** **Tamagui** (Compiler-optimized, Theme-nesting 지원)
- **Styling:** Tamagui / Tamagui Tamagui (Typed, Static extraction)
- **Navigation:** Expo Router v4 (Typed Routing)

### 2.2 State & Data

- **Server State:** TanStack Query v5 (PersistQueryClient 기반 오프라인 지원)
- **Client State:** Zustand v5 (Persist Middleware 활용)
- **API Layer:** Axios + **Orval** (Swagger/OpenAPI 기반 Query Hook 자동 생성)
- **Validation:** Zod + React Hook Form

### 2.3 Native & Security

- **NFC:** `react-native-nfc-manager` (Expo Config Plugin 적용)
- **Security:** AppGuard / Diresu (EAS Build 단계에서 삽입)
- **Error Tracking:** Sentry (Session Replay 포함)
- **OTA:** Expo Updates (Fingerprint 검증 시스템 적용)

---

## 3. 핵심 기능 요구사항 (Functional Requirements)

### FR-01: 지능형 테마 시스템 (Senior Mode)

- **Dynamic Theme Nesting:** 사용자의 'Senior Mode' 활성화 시, Tamagui ThemeProvider가 상위 설정을 상속받아 전역 폰트 크기, 터치 영역(Hit Slop), 대비(Contrast)를 즉시 최적화.
- **Adaptive Layout:** 단순 배율 확대가 아닌, 배율에 따라 `XStack`에서 `YStack`으로의 레이아웃 전환 지원.

### FR-02: Contract-First 개발 워크플로우

- **API Spec driven UI:** 백엔드에서 제공한 JSON/Swagger 스펙을 Orval이 해석하여 API 타입과 Query Hook을 자동 생성.
- **Dev Tools:** 개발자 전용 메뉴를 통해 API Host(Stage/Prod) 전환 및 Mock Data 토글 기능 제공.

### FR-03: 데이터 영속성 승계 (Data Migration)

- **Token Handover:** v1 앱의 `AsyncStorage` 데이터를 v2의 `SecureStore`로 자동 마이그레이션하여 재로그인 방지.
- **Offline First:** 작업 결과 입력 시 네트워크 장애가 발생해도 로컬에 저장 후 복구 시 자동 전송.

---

## 4. 상세 태스크 플랜 (20주 상세 일정)

### [Phase 0: Foundation & POC] (1-3주)

- **1주차:** Expo SDK 54 초기 설정 및 EAS Build 파이프라인(Dev/Staging/Prod) 구축.
- **2주차:** **POC - 네이티브 모듈:** AppGuard 및 NFC 연동 테스트 (CNG 작동 여부 확인).
- **3주차:** Tamagui 디자인 토큰 및 Core Theme 정의 (Senior Mode 포함).

### [Phase 1: Core Architecture] (4-6주)

- **4주차:** Orval 기반 API 생성 자동화 및 `apiClient` 래퍼 작성 (Interceptor, Error Handling).
- **5주차:** Zustand 전역 상태 설계 (Auth, User, Settings) 및 데이터 마이그레이션 스크립트 작성.
- **6주차:** 공통 UI 컴포넌트 20종 개발 (Tamagui 기반 Button, Input, Card, Modal).

### [Phase 2: Screen Migration - Part A] (7-11주)

- **7-8주차:** 인증 시스템 (로그인, 기기 승인, 비밀번호 변경) 및 상태 브릿지 적용.
- **9-10주차:** 메인 홈 및 작업지시(Work Order) 목록/상세 화면 구현.
- **11주차:** 작업 결과 입력 폼 및 카메라 연동 (Zod 기반 유효성 검사).

### [Phase 3: Screen Migration - Part B] (12-15주)

- **12-13주차:** 순찰점검(Patrol) 기능 및 NFC 태깅 시스템 최적화.
- **14-15주차:** 대시보드(BEMS, 알람, 운영현황) 차트 연동 및 리포트 화면.

### [Phase 4: Advanced Native & Tuning] (16-18주)

- **16주차:** Push Notification (expo-notifications) 고도화 및 딥링크 처리.
- **17주차:** OTA 업데이트(Expo Updates) 정책 수립 및 런타임 버전 관리 시스템.
- **18주차:** 성능 최적화 (Hermes 메모리 분석, Tamagui 정적 추출 최적화).

### [Phase 5: QA & Launch] (19-20주)

- **19주차:** 전수 기능 테스트(Regression) 및 물리 기기 5종 성능 벤치마크.
- **20주차:** 스토어 제출(App Store, Play Store) 및 운영 모니터링 대시보드 활성화.

---

## 5. 운영 및 리스크 관리 (Risk Management)

### 5.1 네이티브 모듈 충돌 관리

- **Risk:** 특정 네이티브 보안 라이브러리가 Expo Managed Workflow를 지원하지 않을 수 있음.
- **Mitigation:** `expo-prebuild`를 실행하여 `ios/`, `android/` 디렉토리를 로컬에서 생성 후 커스텀 Config Plugin을 작성하여 지속적으로 관리(CNG).

### 5.2 시니어 모드 레이아웃 깨짐

- **Risk:** 고정 높이를 가진 외부 컴포넌트에서 폰트 확대 시 텍스트 잘림 현상 발생.
- **Mitigation:** 모든 UI 높이를 `flex-basis` 또는 `min-height` 기반으로 설계하고, Tamagui의 `Adaptive View`를 활용하여 배율에 따라 레이아웃 구조 변경.

### 5.3 데이터 정합성

- **Risk:** v1과 v2의 API 응답 스키마 미세 차이로 인한 크래시.
- **Mitigation:** API 호출 최상단에 Zod Schema를 배치하여 타입이 맞지 않는 응답은 런타임에서 즉시 캐치하고 Sentry로 전송.

---

## 6. 개발자 가이드라인 (Dev Convention)

1.  **Strict Typing:** 모든 `any` 사용 금지. 복잡한 타입은 `src/types/`에서 공유.
2.  **Component Driven:** 모든 UI는 Tamagui 컴포넌트에서 시작하며, `StyleSheet` 사용은 극도로 제한함.
3.  **No Logic in UI:** 비즈니스 로직은 `useQuery` 또는 `useMutation`을 래핑한 커스텀 Hook(`src/api/hooks/`)에만 작성.
4.  **Security First:** `SecureStore` 외에 민감한 정보(토큰 등) 저장 금지.

---

**아키텍트 총평:** "이 플랜은 단순히 개발 완료를 목표로 하지 않습니다. **Tamagui의 성능**과 **API 자동 생성의 생산성**, 그리고 **엔터프라이즈 네이티브 보안**이 조화를 이루는 고성능 시스템을 구축하는 것이 핵심입니다. 20주 후, Insite 앱은 유지보수가 가장 쉬운 프로젝트가 될 것입니다."
