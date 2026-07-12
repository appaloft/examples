#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${PORT:-13001}"
export PORT
export APP_NAME="${APP_NAME:-smoke-env-service}"
export GREETING="${GREETING:-Hello from smoke}"
export FEATURE_FLAG="${FEATURE_FLAG:-on}"

node server.js &
pid=$!
trap 'kill "$pid" 2>/dev/null || true' EXIT

for _ in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:${PORT}/health" >/tmp/appaloft-env-service-health.json \
    && curl -fsS "http://127.0.0.1:${PORT}/api/config" >/tmp/appaloft-env-service-config.json; then
    cat /tmp/appaloft-env-service-health.json
    echo
    cat /tmp/appaloft-env-service-config.json
    echo
    grep -q "smoke-env-service" /tmp/appaloft-env-service-config.json
    grep -q "Hello from smoke" /tmp/appaloft-env-service-config.json
    grep -q '"FEATURE_FLAG":"on"' /tmp/appaloft-env-service-config.json
    exit 0
  fi
  sleep 0.2
done

echo "env-service health/config check failed" >&2
exit 1
