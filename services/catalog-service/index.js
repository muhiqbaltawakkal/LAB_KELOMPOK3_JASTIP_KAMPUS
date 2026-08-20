const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const { createClient } = require("redis");
const path = require("path");
const app = express();
app.use(express.json());

// ── Redis publisher ────────────────────────────────────────
const pub = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
pub.connect().catch(() => console.log("Redis tidak tersedia, event dinonaktifkan"));

// ── SQLite database per service ────────────────────────────
const db = new DatabaseSync(process.env.DB_PATH || "catalog.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS satuan (
    id   INTEGER PRIMARY KEY,
    kode TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    keterangan TEXT
  );
  CREATE TABLE IF NOT EXISTS toko (
    id       INTEGER PRIMARY KEY,
    nama     TEXT NOT NULL,
    pemilik  TEXT NOT NULL,
    lokasi   TEXT NOT NULL,
    kategori TEXT NOT NULL,
    aktif    INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS barang (
    id          INTEGER PRIMARY KEY,
    toko_id     INTEGER NOT NULL REFERENCES toko(id),
    nama        TEXT    NOT NULL,
    kategori    TEXT    NOT NULL,
    satuan      TEXT    NOT NULL,
    harga_acuan INTEGER NOT NULL,
    stok        INTEGER NOT NULL DEFAULT 0
  );
`);

// Seed dari dataset jika tabel masih kosong
const jumlah = db.prepare("SELECT COUNT(*) AS n FROM barang").get().n;
if (jumlah === 0) {
  const seed = require(path.join(__dirname, "../../dataset/catalog-seed.json"));

  const insSatuan = db.prepare(
    "INSERT OR IGNORE INTO satuan (id, kode, nama, keterangan) VALUES (?,?,?,?)"
  );
  for (const s of seed.satuan) insSatuan.run(s.id, s.kode, s.nama, s.keterangan);

  const insToko = db.prepare(
    "INSERT OR IGNORE INTO toko (id, nama, pemilik, lokasi, kategori, aktif) VALUES (?,?,?,?,?,?)"
  );
  for (const t of seed.toko) insToko.run(t.id, t.nama, t.pemilik, t.lokasi, t.kategori, t.aktif ? 1 : 0);

  const insBarang = db.prepare(
    "INSERT OR IGNORE INTO barang (id, toko_id, nama, kategori, satuan, harga_acuan, stok) VALUES (?,?,?,?,?,?,?)"
  );
  for (const b of seed.barang)
    insBarang.run(b.id, b.toko_id, b.nama, b.kategori, b.satuan, b.harga_acuan, b.stok);

  console.log("Seed data 20 toko Makassar berhasil dimuat ke catalog.db");
}

// ── ENDPOINTS ─────────────────────────────────────────────

app.get("/items", (_req, res) => {
  res.json(db.prepare("SELECT * FROM barang ORDER BY id").all());
});

app.get("/items/:id", (req, res) => {
  const item = db.prepare("SELECT * FROM barang WHERE id = ?").get(Number(req.params.id));
  if (!item) return res.status(404).json({ error: "item tidak ditemukan" });
  res.json(item);
});

// Kurangi 1 stok secara atomik — inti konsistensi sumber daya rebutan
app.post("/items/:id/ambil", async (req, res) => {
  const id = Number(req.params.id);
  const hasil = db
    .prepare("UPDATE barang SET stok = stok - 1 WHERE id = ? AND stok > 0")
    .run(id);

  if (hasil.changes === 0) {
    return res.status(409).json({ error: "stok habis" });
  }

  const item = db.prepare("SELECT * FROM barang WHERE id = ?").get(id);

  // Publikasi event asinkron ke Redis
  try {
    await pub.publish("stok.berkurang", JSON.stringify({ barang_id: id, sisa: item.stok }));
  } catch {
    // Redis tidak wajib ada — lanjut saja
  }

  res.json({ ok: true, barang_id: id, sisa: item.stok });
});

app.get("/toko", (_req, res) => {
  res.json(db.prepare("SELECT * FROM toko ORDER BY id").all());
});

app.get("/toko/:id", (req, res) => {
  const t = db.prepare("SELECT * FROM toko WHERE id = ?").get(Number(req.params.id));
  if (!t) return res.status(404).json({ error: "toko tidak ditemukan" });
  const barang = db.prepare("SELECT * FROM barang WHERE toko_id = ?").all(Number(req.params.id));
  res.json({ ...t, barang });
});

app.get("/satuan", (_req, res) => {
  res.json(db.prepare("SELECT * FROM satuan ORDER BY id").all());
});

app.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "catalog", db: "sqlite" })
);

app.listen(3001, () => console.log("catalog berjalan di :3001"));

const app = express();
app.use(express.json());

// ── Koneksi PostgreSQL ─────────────────────────────────────
// Gunakan env var saat production, fallback ke default lokal
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/catalog_db",
});

// Fallback in-memory jika DB belum tersedia (mode development)
const path = require("path");
const seed = require(path.join(__dirname, "../../dataset/catalog-seed.json"));

async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

// ── ENDPOINTS ─────────────────────────────────────────────

// GET /items — semua barang
app.get("/items", async (_req, res) => {
  try {
    const rows = await query("SELECT * FROM barang ORDER BY id");
    res.json(rows);
  } catch {
    // Fallback ke seed JSON jika DB belum ada
    res.json(seed.barang);
  }
});

// GET /items/:id — satu barang
app.get("/items/:id", async (req, res) => {
  try {
    const rows = await query("SELECT * FROM barang WHERE id = $1", [Number(req.params.id)]);
    if (!rows.length) return res.status(404).json({ error: "item tidak ditemukan" });
    res.json(rows[0]);
  } catch {
    const item = seed.barang.find((x) => x.id === Number(req.params.id));
    if (!item) return res.status(404).json({ error: "item tidak ditemukan" });
    res.json(item);
  }
});

// GET /toko — semua toko
app.get("/toko", async (_req, res) => {
  try {
    const rows = await query("SELECT * FROM toko ORDER BY id");
    res.json(rows);
  } catch {
    res.json(seed.toko);
  }
});

// GET /toko/:id — satu toko beserta barangnya
app.get("/toko/:id", async (req, res) => {
  try {
    const tokoRows = await query("SELECT * FROM toko WHERE id = $1", [Number(req.params.id)]);
    if (!tokoRows.length) return res.status(404).json({ error: "toko tidak ditemukan" });
    const barangRows = await query("SELECT * FROM barang WHERE toko_id = $1", [Number(req.params.id)]);
    res.json({ ...tokoRows[0], barang: barangRows });
  } catch {
    const t = seed.toko.find((x) => x.id === Number(req.params.id));
    if (!t) return res.status(404).json({ error: "toko tidak ditemukan" });
    res.json(t);
  }
});

// GET /satuan — semua satuan
app.get("/satuan", async (_req, res) => {
  try {
    const rows = await query("SELECT * FROM satuan ORDER BY id");
    res.json(rows);
  } catch {
    res.json(seed.satuan);
  }
});

// GET /health — cek koneksi DB sekaligus
app.get("/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ status: "ok", service: "catalog", db: "connected" });
  } catch {
    res.json({ status: "ok", service: "catalog", db: "disconnected (fallback mode)" });
  }
});

app.listen(3001, () => console.log("catalog berjalan di :3001"));