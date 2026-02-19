# Codex Prompt 동기화

이 폴더는 `.claude/commands`의 Codex용 복제본입니다.

## 포함 프롬프트
- `new-screen`
- `senior-check`
- `sprint-done`
- `task-done`

## 동기화 방법
```bash
./scripts/sync-claude-to-codex.sh
```

## 사용 예시
```bash
/prompts:new-screen work/create
/prompts:senior-check app/(main)/(home)/work/
/prompts:task-done 3.2.1
/prompts:sprint-done
```

> 실제 Codex 실행 시에는 `~/.codex/prompts/*.md`에도 동일 파일이 있어야 합니다.
