#!/usr/bin/env bash
set -euo pipefail

stage_dir="${1:?stage directory is required}"
commit_sha="${2:?commit SHA is required}"

if [[ ! "$commit_sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Invalid commit SHA" >&2
  exit 2
fi

gateway_dir="/home/ubuntu/gateway"
gateway_file="$gateway_dir/cloud_gateway.py"
venv_python="$gateway_dir/venv/bin/python"
database_file="/home/ubuntu/data/majormatch.db"
backup_id="$(date -u +%Y%m%dT%H%M%SZ)-${commit_sha:0:12}"
code_backup_dir="$gateway_dir/backups/code"
database_backup_dir="/home/ubuntu/data/backups"

test -f "$stage_dir/cloud_gateway.py"
test -f "$stage_dir/requirements-gateway.txt"
test -f "$stage_dir/tests/gateway_smoke.py"
test -x "$venv_python"
test -f "$gateway_file"
test -f "$database_file"

echo "Checking gateway dependencies and candidate code"
"$venv_python" -m pip install --disable-pip-version-check --no-cache-dir \
  -r "$stage_dir/requirements-gateway.txt"
"$venv_python" -m py_compile "$stage_dir/cloud_gateway.py"
"$venv_python" "$stage_dir/tests/gateway_smoke.py"

mkdir -p "$code_backup_dir" "$database_backup_dir"
code_backup="$code_backup_dir/cloud_gateway.$backup_id.py"
database_backup="$database_backup_dir/majormatch.$backup_id.db"
cp -p "$gateway_file" "$code_backup"

"$venv_python" - "$database_file" "$database_backup" <<'PY'
import sqlite3
import sys

source = sqlite3.connect(f"file:{sys.argv[1]}?mode=ro", uri=True)
destination = sqlite3.connect(sys.argv[2])
try:
    source.backup(destination)
finally:
    destination.close()
    source.close()
PY

health_ok() {
  local response_file
  response_file="$(mktemp)"
  if curl --silent --show-error --fail --max-time 4 \
      http://127.0.0.1:8001/api/v1/health -o "$response_file" \
      && "$venv_python" - "$response_file" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as response:
    assert json.load(response)["status"] == "healthy"
PY
  then
    rm -f "$response_file"
    return 0
  fi
  rm -f "$response_file"
  return 1
}

wait_for_health() {
  for _ in {1..15}; do
    if health_ok; then
      return 0
    fi
    sleep 2
  done
  return 1
}

install -m 0644 "$stage_dir/cloud_gateway.py" "$gateway_file"

if ! sudo -n systemctl restart majormatch-gateway.service || ! wait_for_health; then
  echo "Gateway failed its health check; restoring previous code" >&2
  cp -p "$code_backup" "$gateway_file"
  sudo -n systemctl restart majormatch-gateway.service
  wait_for_health || echo "Previous gateway also failed its health check" >&2
  exit 1
fi

printf '%s\n' "$commit_sha" > "$gateway_dir/deployed-sha"
echo "Gateway deployed and healthy: $commit_sha"
