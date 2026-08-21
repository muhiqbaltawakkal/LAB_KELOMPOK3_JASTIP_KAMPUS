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
  console.log(JSON.stringify({ ts: new Date().toISOString(), service: "tracking", level, msg, ...extra }));
}

const db = new DatabaseSync(path.join(__dirname, "tracking.db"));
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

app.get("/v1/tracking/:orderId", (req, res) => {
  const events = db.prepare(
    "SELECT * FROM tracking_events WHERE order_id = ? ORDER BY created_at ASC"
  ).all(req.params.orderId);
  res.json({ orderId: req.params.orderId, events });
});

// Manual tracking entry
app.post("/v1/tracking", (req, res) => {
  const { orderId, status, keterangan } = req.body;
  if (!orderId || !status) return res.status(400).json({ error: "orderId dan status wajib diisi" });
  const result = db.prepare(
    "INSERT INTO tracking_events (order_id, status, keterangan) VALUES (?,?,?)"
  ).run(orderId, status, keterangan || null);
  log("info", "tracking manual dicatat", { rid: req.rid, orderId, status });
  res.status(201).json({ id: result.lastInsertRowid, orderId, status });
});

if (require.main === module) {
  app.listen(3004, () => log("info", "tracking berjalan di :3004"));
}
module.exports = app;
