#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CODEX_HOME="${HOME}/.codex"
PROMPTS_SRC="${PROJECT_ROOT}/.codex/prompts"
PROMPTS_DST="${CODEX_HOME}/prompts"
CURSOR_MCP_JSON="${PROJECT_ROOT}/.cursor/mcp.json"
CODEX_CONFIG="${CODEX_HOME}/config.toml"

if [[ ! -d "${PROMPTS_SRC}" ]]; then
  echo "[오류] 소스 프롬프트 디렉토리가 없습니다: ${PROMPTS_SRC}" >&2
  exit 1
fi

mkdir -p "${PROMPTS_DST}"
cp "${PROMPTS_SRC}"/*.md "${PROMPTS_DST}/"

echo "[완료] Codex 프롬프트 동기화: ${PROMPTS_SRC} -> ${PROMPTS_DST}"

if [[ -f "${CURSOR_MCP_JSON}" && -f "${CODEX_CONFIG}" ]]; then
  CODEX_CONFIG_PATH="${CODEX_CONFIG}" CURSOR_MCP_PATH="${CURSOR_MCP_JSON}" python3 - <<'PY'
from pathlib import Path
import json
import os

cfg_path = Path(os.environ["CODEX_CONFIG_PATH"])
cursor_path = Path(os.environ["CURSOR_MCP_PATH"])
start='# ============================================================\n# Claude Code MCP sync (generated from .cursor/mcp.json)\n# ============================================================\n'
end='# ============================================================\n# End Claude Code MCP sync\n# ============================================================\n'

text=cfg_path.read_text()
servers=json.loads(cursor_path.read_text()).get('mcpServers', {})

lines=[start]
for name, conf in servers.items():
    command=conf.get('command', 'node')
    args=conf.get('args', [])
    enabled=not conf.get('disabled', False)
    enabled_str = 'true' if enabled else 'false'
    args_str=', '.join(f'"{a}"' for a in args)
    lines.append(f'[mcp_servers."{name}"]\n')
    lines.append(f'command = "{command}"\n')
    lines.append(f'args = [{args_str}]\n')
    lines.append(f'enabled = {enabled_str}\n')
    lines.append('startup_timeout_sec = 15\n\n')
lines.append(end)
block=''.join(lines)

if start in text and end in text:
    before=text.split(start)[0]
    after=text.split(end, 1)[1]
    out=before + block + after
else:
    out=(text if text.endswith('\n') else text+'\n') + '\n' + block

cfg_path.write_text(out)
print('[완료] Codex MCP 동기화:', cfg_path)
PY
else
  echo "[건너뜀] MCP 동기화 파일이 없습니다"
fi

echo "[검증] omx doctor 실행"
omx doctor
