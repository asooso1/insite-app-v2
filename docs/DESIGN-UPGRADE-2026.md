# Insite App 디자인 업그레이드 계획

**작성일**: 2026-02-19
**범위**: 시각적 현대화 + UX 개선
**참조**: src/theme/tokens.ts, src/theme/themes.ts, src/components/ui/

---

## 1. 요구사항 요약

| 영역 | 목표 |
|------|------|
| **시각적 현대화** | 컬러, 타이포, 컴포넌트 스타일 전반 개선 |
| **UX 개선** | 애니메이션, 피드백, 네비게이션 흐름 개선 |

**제약사항**:
- 시니어 모드 유지 (PRD 필수)
- Tamagui Only (StyleSheet 금지)
- HDC Insite 브랜드 컬러 유지

---

## 2. 수용 기준 (Acceptance Criteria)

### 시각적 현대화
- [ ] 컬러 팔레트 조정: gray500 대비 ratio 4.5:1 이상 (WCAG AA), primary/secondary 톤 정리
- [ ] 타이포그래피 계층이 명확해짐 (제목/본문/캡션)
- [ ] GlassCard, Button, Card 등 핵심 컴포넌트가 일관된 시각 언어를 가짐
- [ ] 시니어 모드에서 모든 변경사항이 정상 동작함

### UX 개선
- [ ] 화면 전환 시 부드러운 트랜지션 적용 (250-350ms)
- [ ] 버튼/카드 터치 시 시각적 피드백 (pressStyle, scale)
- [ ] 로딩/성공/에러 상태에 대한 명확한 피드백 (Toast, Skeleton)
- [ ] 네비게이션 흐름이 직관적임 (탭, 뒤로가기, 딥링크)

---

## 3. 구현 단계

### Phase 1: 토큰 및 테마 정제 (시각적 현대화 기반)

| 단계 | 작업 | 파일 참조 | 상태 |
|------|------|------------|------|
| 1.1 | 컬러 토큰 미세 조정 (gray 스케일, primary/secondary 톤) | `src/theme/tokens.ts` L14-89 | 대기 |
| 1.2 | 타이포그래피 토큰 확장 (lineHeight, letterSpacing) | `src/theme/fonts.ts` L14-64 | 대기 |
| 1.3 | duration/easing 토큰 활용 검토 | `src/theme/tokens.ts` L352-366 | 대기 |
| 1.4 | 테마 변수 정리 (light, seniorLight) | `src/theme/themes.ts` L73-276 | 대기 |

### Phase 2: 핵심 컴포넌트 시각 개선

| 단계 | 작업 | 파일 참조 | 상태 |
|------|------|------------|------|
| 2.1 | GlassCard - border radius, shadow 일관화 | `src/components/ui/GlassCard.tsx` L118-145 | 대기 |
| 2.2 | Button - 그라디언트/아웃라인 변형 정리 | `src/components/ui/Button.tsx` L59-91 | 대기 |
| 2.3 | Card - variant별 시각적 차별화 | `src/components/ui/Card.tsx` L13-176 | 대기 |
| 2.4 | GlassSearchInput, QuickStatCard - 토큰 기반 스타일 | `src/components/ui/` | 대기 |
| 2.5 | SeniorCard, SeniorButton - 시니어 모드 검증 | `src/components/ui/SeniorCard.tsx`, `SeniorButton.tsx` | 대기 |

### Phase 3: 애니메이션 및 피드백 (UX)

| 단계 | 작업 | 파일 참조 | 상태 |
|------|------|------------|------|
| 3.1 | 화면 전환 애니메이션 (expo-router) | `app/_layout.tsx`, `app/(main)/_layout.tsx` | 대기 |
| 3.2 | pressStyle/scale 일관 적용 (Button, Card, GlassCard) | `src/components/ui/` | 대기 |
| 3.3 | 로딩 스켈레톤 또는 스피너 표준화 | `src/components/ui/` | 대기 |
| 3.4 | Toast/알림 피드백 패턴 정의 | `src/components/ui/Toast.tsx` | 대기 |
| 3.5 | reduceMotion 미디어 쿼리 존중 | `src/theme/tamagui.config.ts` L46 | 대기 |

### Phase 4: 네비게이션 및 플로우

| 단계 | 작업 | 파일 참조 | 상태 |
|------|------|------------|------|
| 4.1 | 탭 전환 시 부드러운 인디케이터 | `app/(main)/_layout.tsx` | 대기 |
| 4.2 | 모달/시트 진입/퇴장 애니메이션 | `app/(main)/(home)/` 모달 사용 화면 | 대기 |
| 4.3 | 스크롤 기반 헤더 (CollapsibleGradientHeader) 검증 | `src/components/ui/CollapsibleGradientHeader.tsx` | 대기 |

---

## 4. 리스크 및 완화

| 리스크 | 완화 방안 |
|--------|-----------|
| 시니어 모드 레이아웃 깨짐 | 각 Phase 후 시니어 모드 QA |
| 성능 저하 (애니메이션) | useNativeDriver, reduceMotion 존중 |
| 기존 화면 회귀 | Phase별 스냅샷/시각적 회귀 체크 |

---

## 5. 검증 단계

1. **시각**: 홈, 작업지시, 순찰, 대시보드 주요 화면 스크린샷 비교
2. **접근성**: 시니어 모드 ON/OFF 전환 시 레이아웃/가독성 확인
3. **성능**: 애니메이션 프레임 드롭 없음 (60fps 목표)
4. **타입**: `npm run typecheck` 통과

---

## 6. 산출물

- `src/theme/tokens.ts` - 업데이트된 토큰
- `src/theme/themes.ts` - 테마 변수 정리
- `src/components/ui/*` - 개선된 컴포넌트
- `docs/DESIGN-UPGRADE-CHANGELOG.md` - 변경 이력 (선택)
