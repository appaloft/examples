#!/usr/bin/env python3
"""Minimal stdlib-only HTTP app for Appaloft git-public deploys."""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get("PORT") or os.environ.get("APPALOFT_PORT") or "8000")
STARTED_AT = datetime.now(timezone.utc).isoformat()
SERVICE = "appaloft-example-python-http"


def _json(handler: BaseHTTPRequestHandler, status: int, body: dict) -> None:
    payload = json.dumps(body).encode("utf-8")
    handler.send_response(status)
    handler.send_header("content-type", "application/json; charset=utf-8")
    handler.send_header("cache-control", "no-store")
    handler.send_header("content-length", str(len(payload)))
    handler.end_headers()
    handler.wfile.write(payload)


def _html() -> bytes:
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Appaloft Python HTTP Example</title>
    <style>
      :root {{ color-scheme: light dark; font-family: ui-sans-serif, system-ui, sans-serif; }}
      body {{ margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b1220; color: #e8eefc; }}
      main {{ max-width: 40rem; padding: 2rem; border: 1px solid #243149; border-radius: 1rem; background: #121a2b; }}
      code {{ color: #9fd0ff; }}
      p {{ color: #b7c3db; line-height: 1.5; }}
    </style>
  </head>
  <body>
    <main>
      <h1>Appaloft Python HTTP</h1>
      <p>Stdlib-only Python service for <strong>git-public</strong> multi-language smoke.</p>
      <p>Port: <code>{PORT}</code> · Health: <code>/health</code></p>
      <p>Started at <code>{STARTED_AT}</code></p>
    </main>
  </body>
</html>""".encode("utf-8")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:  # noqa: A003
        print(json.dumps({"level": "info", "message": format % args}))

    def do_GET(self) -> None:  # noqa: N802
        path = self.path.split("?", 1)[0]
        if path in ("/health", "/api/health"):
            _json(
                self,
                200,
                {
                    "ok": True,
                    "service": SERVICE,
                    "status": "healthy",
                    "port": PORT,
                    "startedAt": STARTED_AT,
                    "now": datetime.now(timezone.utc).isoformat(),
                },
            )
            return
        if path == "/api/hello":
            _json(
                self,
                200,
                {
                    "message": "Hello from Appaloft Python example",
                    "service": SERVICE,
                    "startedAt": STARTED_AT,
                },
            )
            return
        if path in ("/", "/index.html"):
            body = _html()
            self.send_response(200)
            self.send_header("content-type", "text/html; charset=utf-8")
            self.send_header("cache-control", "no-store")
            self.send_header("content-length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        _json(self, 404, {"ok": False, "error": "not_found", "path": path})


def main() -> None:
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(
        json.dumps(
            {
                "level": "info",
                "message": f"{SERVICE}.listening",
                "port": PORT,
                "health": "/health",
            }
        )
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
