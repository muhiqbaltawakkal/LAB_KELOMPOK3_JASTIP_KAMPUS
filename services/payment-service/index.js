const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const { createClient } = require("redis");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
const ORDER_URL = process.env.ORDER_URL || "http://localhost:3002";
const SECRET = process.env.JWT_SECRET;
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;
if (!SECRET || SECRET.length < 32 || !SERVICE_TOKEN || SERVICE_TOKEN.length < 32) throw new Error("JWT_SECRET dan SERVICE_TOKEN minimal 32 karakter wajib diisi");
async function auth(req, res, next) { try { req.user = jwt.verify((req.headers.authorization || "").replace(/^Bearer\s+/i, ""), SECRET); const check = await fetch(`${ORDER_URL}/internal/users/${req.user.sub}/access`, { headers: { "x-service-token": SERVICE_TOKEN }, signal: AbortSignal.timeout(2000) }); if (!check.ok || (await check.json()).user.role !== req.user.role) return res.status(401).json({ error: "akun tidak aktif atau token kedaluwarsa" }); next(); } catch { res.status(401).json({ error: "token tidak valid" }); } }
const role = (name) => (req, res, next) => req.user?.role === name ? next() : res.status(403).json({ error: `aksi hanya untuk ${name}` });
function adminAudit(req, action, id, before, after) { fetch(`${ORDER_URL}/internal/admin-audit`, { method: "POST", headers: { "Content-Type": "application/json", "x-service-token": SERVICE_TOKEN }, body: JSON.stringify({ actorId: req.user.sub, action, resourceType: "payment", resourceId: id, before, after }) }).catch(() => null); }

app.use((req, res, next) => {
  req.rid = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("x-request-id", req.rid);
  next();
});

function log(level, msg, extra = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), service: "payment", level, msg, ...extra }));
}

const db = new DatabaseSync(process.env.DB_PATH || path.join(__dirname, "payment.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS transaksi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    jumlah INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    idempotency_key TEXT UNIQUE,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_transaksi_order ON transaksi(order_id);
  CREATE INDEX IF NOT EXISTS idx_transaksi_status ON transaksi(status);
`);
try { db.exec("ALTER TABLE transaksi ADD COLUMN idempotency_key TEXT"); } catch {}
db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_transaksi_idempotency ON transaksi(idempotency_key)");

// Redis setup
let redis = null;
(async () => {
  try {
    redis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
    redis.on("error", () => { redis = null; });
    await redis.connect();
    log("info", "redis terhubung");
  } catch {
    redis = null;
    log("warn", "redis tidak tersedia");
  }
})();

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "payment", instance: os.hostname(), pid: process.pid });
});

app.post("/v1/payments", auth, role("penitip"), async (req, res) => {
  const { titipanId, jumlah } = req.body;
  const key = req.headers["idempotency-key"];
  if (!titipanId || !jumlah || jumlah <= 0 || !key) {
    return res.status(400).json({ error: "titipanId, jumlah, dan Idempotency-Key wajib diisi" });
  }
  const same = db.prepare("SELECT * FROM transaksi WHERE idempotency_key = ?").get(key);
  if (same) return res.json(same);

  let titipan;
  try {
    const check = await fetch(`${ORDER_URL}/internal/titipan/${titipanId}`, { headers: { "x-service-token": SERVICE_TOKEN }, signal: AbortSignal.timeout(2000) });
    if (check.status === 404) return res.status(404).json({ error: "titipan tidak ditemukan" });
    if (!check.ok) throw new Error("order-service gagal");
    titipan = await check.json();
  } catch {
    return res.status(503).json({ error: "order-service tidak tersedia" });
  }
  if (titipan.status !== "menunggu_pembayaran") return res.status(409).json({ error: "titipan sudah dibayar atau tidak dapat dibayar" });
  if (String(titipan.pemesan) !== String(req.user.sub)) return res.status(403).json({ error: "titipan bukan milik Anda" });
  if (Number(jumlah) !== Number(titipan.total)) {
    return res.status(422).json({ error: "jumlah pembayaran tidak sesuai total titipan", expected: titipan.total });
  }

  const result = db.prepare(
    "INSERT INTO transaksi (order_id, jumlah, status, idempotency_key) VALUES (?,?,?,?)"
  ).run(titipanId, jumlah, "tertahan", key);

  try {
    await fetch(`${ORDER_URL}/internal/titipan/${titipanId}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json", "x-service-token": SERVICE_TOKEN }, body: JSON.stringify({ status: "dibayar" })
    });
  } catch {}

  // Publish event order.paid
  if (redis) {
    try {
      await redis.publish("order.paid", JSON.stringify({
        transaksiId: result.lastInsertRowid, orderId: titipanId, jumlah, status: "tertahan", ts: new Date().toISOString()
      }));
    } catch {}
  }

  log("info", "pembayaran ditahan", { rid: req.rid, transaksiId: result.lastInsertRowid, titipanId, jumlah });
  res.status(201).json({ transaksiId: result.lastInsertRowid, titipanId, jumlah, status: "tertahan" });
});

app.post("/v1/payments/:id/release", auth, role("admin"), async (req, res) => {
  const trx = db.prepare("SELECT * FROM transaksi WHERE id = ?").get(Number(req.params.id));
  if (!trx) return res.status(404).json({ error: "transaksi tidak ditemukan" });
  if (trx.status === "dilepas") return res.json(trx);
  db.prepare("UPDATE transaksi SET status = 'dilepas' WHERE id = ? AND status = 'tertahan'").run(trx.id);
  try {
    await fetch(`${ORDER_URL}/internal/titipan/${trx.order_id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json", "x-service-token": SERVICE_TOKEN }, body: JSON.stringify({ status: "selesai" })
    });
  } catch {}
  res.json({ ...trx, status: "dilepas" });
});

app.get("/v1/payments/:orderId", auth, (req, res) => {
  const transaksi = db.prepare("SELECT * FROM transaksi WHERE order_id = ?").all(req.params.orderId);
  res.json({ transaksi });
});

app.get("/v1/admin/payments", auth, role("admin"), (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1); const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const status = req.query.status || null; const total = db.prepare("SELECT COUNT(*) AS n FROM transaksi WHERE (? IS NULL OR status=?)").get(status, status).n;
  const payments = db.prepare("SELECT * FROM transaksi WHERE (? IS NULL OR status=?) ORDER BY id DESC LIMIT ? OFFSET ?").all(status, status, limit, (page - 1) * limit);
  res.json({ payments, pagination: { page, limit, total } });
});

app.patch("/v1/admin/payments/:id/status", auth, role("admin"), async (req, res) => {
  const trx = db.prepare("SELECT * FROM transaksi WHERE id=?").get(Number(req.params.id));
  if (!trx) return res.status(404).json({ error: "transaksi tidak ditemukan" });
  const allowed = { pending: ["dibatalkan"], tertahan: ["dilepas", "dikembalikan", "dibatalkan"], dilepas: [], dikembalikan: [], dibatalkan: [] };
  if (!(allowed[trx.status] || []).includes(req.body.status)) return res.status(409).json({ error: "transisi pembayaran tidak diizinkan", allowed: allowed[trx.status] || [] });
  db.prepare("UPDATE transaksi SET status=? WHERE id=?").run(req.body.status, trx.id);
  const orderStatus = req.body.status === "dilepas" ? "selesai" : ["dikembalikan", "dibatalkan"].includes(req.body.status) ? "dibatalkan" : null;
  if (orderStatus) await fetch(`${ORDER_URL}/internal/titipan/${trx.order_id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json", "x-service-token": SERVICE_TOKEN }, body: JSON.stringify({ status: orderStatus }) }).catch(() => null);
  adminAudit(req, "status", trx.id, { status: trx.status }, { status: req.body.status });
  res.json({ payment: { ...trx, status: req.body.status } });
});

if (require.main === module) {
  app.listen(3003, () => log("info", "payment berjalan di :3003"));
}
module.exports = app;
