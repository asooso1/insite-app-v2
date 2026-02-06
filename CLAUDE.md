# Insite App v2.0 - 개발 가이드

## 프로젝트 개요

- **프로젝트명**: Insite App v2.0 (Phoenix)
- **목표**: 시설관리 모바일 플랫폼 신규 개발
- **기간**: 20주 (2026-02-10 ~ 2026-07-01)

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
- 예시:
  ```
  [Sprint 0.1] 프로젝트 초기 설정

  완료된 태스크:
  - 0.1.1: Expo SDK 54 프로젝트 생성
  - 0.1.2: TypeScript Strict Mode 설정
  - 0.1.3: ESLint + Prettier 설정

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
- **StyleSheet 사용 금지**: Tamagui 컴포넌트 사용 (Phase 1 완료 후)
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
│   ├── components/        # 공용 컴포넌트
│   ├── features/          # 기능별 모듈
│   ├── stores/            # Zustand 스토어
│   ├── theme/             # Tamagui 테마
│   ├── constants/         # 상수
│   ├── types/             # 타입 정의
│   └── utils/             # 유틸리티
├── specs/                  # OpenAPI 스펙
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

# 포맷팅
npm run format

# EAS 빌드
npm run build:dev      # 개발
npm run build:staging  # 스테이징
npm run build:prod     # 프로덕션
```

---

## 참조 문서

- [PRD-INSITE-V2-FINAL.md](../InsiteApp/.omc/PRD-INSITE-V2-FINAL.md) - 제품 요구사항
- [TASK-LIST-V2.md](../InsiteApp/.omc/TASK-LIST-V2.md) - 전체 태스크 목록
- [TASK-TRACKER.md](./TASK-TRACKER.md) - 진행 상황 추적

---

## 현재 진행 상황

> 이 섹션은 스프린트 완료 시 자동 업데이트됩니다.

| Phase | 상태 | 진행률 |
|-------|------|--------|
| Phase 0: Setup & POC | 🚧 진행중 | 40% |
| Phase 1: Core Infrastructure | ⏳ 대기 | 0% |
| Phase 2: Screen Development A | ⏳ 대기 | 0% |
| Phase 3: Screen Development B | ⏳ 대기 | 0% |
| Phase 4: Native & Performance | ⏳ 대기 | 0% |
| Phase 5: QA & Launch | ⏳ 대기 | 0% |

**현재 스프린트**: Sprint 0.1 (프로젝트 초기 설정) - 완료
