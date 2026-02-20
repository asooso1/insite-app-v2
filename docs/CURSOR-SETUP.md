# Cursor 설정 가이드 (Claude Code 동기화)

> Claude Code에서 사용 중인 oh-my-claudecode, claude-mem, 규칙을 Cursor에서도 동일하게 사용하기 위한 설정

---

## 설정 개요

| 항목                | Claude Code     | Cursor               |
| ------------------- | --------------- | -------------------- |
| oh-my-claudecode    | 플러그인 (자동) | .cursor/mcp.json     |
| claude-mem          | 플러그인 (자동) | .cursor/mcp.json     |
| 규칙 (CLAUDE.md 등) | 자동 로드       | .cursor/rules/\*.mdc |

---

## MCP 서버 (.cursor/mcp.json)

다음 4개 MCP 서버가 구성되어 있습니다:

1. **oh-my-claudecode-tools**
   - LSP (hover, goto definition, find references 등)
   - State, Notepad, Project Memory
   - AST grep, Python REPL

2. **oh-my-claudecode-codex**
   - Codex CLI 연동 (아키텍트, 플래너, 코드 리뷰)

3. **oh-my-claudecode-gemini**
   - Gemini CLI 연동 (디자이너, 작성, 비전)

4. **claude-mem**
   - 검색(search), 타임라인(timeline), get_observations
   - save_memory (메모 저장)

### 다른 환경에서 수정할 항목

다른 PC·다른 사용자로 작업할 때 아래 항목을 환경에 맞게 수정하세요.

| 수정 대상    | 파일               | 수정 내용                                                                                         |
| ------------ | ------------------ | ------------------------------------------------------------------------------------------------- |
| **MCP 경로** | `.cursor/mcp.json` | 4개 서버의 `args` 절대 경로                                                                       |
| OMC tools    | `.cursor/mcp.json` | `/Users/{본인사용자명}/.claude/plugins/cache/omc/oh-my-claudecode/{버전}/bridge/mcp-server.cjs`   |
| OMC codex    | `.cursor/mcp.json` | `…/bridge/codex-server.cjs`                                                                       |
| OMC gemini   | `.cursor/mcp.json` | `…/bridge/gemini-server.cjs`                                                                      |
| claude-mem   | `.cursor/mcp.json` | `/Users/{본인사용자명}/.claude/plugins/cache/thedotmack/claude-mem/{버전}/scripts/mcp-server.cjs` |

**현재 설정 기준 경로 (예시)**:

- OMC: `~/.claude/plugins/cache/omc/oh-my-claudecode/4.2.14/`
- claude-mem: `~/.claude/plugins/cache/thedotmack/claude-mem/10.0.0/`

**확인 방법**: 해당 경로에 플러그인이 있는지 확인 후, 없으면 Claude Code에서 플러그인 설치 후 캐시 경로 확인.

**Windows**: `C:\Users\{사용자명}\.claude\plugins\cache\...` 형식으로, `\` 사용.

### MCP 활성화 확인

1. Cursor 완전 종료 후 재시작
2. `설정 > Tools & MCP`에서 녹색 점으로 연결 확인
3. 채팅에서 "이전에 이 프로젝트에서 뭘 했지?" 등으로 claude-mem 검색 테스트

---

## Rules (.cursor/rules/)

| 파일               | 용도                                     |
| ------------------ | ---------------------------------------- |
| insite-project.mdc | CLAUDE.md + AGENTS.md 통합, 항상 적용    |
| insite-design.mdc  | 디자인 작업 가이드, theme/ui 파일에 적용 |

---

## claude-mem Cursor 훅 (선택)

Claude Code 플러그인으로 claude-mem을 설치했다면, Cursor 훅을 추가로 설치하면 편집·쉘 명령 등이 자동으로 캡처됩니다:

```bash
# claude-mem 플러그인 디렉터리에서
cd ~/.claude/plugins/cache/thedotmack/claude-mem/10.0.0
bun run cursor:install   # 또는 cursor:setup (대화형 설정)
```

> 주: `cursor:install` 스크립트가 package.json에 없다면, claude-mem 전체 저장소를 클론한 뒤 해당 폴더에서 실행하세요.

---

## 동기화 상태

- **규칙**: Cursor Rules에 CLAUDE.md/AGENTS.md 내용 반영됨
- **MCP**: OMC 3개 + claude-mem 1개 서버 연결
- **프로젝트 메모리**: `.omc/project-memory.json` (OMC/Claude Code와 공유)

---

_마지막 업데이트: 2026-02-19_
