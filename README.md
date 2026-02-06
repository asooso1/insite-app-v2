# Insite App v2.0

시설관리 모바일 앱 - Expo SDK 54 기반 신규 개발

## 빠른 시작

### 1. 의존성 설치

```bash
bun install
```

> **참고**: 이 프로젝트는 Bun을 패키지 매니저로 사용합니다.

### 2. 개발 서버 실행

```bash
bun start
# 또는
npx expo start
```

---

## Development Build 테스트

### iOS 시뮬레이터

1. **빌드 다운로드**
   ```bash
   # EAS에서 최신 iOS 시뮬레이터 빌드 다운로드
   eas build:run -p ios --profile development-simulator
   ```

   또는 직접 다운로드:
   - [iOS Simulator Build](https://expo.dev/artifacts/eas/nrrAtuuAFyrpDjo1PPMWcq.tar.gz)
   - `.tar.gz` 파일 다운로드 후 압축 해제
   - `.app` 파일을 시뮬레이터에 드래그 앤 드롭

2. **개발 서버 실행**
   ```bash
   bun start
   ```

3. **앱 실행**
   - 시뮬레이터에서 "Insite (Dev)" 앱 실행
   - 개발 서버 URL이 자동으로 연결됨

### Android 에뮬레이터 / 실기기

1. **APK 다운로드**
   ```bash
   # EAS에서 최신 Android 빌드 다운로드
   eas build:run -p android --profile development
   ```

   또는 직접 다운로드:
   - [Android APK](https://expo.dev/artifacts/eas/mqAKjnqF2CUP8w2e9WULJp.apk)

2. **APK 설치**

   **에뮬레이터:**
   ```bash
   adb install <다운로드한-apk-파일>.apk
   ```

   **실기기:**
   - APK 파일을 기기로 전송
   - 파일 관리자에서 APK 실행하여 설치
   - "알 수 없는 앱 설치" 권한 허용 필요

3. **개발 서버 연결**
   ```bash
   bun start
   ```

   **같은 네트워크인 경우:**
   - 앱 실행 시 자동으로 개발 서버 감지

   **수동 연결:**
   - 앱에서 개발자 메뉴 열기 (흔들기 또는 `adb shell input keyevent 82`)
   - "Enter URL manually" 선택
   - `http://<컴퓨터-IP>:8081` 입력

### iOS 실기기

> iOS 실기기 테스트는 Apple Developer 계정 및 프로비저닝 프로파일 설정이 필요합니다.

1. **실기기용 빌드 생성**
   ```bash
   eas build --profile development --platform ios
   ```

2. **설치**
   - EAS 대시보드에서 QR 코드로 설치
   - 또는 Apple TestFlight 사용

---

## 개발 명령어

```bash
# 개발 서버 시작
bun start

# iOS 로컬 빌드 (Xcode 필요)
bun run ios

# Android 로컬 빌드 (Android Studio 필요)
bun run android

# 타입 체크
bun run typecheck

# 린트
bun run lint

# 포맷팅
bun run format
```

## EAS 빌드 명령어

```bash
# Development 빌드
bun run build:dev

# Staging 빌드
eas build --profile staging --platform all

# Production 빌드
bun run build:prod
```

---

## 프로젝트 구조

```
InsiteApp-v2/
├── app/                    # Expo Router 페이지
├── src/
│   ├── api/               # API 클라이언트
│   ├── components/        # 공용 컴포넌트
│   ├── features/          # 기능별 모듈
│   ├── stores/            # Zustand 스토어
│   └── ...
├── docs/                   # 프로젝트 문서
├── credentials/            # 서명 키 (gitignore)
├── CLAUDE.md              # 개발 가이드
└── TASK-TRACKER.md        # 태스크 추적
```

---

## 문서

- [개발 가이드](./CLAUDE.md) - 코드 규칙 및 프로젝트 설정
- [태스크 추적](./TASK-TRACKER.md) - 스프린트 진행 상황
- [PRD](./docs/PRD-INSITE-V2-FINAL.md) - 제품 요구사항

---

## 환경 정보

| 항목 | 버전 |
|------|------|
| Expo SDK | 54 |
| React Native | 0.81.x |
| React | 18.3.1 |
| TypeScript | 5.9.x |
| Node.js | 20.x |
| Bun | 1.1.x |

---

## 트러블슈팅

### EAS 빌드 실패 시

1. **npm 대신 Bun 사용 확인**
   ```bash
   # bun.lockb 파일이 있어야 함
   ls bun.lockb
   ```

2. **의존성 재설치**
   ```bash
   rm -rf node_modules
   bun install
   ```

### 개발 서버 연결 안 될 때

1. **같은 네트워크 확인**
2. **방화벽 확인** (포트 8081)
3. **Metro 캐시 클리어**
   ```bash
   npx expo start --clear
   ```

### Android 설치 실패 시

1. **"알 수 없는 앱 설치" 허용**
   - 설정 > 보안 > 알 수 없는 앱 설치 허용

2. **기존 앱 제거 후 재설치**
   ```bash
   adb uninstall com.hdclandmark.insite.dev
   ```
