import http from "node:http";

const port = Number(process.env.PORT || 8080);
const serviceName = process.env.SERVICE_NAME || "compose-web";
const apiBaseUrl = (process.env.API_BASE_URL || "http://api:3000").replace(/\/$/, "");
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

async function proxyHello(res) {
  try {
    const upstream = await fetch(`${apiBaseUrl}/api/hello`);
    const body = await upstream.json();
    json(res, upstream.ok ? 200 : 502, {
      ok: upstream.ok,
      via: serviceName,
      apiBaseUrl,
      upstream: body,
    });
  } catch (error) {
    json(res, 502, {
      ok: false,
      via: serviceName,
      apiBaseUrl,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const path = url.pathname;

  if (req.method === "GET" && path === "/health") {
    json(res, 200, {
      ok: true,
      service: serviceName,
      status: "healthy",
      apiBaseUrl,
      startedAt,
    });
    return;
  }

  if (req.method === "GET" && path === "/api/hello") {
    void proxyHello(res);
    return;
  }

  if (req.method === "GET" && (path === "/" || path === "/index.html")) {
    const body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Appaloft Compose Stack</title>
    <style>
      :root { color-scheme: light dark; font-family: ui-sans-serif, system-ui, sans-serif; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b1220; color: #e8eefc; }
      main { max-width: 40rem; padding: 2rem; border: 1px solid #243149; border-radius: 1rem; background: #121a2b; }
      code { color: #9fd0ff; } p { color: #b7c3db; line-height: 1.5; }
    </style>
  </head>
  <body>
    <main>
      <h1>Compose Stack</h1>
      <p>Public <strong>web</strong> proxies the private <strong>api</strong> sidecar over the Compose network.</p>
      <p>Health: <code>/health</code> · Proxied API: <code>/api/hello</code></p>
      <p>API base: <code>${apiBaseUrl}</code></p>
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
      message: `${serviceName}.listening`,
      port,
      apiBaseUrl,
    }),
  );
});
