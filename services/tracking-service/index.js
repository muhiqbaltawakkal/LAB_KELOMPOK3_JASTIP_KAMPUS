const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const { createClient } = require("redis");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
const SECRET = process.env.JWT_SECRET;
const ORDER_URL = process.env.ORDER_URL || "http://localhost:3002";
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;
if (!SECRET || SECRET.length < 32 || !SERVICE_TOKEN || SERVICE_TOKEN.length < 32) throw new Error("JWT_SECRET dan SERVICE_TOKEN minimal 32 karakter wajib diisi");
async function auth(req, res, next) { try { req.user = jwt.verify((req.headers.authorization || "").replace(/^Bearer\s+/i, ""), SECRET); const check = await fetch(`${ORDER_URL}/internal/users/${req.user.sub}/access`, { headers: { "x-service-token": SERVICE_TOKEN }, signal: AbortSignal.timeout(2000) }); if (!check.ok || (await check.json()).user.role !== req.user.role) return res.status(401).json({ error: "akun tidak aktif atau token kedaluwarsa" }); next(); } catch { res.status(401).json({ error: "token tidak valid" }); } }
function allowedRoles(...roles) { return (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ error: "role tidak diizinkan" }); }
function adminAudit(req, id, after) { if (req.user?.role === "admin") fetch(`${ORDER_URL}/internal/admin-audit`, { method: "POST", headers: { "Content-Type": "application/json", "x-service-token": SERVICE_TOKEN }, body: JSON.stringify({ actorId: req.user.sub, action: "create", resourceType: "tracking", resourceId: id, before: null, after }) }).catch(() => null); }

app.use((req, res, next) => {
  req.rid = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("x-request-id", req.rid);
  next();
});

function log(level, msg, extra = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), service: "tracking", level, msg, ...extra }));
}

const db = new DatabaseSync(process.env.DB_PATH || path.join(__dirname, "tracking.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS tracking_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    keterangan TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_tracking_order ON tracking_events(order_id);
`);

// Redis subscriber
let redisSub = null;
(async () => {
  try {
    redisSub = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
    redisSub.on("error", () => {});
    await redisSub.connect();

    // Subscribe ke event titipan.dibuat dan order.paid
    await redisSub.subscribe("titipan.dibuat", (msg) => {
      try {
        const data = JSON.parse(msg);
        db.prepare("INSERT INTO tracking_events (order_id, status, keterangan) VALUES (?,?,?)").run(
          data.orderId || data.titipanId || 0, "dibuat", JSON.stringify(data)
        );
        log("info", "event titipan.dibuat dicatat", data);
      } catch {}
    });

    await redisSub.subscribe("order.paid", (msg) => {
      try {
        const data = JSON.parse(msg);
        db.prepare("INSERT INTO tracking_events (order_id, status, keterangan) VALUES (?,?,?)").run(
          data.orderId || 0, "dibayar", JSON.stringify(data)
        );
        log("info", "event order.paid dicatat", data);
      } catch {}
    });

    log("info", "redis subscriber aktif");
  } catch {
    log("warn", "redis tidak tersedia, tracking manual saja");
  }
})();

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "tracking", instance: os.hostname(), pid: process.pid });
});

app.get("/v1/tracking/:orderId", auth, (req, res) => {
  const events = db.prepare(
    "SELECT * FROM tracking_events WHERE order_id = ? ORDER BY created_at ASC"
  ).all(req.params.orderId);
  res.json({ orderId: req.params.orderId, events });
});

// Manual tracking entry
app.post("/v1/tracking", auth, allowedRoles("penjastip", "admin"), (req, res) => {
  const { orderId, status, keterangan } = req.body;
  if (!orderId || !status) return res.status(400).json({ error: "orderId dan status wajib diisi" });
  const flow = ["dititip", "dibelanjakan", "diantar", "diterima"];
  const nextIndex = flow.indexOf(String(status).toLowerCase());
  if (nextIndex < 0) return res.status(400).json({ error: "status tidak valid", allowed: flow });
  const latest = db.prepare("SELECT status FROM tracking_events WHERE order_id = ? ORDER BY id DESC LIMIT 1").get(orderId);
  const expectedIndex = latest ? flow.indexOf(latest.status) + 1 : 0;
  if (nextIndex !== expectedIndex) {
    return res.status(409).json({ error: "transisi status tidak berurutan", expected: flow[expectedIndex] || null });
  }
  const result = db.prepare(
    "INSERT INTO tracking_events (order_id, status, keterangan) VALUES (?,?,?)"
  ).run(orderId, flow[nextIndex], keterangan || null);
  log("info", "tracking manual dicatat", { rid: req.rid, orderId, status });
  adminAudit(req, result.lastInsertRowid, { orderId, status: flow[nextIndex] });
  res.status(201).json({ id: result.lastInsertRowid, orderId, status: flow[nextIndex] });
});

app.get("/v1/admin/tracking", auth, allowedRoles("admin"), (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1); const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const total = db.prepare("SELECT COUNT(*) AS n FROM tracking_events").get().n;
  const tracking = db.prepare("SELECT * FROM tracking_events ORDER BY id DESC LIMIT ? OFFSET ?").all(limit, (page - 1) * limit);
  res.json({ tracking, pagination: { page, limit, total } });
});

if (require.main === module) {
  app.listen(3004, () => log("info", "tracking berjalan di :3004"));
}
module.exports = app;
