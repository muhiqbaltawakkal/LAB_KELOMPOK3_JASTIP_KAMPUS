const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const jwt = require("jsonwebtoken");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");

const app = express();
app.use(express.json());

const CATALOG_URL = process.env.CATALOG_URL || "http://localhost:3001";
const SECRET = process.env.JWT_SECRET || "rahasia-dev-ganti-di-production";

// Request ID middleware
app.use((req, res, next) => {
  req.rid = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("x-request-id", req.rid);
  next();
});

function log(level, msg, extra = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), service: "order", level, msg, ...extra }));
}

// SQLite setup
const db = new DatabaseSync(path.join(__dirname, "order.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barang_id INTEGER NOT NULL,
    nama_barang TEXT,
    qty INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_barang ON orders(barang_id);
`);

// JWT auth
app.post("/v1/login", (req, res) => {
  const token = jwt.sign({ sub: req.body.user || "mhs", role: "mahasiswa" }, SECRET, { expiresIn: "1h" });
  res.json({ token });
});

function butuhAuth(req, res, next) {
  const header = req.headers.authorization || "";
  try {
    req.user = jwt.verify(header.replace("Bearer ", ""), SECRET);
    next();
  } catch {
    res.status(401).json({ error: "tidak sah, sertakan token" });
  }
}

// Timeout + retry
async function panggilTahan(url, opts = {}, { retries = 2, timeoutMs = 2000 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), ...opts });
      if (r.ok) return await r.json();
      if (r.status === 404) return { _status: 404 };
      if (r.status === 409) return { _status: 409 };
    } catch {}
    if (attempt < retries) await new Promise((s) => setTimeout(s, 300 * (attempt + 1)));
  }
  return null;
}

// Circuit breaker
let gagalBeruntun = 0;
let bukaSampai = 0;

async function lewatBreaker(url, opts, timeoutOpts) {
  if (Date.now() < bukaSampai) return null;
  const hasil = await panggilTahan(url, opts, timeoutOpts);
  if (hasil === null) {
    if (++gagalBeruntun >= 3) { bukaSampai = Date.now() + 30_000; gagalBeruntun = 0; }
  } else {
    gagalBeruntun = 0;
  }
  return hasil;
}

// Cache katalog fallback
let cacheKatalog = null;

app.get("/v1/catalog", async (req, res) => {
  const segar = await lewatBreaker(`${CATALOG_URL}/v1/items`);
  if (segar) {
    cacheKatalog = segar.items || segar;
    log("info", "katalog segar", { rid: req.rid });
    return res.json({ items: cacheKatalog, stale: false });
  }
  if (cacheKatalog) {
    log("warn", "katalog dari cache lama", { rid: req.rid });
    return res.json({ items: cacheKatalog, stale: true });
  }
  res.status(503).json({ error: "katalog belum tersedia, coba lagi" });
});

// POST /v1/orders — buat order dengan kurangi stok atomik di catalog
app.post("/v1/orders", butuhAuth, async (req, res) => {
  try {
    const { itemId, qty } = req.body;
    if (!Number.isInteger(itemId) || !Number.isInteger(Number(qty)) || qty < 1) {
      return res.status(400).json({ error: "itemId dan qty wajib angka, qty minimal 1" });
    }

    // Kurangi stok di catalog (atomik)
    const hasil = await lewatBreaker(
      `${CATALOG_URL}/v1/items/${itemId}/ambil`,
      { method: "POST", headers: { "Content-Type": "application/json", "x-request-id": req.rid } }
    );

    if (hasil === null) {
      log("warn", "catalog tidak tersedia saat order", { rid: req.rid, itemId });
      return res.status(503).json({ error: "catalog tidak tersedia, coba lagi nanti" });
    }
    if (hasil._status === 404) return res.status(404).json({ error: "barang tidak ditemukan" });
    if (hasil._status === 409) return res.status(409).json({ error: "stok habis" });

    // Ambil detail barang untuk harga
    const item = await panggilTahan(`${CATALOG_URL}/v1/items/${itemId}`);
    const harga = item ? item.harga : 0;
    const namaBarang = item ? item.nama : `barang #${itemId}`;
    const total = harga * qty;

    const result = db.prepare(
      "INSERT INTO orders (barang_id, nama_barang, qty, total) VALUES (?,?,?,?)"
    ).run(itemId, namaBarang, qty, total);

    log("info", "order dibuat", { rid: req.rid, orderId: result.lastInsertRowid, itemId, total });
    res.status(201).json({ orderId: result.lastInsertRowid, barangId: itemId, namaBarang, qty, total, status: "pending" });
  } catch (err) {
    log("error", "order gagal", { rid: req.rid, err: err.message });
    res.status(500).json({ error: "terjadi kesalahan internal, coba lagi" });
  }
});

// GET /health
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "order", instance: os.hostname(), pid: process.pid });
});

if (require.main === module) {
  app.listen(3002, () => log("info", "order berjalan di :3002"));
}
module.exports = app;