const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const { createClient } = require("redis");
const path = require("node:path");
const crypto = require("node:crypto");
const os = require("node:os");

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

// Seed data inline — tidak perlu file eksternal
const SEED_TOKO = [
  { id:1,  nama:"Chatime Losari",               alamat:"Pantai Losari, Jl. Penghibur No.1, Makassar",              kategori:"Minuman Kekinian" },
  { id:2,  nama:"Mie Titi Makassar",             alamat:"Jl. Irian No.18, Makassar",                               kategori:"Makanan Khas" },
  { id:3,  nama:"Gramedia Karebosi",             alamat:"Mall Karebosi Link Lt.2, Jl. Jend. Ahmad Yani, Makassar", kategori:"Buku & Alat Tulis" },
  { id:4,  nama:"Erafone Trans Studio Mall",     alamat:"Trans Studio Mall Lt.1, Jl. Metro Tanjung Bunga, Makassar",kategori:"Elektronik" },
  { id:5,  nama:"Indomaret Tamalanrea",          alamat:"Jl. Perintis Kemerdekaan KM.10, Makassar",               kategori:"Minimarket" },
  { id:6,  nama:"Pisang Ijo Bu Budi",            alamat:"Jl. Penghibur No.48A, Pantai Losari, Makassar",          kategori:"Kuliner Khas" },
  { id:7,  nama:"Coto Makassar Nusantara",       alamat:"Jl. Nusantara No.32, Makassar",                          kategori:"Makanan Khas" },
  { id:8,  nama:"Konro Bakar Karebosi",          alamat:"Jl. Gunung Lompobattang No.41, Makassar",                kategori:"Makanan Khas" },
  { id:9,  nama:"Kopi Torabika Cafe Panakkukang",alamat:"Mall Panakkukang Lt.1, Jl. Boulevard, Makassar",         kategori:"Kafe & Kopi" },
  { id:10, nama:"J.CO Donuts & Coffee TSM",      alamat:"Trans Studio Mall Lt.GF, Jl. Metro Tanjung Bunga, Makassar",kategori:"Kafe & Kopi" },
  { id:11, nama:"Alfamart Perintis",             alamat:"Jl. Perintis Kemerdekaan KM.12, Makassar",               kategori:"Minimarket" },
  { id:12, nama:"Samsung Experience Store MaRI", alamat:"Mall Ratu Indah Lt.1, Jl. Dr. Sam Ratulangi, Makassar", kategori:"Elektronik" },
  { id:13, nama:"Burger King Karebosi",          alamat:"Mall Karebosi Link Lt.GF, Jl. Jend. Ahmad Yani, Makassar",kategori:"Fast Food" },
  { id:14, nama:"KFC Panakkukang",               alamat:"Mall Panakkukang Lt.GF, Jl. Boulevard, Makassar",        kategori:"Fast Food" },
  { id:15, nama:"Toko Buku Fajar Bookshop",      alamat:"Jl. Urip Sumoharjo No.20, Makassar",                    kategori:"Buku & Alat Tulis" },
  { id:16, nama:"Miniso Panakkukang",            alamat:"Mall Panakkukang Lt.2, Jl. Boulevard, Makassar",         kategori:"Lifestyle & Aksesoris" },
  { id:17, nama:"Es Pisang Ijo Anugerah",        alamat:"Jl. Abdullah Dg. Sirua No.7, Makassar",                  kategori:"Kuliner Khas" },
  { id:18, nama:"Warung Pallubasa Serigala",     alamat:"Jl. Serigala No.7, Makassar",                            kategori:"Makanan Khas" },
  { id:19, nama:"Kopi Kanneng",                  alamat:"Jl. Hertasning Baru No.15, Makassar",                    kategori:"Kafe & Kopi" },
  { id:20, nama:"Apotik Kimia Farma Veteran",    alamat:"Jl. Veteran Selatan No.10, Makassar",                    kategori:"Apotek & Kesehatan" },
];
const SEED_BARANG = [
  { id:1,  toko_id:1,  nama:"Brown Sugar Boba Milk Tea (L)",     harga:42000, stok:100, satuan:"pcs" },
  { id:2,  toko_id:1,  nama:"Matcha Latte (M)",                  harga:35000, stok:100, satuan:"pcs" },
  { id:3,  toko_id:1,  nama:"Classic Milk Tea (L)",              harga:32000, stok:100, satuan:"pcs" },
  { id:4,  toko_id:2,  nama:"Mie Titi Original (Reguler)",       harga:35000, stok:50,  satuan:"pcs" },
  { id:5,  toko_id:2,  nama:"Mie Titi Udang",                    harga:45000, stok:50,  satuan:"pcs" },
  { id:6,  toko_id:2,  nama:"Es Teh Manis",                      harga:8000,  stok:100, satuan:"pcs" },
  { id:7,  toko_id:3,  nama:"Novel Terlaris Gramedia",           harga:89000, stok:30,  satuan:"pcs" },
  { id:8,  toko_id:3,  nama:"Buku Teks Kuliah (Ekonomi)",        harga:120000,stok:20,  satuan:"pcs" },
  { id:9,  toko_id:3,  nama:"Pulpen Pilot G2 (1 Set 6 pcs)",     harga:45000, stok:50,  satuan:"set" },
  { id:10, toko_id:4,  nama:"Samsung Galaxy A55 5G",             harga:4499000,stok:10, satuan:"pcs" },
  { id:11, toko_id:4,  nama:"Charger USB-C 65W Original",        harga:350000,stok:25,  satuan:"pcs" },
  { id:12, toko_id:5,  nama:"Indomie Goreng (1 dus 40 pcs)",     harga:95000, stok:40,  satuan:"box" },
  { id:13, toko_id:5,  nama:"Aqua 600ml (1 dus 24 botol)",       harga:55000, stok:60,  satuan:"box" },
  { id:14, toko_id:6,  nama:"Pisang Ijo Original (1 porsi)",     harga:20000, stok:80,  satuan:"pcs" },
  { id:15, toko_id:7,  nama:"Coto Makassar (1 porsi)",           harga:30000, stok:60,  satuan:"pcs" },
  { id:16, toko_id:8,  nama:"Konro Bakar (1 porsi)",             harga:55000, stok:40,  satuan:"pcs" },
  { id:17, toko_id:9,  nama:"Kopi Torabika Susu (M)",            harga:25000, stok:80,  satuan:"pcs" },
  { id:18, toko_id:10, nama:"J.CO Donuts (1 lusin)",             harga:125000,stok:30,  satuan:"lusin" },
  { id:19, toko_id:10, nama:"Cappuccino Cincau (M)",             harga:32000, stok:60,  satuan:"pcs" },
  { id:20, toko_id:11, nama:"Minyak Goreng Tropical 2L",         harga:38000, stok:50,  satuan:"pcs" },
  { id:21, toko_id:12, nama:"Samsung Galaxy Buds FE",            harga:799000,stok:15,  satuan:"pcs" },
  { id:22, toko_id:12, nama:"Samsung 25W Fast Charger",          harga:250000,stok:20,  satuan:"pcs" },
  { id:23, toko_id:13, nama:"Whopper Burger + Fries (set)",      harga:65000, stok:50,  satuan:"set" },
  { id:24, toko_id:14, nama:"KFC Kombo 2 (2 pcs ayam + nasi)",   harga:55000, stok:60,  satuan:"set" },
  { id:25, toko_id:15, nama:"Buku Akuntansi Dasar",              harga:95000, stok:25,  satuan:"pcs" },
  { id:26, toko_id:16, nama:"Tumbler Miniso 500ml",              harga:79000, stok:40,  satuan:"pcs" },
  { id:27, toko_id:16, nama:"Earphone Miniso Wired",             harga:59000, stok:35,  satuan:"pcs" },
  { id:28, toko_id:17, nama:"Es Pisang Ijo Anugerah (1 porsi)",  harga:18000, stok:100, satuan:"pcs" },
  { id:29, toko_id:18, nama:"Pallubasa Serigala (1 porsi)",      harga:35000, stok:50,  satuan:"pcs" },
  { id:30, toko_id:19, nama:"Kopi Susu Kanneng (M)",             harga:22000, stok:80,  satuan:"pcs" },
  { id:31, toko_id:19, nama:"Es Kopi Americano (M)",             harga:22000, stok:100, satuan:"pcs" },
  { id:32, toko_id:20, nama:"Paracetamol 500mg (10 Tablet)",     harga:8000,  stok:200, satuan:"strip" },
  { id:33, toko_id:20, nama:"Vitamin C 1000mg Redoxon (10 Tab)", harga:35000, stok:150, satuan:"strip" },
  { id:34, toko_id:20, nama:"Masker Medis KF94 (10 pcs)",        harga:25000, stok:120, satuan:"box" },
];

const jumlahToko = db.prepare("SELECT COUNT(*) AS n FROM toko").get();
if (jumlahToko.n === 0) {
  const insToko  = db.prepare("INSERT OR IGNORE INTO toko (id, nama, alamat, kategori) VALUES (?,?,?,?)");
  const insBarang = db.prepare("INSERT OR IGNORE INTO barang (id, toko_id, nama, harga, stok, satuan) VALUES (?,?,?,?,?,?)");
  for (const t of SEED_TOKO)   insToko.run(t.id, t.nama, t.alamat, t.kategori);
  for (const b of SEED_BARANG) insBarang.run(b.id, b.toko_id, b.nama, b.harga, b.stok, b.satuan);
  log("info", "seed data berhasil dimuat", { toko: SEED_TOKO.length, barang: SEED_BARANG.length });
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