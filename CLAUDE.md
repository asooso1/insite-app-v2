# Insite App v2.0

> 시설관리 모바일 앱 현대화 프로젝트 (Expo SDK 54 + Tamagui + TypeScript)

## 핵심 규칙 (반드시 준수)

1. **한국어 필수** - 커밋, 주석, 문서 모두 한국어
2. **TypeScript Strict** - `any` 사용 금지
3. **Tamagui Only** - StyleSheet 사용 금지 (네이티브 모듈 제외)
4. **시니어 모드 필수** - 모든 화면은 시니어 모드 지원 ([가이드](./docs/SENIOR-MODE-GUIDE.md))
5. **로직 분리** - UI 컴포넌트에 비즈니스 로직 금지, hooks/로 분리
6. **Lucide Icons** - 이모지 대신 AppIcon 컴포넌트 사용

## 문서

| 용도 | 파일 |
|------|------|
| 아키텍처 | [AGENTS.md](./AGENTS.md) |
| 태스크 추적 | [TASK-TRACKER.md](./TASK-TRACKER.md) |
| PRD | [docs/PRD-INSITE-V2-FINAL.md](./docs/PRD-INSITE-V2-FINAL.md) |
| 시니어 가이드 | [docs/SENIOR-MODE-GUIDE.md](./docs/SENIOR-MODE-GUIDE.md) |

## 제외 기능

- BEMS API (빌딩 에너지 관리) - v2.0 범위 외, v2.1에서 검토
- PC API (PC 연동)

## 빠른 참조

```bash
npm start          # 개발 서버
npm run typecheck  # 타입 체크
npm run lint       # 린트
npm run api:generate  # Orval API 코드 생성
```

## 커밋 규칙

```
[Sprint X.Y] 스프린트 제목

완료된 태스크:
- 태스크 ID: 태스크 설명

Co-Authored-By: Claude <noreply@anthropic.com>
```

**커밋 타입**: feat | fix | refactor | style | docs | test | chore

---
_상세 아키텍처: [AGENTS.md](./AGENTS.md) | 원본 백업: CLAUDE.md.backup_
