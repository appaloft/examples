#!/usr/bin/env bash
# Local smoke: npm build + docker image health (or vite build only if no docker).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== vite-static: npm install + build =="
npm install --silent
npm run build
test -f dist/index.html
test -f dist/health

if command -v docker >/dev/null 2>&1; then
  echo "== vite-static: docker build + health =="
  image="appaloft-example-vite-static:local"
  docker build -t "$image" .
  cid="$(docker run -d --rm -p 18080:8080 "$image")"
  cleanup() { docker stop "$cid" >/dev/null 2>&1 || true; }
  trap cleanup EXIT
  for _ in $(seq 1 40); do
    if curl -fsS "http://127.0.0.1:18080/health" >/tmp/appaloft-vite-static-health.json; then
      cat /tmp/appaloft-vite-static-health.json
      echo
      curl -fsS "http://127.0.0.1:18080/" | head -c 200
      echo
      exit 0
    fi
    sleep 0.25
  done
  echo "docker health check failed" >&2
  docker logs "$cid" >&2 || true
  exit 1
fi

echo "docker not available; build-only smoke ok"
