import http from "node:http";

const routes = [
  [/^\/v1\/admin\/(stores|products)/, 3001],
  [/^\/v1\/admin\/(users|sessions|orders|audit)/, 3002],
  [/^\/v1\/admin\/payments/, 3003],
  [/^\/v1\/admin\/tracking/, 3004],
  [/^\/v1\/(items|toko|stores|products)/, 3001],
  [/^\/uploads\//, 3001],
  [/^\/v1\/(register|login|me|sessions|titipan|orders|catalog)/, 3002],
  [/^\/v1\/payments/, 3003],
  [/^\/v1\/tracking/, 3004],
  [/^\/health$/, 3001],
];

const server = http.createServer((req, res) => {
  const match = routes.find(([pattern]) => pattern.test(req.url || ""));
  if (!match) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "route tidak ditemukan" }));
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Request-Id,Idempotency-Key",
    });
    return res.end();
  }
  const upstream = http.request({
    hostname: "127.0.0.1", port: match[1], path: req.url, method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${match[1]}` },
  }, (upstreamResponse) => {
    res.writeHead(upstreamResponse.statusCode || 502, {
      ...upstreamResponse.headers, "access-control-allow-origin": "*",
    });
    upstreamResponse.pipe(res);
  });
  upstream.on("error", (error) => {
    if (!res.headersSent) res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "service tidak tersedia", detail: error.message }));
  });
  req.pipe(upstream);
});

server.listen(8080, () => console.log("local gateway berjalan di http://localhost:8080"));
