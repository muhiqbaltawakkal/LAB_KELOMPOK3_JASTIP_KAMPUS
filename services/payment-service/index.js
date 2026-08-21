const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const { createClient } = require("redis");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.rid = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("x-request-id", req.rid);
  next();
});

function log(level, msg, extra = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), service: "payment", level, msg, ...extra }));
}

const db = new DatabaseSync(path.join(__dirname, "payment.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS transaksi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    jumlah INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_transaksi_order ON transaksi(order_id);
  CREATE INDEX IF NOT EXISTS idx_transaksi_status ON transaksi(status);
`);

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

app.post("/v1/payments", async (req, res) => {
  const { orderId, jumlah } = req.body;
  if (!orderId || !jumlah || jumlah <= 0) {
    return res.status(400).json({ error: "orderId dan jumlah wajib diisi" });
  }

  const result = db.prepare(
    "INSERT INTO transaksi (order_id, jumlah, status) VALUES (?,?,?)"
  ).run(orderId, jumlah, "sukses");

  // Publish event order.paid
  if (redis) {
    try {
      await redis.publish("order.paid", JSON.stringify({
        transaksiId: result.lastInsertRowid, orderId, jumlah, ts: new Date().toISOString()
      }));
    } catch {}
  }

  log("info", "pembayaran berhasil", { rid: req.rid, transaksiId: result.lastInsertRowid, orderId, jumlah });
  res.status(201).json({ transaksiId: result.lastInsertRowid, orderId, jumlah, status: "sukses" });
});

app.get("/v1/payments/:orderId", (req, res) => {
  const transaksi = db.prepare("SELECT * FROM transaksi WHERE order_id = ?").all(req.params.orderId);
  res.json({ transaksi });
});

if (require.main === module) {
  app.listen(3003, () => log("info", "payment berjalan di :3003"));
}
module.exports = app;
