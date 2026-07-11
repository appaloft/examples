#!/usr/bin/env bash
# Local sanity check for the example app (no Appaloft required).
set -euo pipefail
cd "$(dirname "$0")/.."

node server.js &
pid=$!
trap 'kill "$pid" 2>/dev/null || true' EXIT

for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:3000/health" >/tmp/appaloft-example-hello-health.json; then
    cat /tmp/appaloft-example-hello-health.json
    echo
    exit 0
  fi
  sleep 0.2
done

echo "health check failed" >&2
exit 1
