const http = require("node:http");

const port = Number.parseInt(process.env.PORT || "3000", 10);

const server = http.createServer((request, response) => {
  const payload = {
    app: "Appaloft Oneclick",
    message: "Hello from a Dockerfile-backed Appaloft Blueprint.",
    path: request.url,
    time: new Date().toISOString(),
  };

  response.writeHead(200, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Appaloft oneclick example listening on ${port}`);
});
