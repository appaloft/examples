import http from "node:http";

const port = Number(process.env.PORT || 3000);
const serviceName = process.env.SERVICE_NAME || "compose-api";
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

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const path = url.pathname;

  if (req.method === "GET" && path === "/health") {
    json(res, 200, {
      ok: true,
      service: serviceName,
      status: "healthy",
      startedAt,
    });
    return;
  }

  if (req.method === "GET" && path === "/api/hello") {
    json(res, 200, {
      message: "Hello from compose-stack api sidecar",
      service: serviceName,
      startedAt,
    });
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
    }),
  );
});
