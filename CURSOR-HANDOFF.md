# Cursor 디자인 작업 핸드오프

> **목적**: Claude Code와 Cursor가 동시에 작업할 때 충돌 없이 병렬 진행하기 위한 공유 문서

---

## 현재 상태

| 항목 | 값 |
|------|-----|
| **main 브랜치** | Sprint 6.1 완료 (2026-02-19) |
| **worktree** | `/Users/jinseok/Documents/insite-app/sub-sprint-cursor` (branch: `sub-sprint-cursor`) |
| **디자인 계획** | `docs/DESIGN-UPGRADE-2026.md` |
| **Cursor 규칙** | `.cursor/rules/insite-design.mdc` |

---

## 역할 분담

### Cursor (sub-sprint-cursor worktree)
**담당**: 디자인 업그레이드 4 Phase

| Phase | 작업 | 상태 |
|-------|------|------|
| Phase 1 | 토큰/테마 정제 (컬러, 타이포, 테마 변수) | 대기 |
| Phase 2 | 핵심 컴포넌트 시각 개선 (GlassCard, Button, Card 등) | 대기 |
| Phase 3 | 애니메이션/피드백 (전환, pressStyle, Toast) | 대기 |
| Phase 4 | 네비게이션 플로우 (탭 인디케이터, 모달 애니메이션) | 대기 |

**수정 가능 파일**:
```
src/theme/tokens.ts
src/theme/themes.ts
src/theme/fonts.ts
src/theme/seniorMode.ts
src/components/ui/*.tsx
```

### Claude Code (InsiteApp-v2 main)
**담당**: 기능 개발, API 연동, 테스트, 빌드

**다음 예정 스프린트**:
- Sprint 6.2: 프로덕션 빌드 & 테스트
- Sprint 7.1: API 연동 (백엔드 스펙 확정 후)
- Sprint 8.x: QA & 테스트

**수정 가능 파일**: 위 Cursor 담당 외 모든 파일

---

## 충돌 방지 규칙

1. **파일 소유권**: 위 분담표를 따름. 상대 영역 파일은 수정하지 않음
2. **동기화 타이밍**: Cursor는 Phase 단위 완료 시 커밋 → Claude Code가 merge
3. **테마 변경**: `src/theme/` 변경은 반드시 Cursor(sub-sprint-cursor)에서 먼저 적용
4. **컴포넌트 인터페이스**: props 시그니처 변경 시 반드시 상대에게 알림 (이 문서에 기록)

---

## 인터페이스 변경 로그

> Cursor/Claude Code가 공유 컴포넌트의 props를 변경할 때 여기에 기록

| 날짜 | 변경자 | 컴포넌트 | 변경 내용 |
|------|--------|----------|-----------|
| - | - | - | (아직 없음) |

---

## 동기화 절차

### Cursor → main 병합 (Phase 완료 시)

```bash
# 1. sub-sprint-cursor worktree에서
cd /Users/jinseok/Documents/insite-app/sub-sprint-cursor
git add src/theme/ src/components/ui/
git commit -m "[Design] Phase N: 설명"

# 2. InsiteApp-v2에서 (Claude Code 또는 수동)
cd /Users/jinseok/Documents/insite-app/InsiteApp-v2
git merge sub-sprint-cursor
```

### main → sub-sprint-cursor 동기화 (기능 변경 반영)

```bash
# sub-sprint-cursor worktree에서
cd /Users/jinseok/Documents/insite-app/sub-sprint-cursor
git merge main
```

---

## 검증 체크리스트 (Phase 병합 전)

- [ ] `npm run typecheck` 통과
- [ ] 시니어 모드 ON 레이아웃 정상
- [ ] 시니어 모드 OFF 레이아웃 정상
- [ ] 브랜드 컬러 (Primary #0066CC, Secondary #FF6B00) 유지
- [ ] WCAG AA 대비비율 4.5:1 이상

---

_마지막 업데이트: 2026-02-19_
