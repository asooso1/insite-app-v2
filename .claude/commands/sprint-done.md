# 스프린트 완료 처리

스프린트 완료 시 자동으로:
1. TASK-TRACKER.md 업데이트
2. 커밋 메시지 생성 및 커밋

## 실행 순서

1. TASK-TRACKER.md에서 현재 진행 중인 스프린트 확인
2. 해당 스프린트의 모든 태스크가 완료되었는지 확인
3. 스프린트 상태를 `🎯 완료`로 변경
4. 진행률 업데이트
5. 커밋 메시지 형식:
   ```
   [Sprint X.Y] 스프린트 제목

   완료된 태스크:
   - 태스크 ID: 태스크 설명
   ...

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```
6. `git add TASK-TRACKER.md && git commit`

## 사용법

```
/sprint-done
```

인자 없이 실행하면 현재 진행 중인 스프린트를 자동 감지합니다.
