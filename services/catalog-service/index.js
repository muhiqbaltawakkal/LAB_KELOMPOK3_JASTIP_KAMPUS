const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const { createClient } = require("redis");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const crypto = require("node:crypto");

const app = express();
app.use(express.json());

// Request ID middleware
app.use((req, res, next) => {
  req.rid = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("x-request-id", req.rid);
  next();
});

// JSON logger
function log(level, msg, extra = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), service: "catalog", level, msg, ...extra }));
}

// SQLite setup
const db = new DatabaseSync(path.join(__dirname, "catalog.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS toko (
    id INTEGER PRIMARY KEY,
    nama TEXT NOT NULL,
    alamat TEXT,
    kategori TEXT,
    aktif INTEGER DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS barang (
    id INTEGER PRIMARY KEY,
    toko_id INTEGER NOT NULL,
    nama TEXT NOT NULL,
    harga INTEGER NOT NULL,
    stok INTEGER NOT NULL DEFAULT 0,
    satuan TEXT DEFAULT 'pcs',
    FOREIGN KEY (toko_id) REFERENCES toko(id)
  );
  CREATE INDEX IF NOT EXISTS idx_barang_toko ON barang(toko_id);
  CREATE INDEX IF NOT EXISTS idx_barang_stok ON barang(stok);
`);

// Seed data dari JSON jika tabel kosong
const jumlahToko = db.prepare("SELECT COUNT(*) AS n FROM toko").get();
if (jumlahToko.n === 0) {
  const seedPath = path.join(__dirname, "../../dataset/catalog-seed.json");
  if (fs.existsSync(seedPath)) {
    const seed = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
    const insToko = db.prepare("INSERT OR IGNORE INTO toko (id, nama, alamat, kategori) VALUES (?,?,?,?)");
    const insBarang = db.prepare("INSERT OR IGNORE INTO barang (id, toko_id, nama, harga, stok, satuan) VALUES (?,?,?,?,?,?)");
    for (const t of seed.toko || []) insToko.run(t.id, t.nama, t.alamat, t.kategori);
    for (const b of seed.barang || []) insBarang.run(b.id, b.toko_id, b.nama, b.harga, b.stok, b.satuan || "pcs");
    log("info", "seed data berhasil dimuat", { toko: (seed.toko || []).length, barang: (seed.barang || []).length });
  }
}

// Redis setup (opsional — service tetap jalan tanpa Redis)
let redis = null;
(async () => {
  try {
    redis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
    redis.on("error", () => { redis = null; });
    await redis.connect();
    log("info", "redis terhubung");
  } catch {
    redis = null;
    log("warn", "redis tidak tersedia, lanjut tanpa cache");
  }
})();

const CACHE_TTL = 60; // detik

async function cacheGet(key) {
  if (!redis) return null;
  try { return await redis.get(key); } catch { return null; }
}

async function cacheSet(key, value) {
  if (!redis) return;
  const ttl = CACHE_TTL + Math.floor(Math.random() * 15); // jitter anti-stampede
  try { await redis.set(key, JSON.stringify(value), { EX: ttl }); } catch {}
}

async function cacheDel(key) {
  if (!redis) return;
  try { await redis.del(key); } catch {}
}

async function pubRedis(channel, data) {
  if (!redis) return;
  try { await redis.publish(channel, JSON.stringify(data)); } catch {}
}

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "catalog", instance: os.hostname(), pid: process.pid });
});

// GET /v1/items — daftar semua barang
app.get("/v1/items", (req, res) => {
  const cached_key = "items:all";
  cacheGet(cached_key).then(async (cached) => {
    if (cached) {
      log("info", "cache hit /v1/items", { rid: req.rid });
      return res.json({ items: JSON.parse(cached), from: "cache" });
    }
    const items = db.prepare("SELECT * FROM barang WHERE stok > 0").all();
    await cacheSet(cached_key, items);
    log("info", "GET /v1/items", { rid: req.rid, count: items.length });
    res.json({ items, from: "db" });
  });
});

// GET /v1/items/:id — detail satu barang (cache-aside)
app.get("/v1/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  const cacheKey = `item:${id}`;

  const cached = await cacheGet(cacheKey);
  if (cached) {
    log("info", "cache hit /v1/items/:id", { rid: req.rid, id });
    return res.json({ ...JSON.parse(cached), from: "cache" });
  }

  const item = db.prepare("SELECT * FROM barang WHERE id = ?").get(id);
  if (!item) return res.status(404).json({ error: "barang tidak ditemukan" });

  await cacheSet(cacheKey, item);
  log("info", "GET /v1/items/:id", { rid: req.rid, id });
  res.json({ ...item, from: "db" });
});

// GET /v1/toko — daftar toko
app.get("/v1/toko", (req, res) => {
  const toko = db.prepare("SELECT * FROM toko WHERE aktif = 1").all();
  log("info", "GET /v1/toko", { rid: req.rid, count: toko.length });
  res.json({ toko });
});

// POST /v1/items/:id/ambil — kurangi stok atomik (inti Data & Persistence Engineer)
app.post("/v1/items/:id/ambil", async (req, res) => {
  const id = Number(req.params.id);

  // UPDATE atomik: hanya berhasil jika stok > 0
  const result = db.prepare(
    "UPDATE barang SET stok = stok - 1 WHERE id = ? AND stok > 0"
  ).run(id);

  if (result.changes === 0) {
    // Cek apakah barang ada atau stok habis
    const item = db.prepare("SELECT id, stok FROM barang WHERE id = ?").get(id);
    if (!item) return res.status(404).json({ error: "barang tidak ditemukan" });
    return res.status(409).json({ error: "stok habis", stok: item.stok });
  }

  const item = db.prepare("SELECT * FROM barang WHERE id = ?").get(id);

  // Invalidasi cache setelah stok berubah
  await cacheDel(`item:${id}`);
  await cacheDel("items:all");

  // Publish event ke Redis
  await pubRedis("stok.berkurang", { barangId: id, nama: item.nama, stokSisa: item.stok, ts: new Date().toISOString() });

  log("info", "stok dikurangi", { rid: req.rid, barangId: id, stokSisa: item.stok });
  res.json({ ok: true, barangId: id, stokSisa: item.stok });
});

if (require.main === module) {
  app.listen(3001, () => log("info", "catalog berjalan di :3001"));
}
module.exports = app;