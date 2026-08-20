const express = require("express");
const { Pool } = require("pg");
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