#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v docker >/dev/null 2>&1; then
  echo "docker required for compose-stack smoke" >&2
  exit 1
fi

project="appaloft-example-compose-stack-smoke"
host_port="${COMPOSE_SMOKE_PORT:-18082}"

cleanup() {
  docker compose -p "$project" down -v --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Bind published web port to a free host port for parallel smokes.
export COMPOSE_FILE=docker-compose.yml
docker compose -p "$project" build
docker compose -p "$project" up -d --wait || docker compose -p "$project" up -d

# Discover mapped host port for web:8080
mapped="$(docker compose -p "$project" port web 8080 | awk -F: '{print $NF}')"
if [[ -z "${mapped}" ]]; then
  echo "could not resolve web host port" >&2
  docker compose -p "$project" ps >&2 || true
  exit 1
fi

for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:${mapped}/health" >/tmp/appaloft-compose-health.json \
    && curl -fsS "http://127.0.0.1:${mapped}/api/hello" >/tmp/appaloft-compose-hello.json; then
    cat /tmp/appaloft-compose-health.json
    echo
    cat /tmp/appaloft-compose-hello.json
    echo
    grep -q "compose-stack api sidecar" /tmp/appaloft-compose-hello.json
    exit 0
  fi
  sleep 0.5
done

echo "compose-stack smoke failed" >&2
docker compose -p "$project" logs >&2 || true
exit 1
