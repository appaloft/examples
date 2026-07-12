#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${PORT:-18081}"
export PORT

go run . &
pid=$!
trap 'kill "$pid" 2>/dev/null || true' EXIT

for _ in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:${PORT}/health" >/tmp/appaloft-go-http-health.json; then
    cat /tmp/appaloft-go-http-health.json
    echo
    exit 0
  fi
  sleep 0.2
done

echo "go-http health check failed" >&2
exit 1
