import http from "node:http";

const port = Number(process.env.PORT || process.env.APPALOFT_PORT || 3000);
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

function htmlHome() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Appaloft Example Hello</title>
    <style>
      :root { color-scheme: light dark; font-family: ui-sans-serif, system-ui, sans-serif; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b1220; color: #e8eefc; }
      main { max-width: 40rem; padding: 2rem; border: 1px solid #243149; border-radius: 1rem; background: #121a2b; }
      h1 { margin: 0 0 0.5rem; font-size: 1.5rem; }
      p { margin: 0.5rem 0; line-height: 1.5; color: #b7c3db; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #9fd0ff; }
      a { color: #8ab4ff; }
    </style>
  </head>
  <body>
    <main>
      <h1>Appaloft Example Hello</h1>
      <p>This app is a reference source for <strong>git-public</strong> and GitHub App deploy paths.</p>
      <p>Health: <code>/health</code> · JSON: <code>/api/hello</code></p>
      <p>Started at <code>${startedAt}</code></p>
      <p>
        Docs:
        <a href="https://docs.appaloft.com/">docs.appaloft.com</a>
      </p>
    </main>
  </body>
</html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const path = url.pathname;

  if (req.method === "GET" && (path === "/health" || path === "/api/health")) {
    json(res, 200, {
      ok: true,
      service: "appaloft-example-hello",
      status: "healthy",
      startedAt,
      now: new Date().toISOString(),
    });
    return;
  }

  if (req.method === "GET" && path === "/api/hello") {
    json(res, 200, {
      message: "Hello from Appaloft example",
      service: "appaloft-example-hello",
      startedAt,
    });
    return;
  }

  if (req.method === "GET" && (path === "/" || path === "/index.html")) {
    const body = htmlHome();
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
      message: "appaloft-example-hello.listening",
      port,
      health: "/health",
    }),
  );
});
