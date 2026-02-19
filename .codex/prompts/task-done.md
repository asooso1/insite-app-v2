---
description: "태스크 완료 상태 반영"
argument-hint: "태스크 ID (예: 2.1.8)"
---
# 태스크 완료 표시

태스크 완료 시:
1. TASK-TRACKER.md에서 해당 태스크 상태 업데이트
2. 완료 날짜 기록

## 실행 순서

1. TASK-TRACKER.md 읽기
2. 해당 태스크 ID 찾기
3. 상태를 `✅ 완료`로 변경
4. 완료일을 오늘 날짜로 기록 (YYYY-MM-DD)
5. 스프린트 진행률 재계산
6. 파일 저장

## 사용법

```bash
/prompts:task-done 2.1.8
/prompts:task-done 3.2.1
```

## 예시

Before:
```
| 2.1.8 | 게스트 토큰 처리 | ⏳ 대기 | - |
```

After:
```
| 2.1.8 | 게스트 토큰 처리 | ✅ 완료 | 2026-02-10 |
```
