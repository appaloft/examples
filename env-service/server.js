import http from "node:http";

/**
 * Demonstrates non-secret env injection.
 * Set APP_NAME / GREETING / FEATURE_FLAG at deploy time — never commit real secrets.
 */
const port = Number(process.env.PORT || process.env.APPALOFT_PORT || 3000);
const appName = process.env.APP_NAME || "appaloft-example-env-service";
const greeting = process.env.GREETING || "Hello from env-service";
const featureFlag = process.env.FEATURE_FLAG || "off";
const startedAt = new Date().toISOString();

function json(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function envSnapshot() {
  return {
    APP_NAME: appName,
    GREETING: greeting,
    FEATURE_FLAG: featureFlag,
    PORT: String(port),
  };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const path = url.pathname;

  if (req.method === "GET" && (path === "/health" || path === "/api/health")) {
    json(res, 200, {
      ok: true,
      service: appName,
      status: "healthy",
      startedAt,
      now: new Date().toISOString(),
    });
    return;
  }

  if (req.method === "GET" && path === "/api/config") {
    json(res, 200, {
      service: appName,
      // Non-secret demo values only. Do not put API keys or passwords here.
      env: envSnapshot(),
      note: "Values come from process env (APP_NAME, GREETING, FEATURE_FLAG, PORT).",
    });
    return;
  }

  if (req.method === "GET" && (path === "/" || path === "/index.html")) {
    const body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${appName}</title>
    <style>
      :root { color-scheme: light dark; font-family: ui-sans-serif, system-ui, sans-serif; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b1220; color: #e8eefc; }
      main { max-width: 40rem; padding: 2rem; border: 1px solid #243149; border-radius: 1rem; background: #121a2b; }
      code { color: #9fd0ff; } p { color: #b7c3db; line-height: 1.5; }
    </style>
  </head>
  <body>
    <main>
      <h1>${appName}</h1>
      <p>${greeting}</p>
      <p>Feature flag: <code>${featureFlag}</code></p>
      <p>JSON config: <code>/api/config</code> · Health: <code>/health</code></p>
      <p>Started at <code>${startedAt}</code></p>
    </main>
  </body>
</html>`;
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "content-length": Buffer.byteLength(body),
    });
    res.end(body);
    return;
  }

  json(res, 404, { ok: false, error: "not_found", path });
});

server.listen(port, "0.0.0.0", () => {
  console.log(
    JSON.stringify({
      level: "info",
      message: "appaloft-example-env-service.listening",
      port,
      health: "/health",
      env: envSnapshot(),
    }),
  );
});
