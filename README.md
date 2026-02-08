# Insite App v2.0

시설관리 모바일 앱 - Expo SDK 54 + Tamagui + React Native Reanimated

---

## 앱 유형별 개발 가이드

### 개발 환경 비교표

| 구분 | Expo Go | Development Build | Staging Build | Production Build |
|------|---------|-------------------|---------------|------------------|
| **용도** | 빠른 프로토타이핑 | 개발/디버깅 | 내부 테스트 | 스토어 배포 |
| **네이티브 모듈** | 제한적 | 전체 지원 | 전체 지원 | 전체 지원 |
| **NFC/카메라** | 미지원 | 지원 | 지원 | 지원 |
| **Hot Reload** | 지원 | 지원 | 미지원 | 미지원 |
| **디버그 메뉴** | 지원 | 지원 | 지원 | 미지원 |
| **설치 방법** | 앱스토어 | APK/Simulator | APK/Simulator | 스토어 |

---

## 1. Expo Go 개발 (빠른 프로토타이핑)

> **주의**: NFC, 카메라 등 네이티브 모듈이 필요한 기능은 Development Build에서만 테스트 가능

### 설치 및 실행

```bash
# 의존성 설치
npm install

# Expo Go 모드로 개발 서버 시작
npm start
# 또는
npx expo start
```

### 테스트 방법
1. iOS/Android에서 **Expo Go** 앱 설치 (앱스토어)
2. 터미널에 표시된 QR 코드 스캔
3. 자동으로 앱 로드됨

### 제한사항
- `expo-camera`, `react-native-nfc-manager` 등 네이티브 모듈 사용 불가
- Tamagui 일부 최적화 기능 미지원
- 앱 아이콘/스플래시 커스텀 불가

---

## 2. Development Build (개발용 네이티브 앱)

> **권장**: 실제 개발 시 이 방법 사용. 모든 네이티브 기능 + Hot Reload 지원

### 2.1 Development Build 생성

```bash
# iOS + Android 모두 빌드 (EAS 클라우드)
npm run build:dev
# 또는
eas build --profile development --platform all

# iOS만 빌드
eas build --profile development --platform ios

# Android만 빌드
eas build --profile development --platform android
```

### 2.2 빌드 설치

**iOS 시뮬레이터:**
```bash
# EAS에서 자동 설치
eas build:run -p ios --profile development

# 또는 수동 설치
# 1. EAS 대시보드에서 .tar.gz 다운로드
# 2. 압축 해제 후 .app 파일을 시뮬레이터에 드래그
```

**Android 에뮬레이터/실기기:**
```bash
# EAS에서 자동 설치
eas build:run -p android --profile development

# 또는 수동 설치
adb install <다운로드한-apk>.apk
```

### 2.3 개발 서버 연결

```bash
# Dev Client 모드로 개발 서버 시작
npm run dev
# 또는
npx expo start --dev-client
```

**연결 방법:**
1. 설치된 "Insite (Dev)" 앱 실행
2. 자동으로 개발 서버 감지 (같은 네트워크)
3. 수동 연결 시: 개발자 메뉴 > "Enter URL manually" > `http://<IP>:8081`

### 2.4 개발 워크플로우

```bash
# 1. Development Build가 기기/시뮬레이터에 설치되어 있는지 확인

# 2. 개발 서버 시작 (--dev-client 필수!)
npm run dev

# 3. 앱에서 개발 서버 연결

# 4. 코드 수정 → 자동 Hot Reload
```

---

## 3. Staging Build (내부 테스트용)

> **용도**: QA 팀 테스트, 베타 테스터 배포

### 빌드 생성

```bash
# Staging 빌드 (iOS + Android)
npm run build:staging
# 또는
eas build --profile staging --platform all
```

### 특징
- **Hot Reload 미지원** (빌드된 번들 사용)
- **디버그 메뉴 사용 가능** (문제 확인용)
- **API 엔드포인트**: `stage.hdc-insite.com:8083`
- **앱 이름**: "Insite (Staging)"

### 배포 방법
```bash
# EAS 링크 생성
eas build:list --status finished --limit 1

# QR 코드로 설치 (Android만 직접 설치 가능)
# iOS는 TestFlight 또는 Ad-hoc 배포 필요
```

---

## 4. Production Build (스토어 배포용)

> **용도**: 앱스토어/플레이스토어 배포

### 빌드 생성

```bash
# Production 빌드 (iOS + Android)
npm run build:prod
# 또는
eas build --profile production --platform all
```

### 특징
- **디버그 기능 완전 제거**
- **코드 최적화 및 난독화**
- **API 엔드포인트**: `www.hdc-insite.com:8083`
- **앱 이름**: "Insite"

### 스토어 제출

```bash
# iOS App Store 제출
eas submit --platform ios

# Google Play Store 제출
eas submit --platform android
```

---

## 개발 명령어 요약

### 일상적인 개발

```bash
# 의존성 설치
npm install

# Development Build로 개발 (권장)
npm run dev

# Expo Go로 빠른 테스트 (네이티브 모듈 미사용 시)
npm start

# 캐시 클리어 후 시작
npx expo start --clear -c
```

### 코드 품질

```bash
# 타입 체크
npm run typecheck

# 린트
npm run lint

# 린트 자동 수정
npm run lint:fix

# 코드 포맷팅
npm run format
```

### 빌드 명령어

```bash
# Development Build
npm run build:dev

# Staging Build
npm run build:staging

# Production Build
npm run build:prod
```

### API 코드 생성

```bash
# OpenAPI 스펙에서 API 훅 자동 생성
npm run api:generate
```

---

## 환경 설정

### API 엔드포인트

| 환경 | URL | 용도 |
|------|-----|------|
| Development | `121.133.17.22:8083` | 개발/테스트 |
| Staging | `stage.hdc-insite.com:8083` | 내부 테스트 |
| Production | `www.hdc-insite.com:8083` | 실서비스 |

### EAS 프로파일 (eas.json)

| 프로파일 | 용도 | 빌드 타입 |
|----------|------|-----------|
| `development` | 개발용 | Debug + Dev Client |
| `staging` | 내부 테스트 | Release + Debug 메뉴 |
| `production` | 스토어 배포 | Release |

---

## 트러블슈팅

### Metro Bundler 에러

```bash
# 캐시 클리어 후 재시작
npx expo start --clear -c

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

### Babel 플러그인 에러

```bash
# Reanimated/Worklets 관련 에러 시
rm -rf node_modules package-lock.json
npm install

# babel.config.js 확인 (reanimated/plugin이 마지막에 있어야 함)
```

### Development Build 연결 안 될 때

1. **같은 네트워크 확인** - 컴퓨터와 기기가 같은 WiFi에 연결
2. **방화벽 확인** - 포트 8081 허용
3. **개발 서버 모드 확인** - `--dev-client` 플래그 사용
4. **IP 수동 입력** - 개발자 메뉴에서 직접 URL 입력

### Android 설치 실패

```bash
# 기존 앱 제거 후 재설치
adb uninstall com.hdclandmark.insite.dev
adb install <apk-파일>.apk
```

### iOS 시뮬레이터 빌드 설치

```bash
# 자동 설치
eas build:run -p ios --profile development

# 수동 설치
# 1. .tar.gz 다운로드 및 압축 해제
# 2. Simulator 앱 실행
# 3. .app 파일을 시뮬레이터 창에 드래그
```

---

## 프로젝트 구조

```
InsiteApp-v2/
├── app/                    # Expo Router 페이지
│   ├── (auth)/            # 인증 화면
│   ├── (main)/            # 메인 화면
│   └── _layout.tsx        # 루트 레이아웃
├── src/
│   ├── api/               # API 클라이언트 + Orval 생성
│   ├── components/        # 공용 컴포넌트
│   │   └── ui/           # Atomic 컴포넌트
│   ├── features/          # 기능별 모듈
│   ├── stores/            # Zustand 스토어
│   ├── theme/             # Tamagui 테마
│   └── hooks/             # 공용 훅
├── specs/                  # OpenAPI 스펙
├── docs/                   # 프로젝트 문서
├── babel.config.js        # Babel 설정
├── CLAUDE.md              # 개발 가이드
└── TASK-TRACKER.md        # 태스크 추적
```

---

## 기술 스택

| 카테고리 | 기술 | 버전 |
|----------|------|------|
| Framework | Expo SDK | 54 |
| UI | Tamagui | 2.0.0-rc |
| Animation | React Native Reanimated | 4.x |
| State | Zustand + TanStack Query | 5.x |
| API | Axios + Orval | 8.x |
| Form | React Hook Form + Zod | 7.x |
| Language | TypeScript | 5.9.x |

---

## 문서 링크

- [개발 가이드](./CLAUDE.md) - 코드 규칙 및 커밋 규칙
- [태스크 추적](./TASK-TRACKER.md) - 스프린트 진행 상황
- [PRD](./docs/PRD-INSITE-V2-FINAL.md) - 제품 요구사항
- [마이그레이션 플랜](./docs/MIGRATION-PLAN-2026-REVIEWED.md) - 기술 스택 결정

---

_마지막 업데이트: 2026-02-08_
