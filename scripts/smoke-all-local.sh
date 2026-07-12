#!/usr/bin/env bash
# Run local smokes for every example that ships scripts/smoke-local.sh.
# Does not require Appaloft Cloud; uses node/python/go/docker as available.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

examples=(
  hello
  vite-static
  python-http
  go-http
  env-service
  compose-stack
)

failed=0
for name in "${examples[@]}"; do
  script="$root/$name/scripts/smoke-local.sh"
  if [[ ! -x "$script" && -f "$script" ]]; then
    chmod +x "$script"
  fi
  if [[ ! -f "$script" ]]; then
    echo "== skip $name (no smoke-local.sh) =="
    continue
  fi
  echo ""
  echo "========================================"
  echo "== smoke: $name"
  echo "========================================"
  if (cd "$root/$name" && bash ./scripts/smoke-local.sh); then
    echo "OK $name"
  else
    echo "FAIL $name" >&2
    failed=$((failed + 1))
  fi
done

echo ""
if [[ "$failed" -ne 0 ]]; then
  echo "smoke-all-local: $failed example(s) failed" >&2
  exit 1
fi
echo "smoke-all-local: all examples passed"
