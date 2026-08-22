const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { createClient } = require("redis");
const { pool, ready } = require("./db");

const SECRET = process.env.JWT_SECRET;
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;
const ORDER_URL = process.env.ORDER_URL || "http://localhost:3002";
if (!SECRET || SECRET.length < 32 || !SERVICE_TOKEN || SERVICE_TOKEN.length < 32 || !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, JWT_SECRET, dan SERVICE_TOKEN wajib diisi");
}

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const allowedMime = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"]]);
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${allowedMime.get(file.mimetype) || ""}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => allowedMime.has(file.mimetype) ? cb(null, true) : cb(new Error("INVALID_IMAGE")),
});

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.rid = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("x-request-id", req.rid);
  next();
});
app.use("/uploads", express.static(uploadDir, { fallthrough: false, maxAge: "1d" }));

let redis;
async function cacheStart() {
  try {
    redis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
    redis.on("error", () => {});
    await redis.connect();
  } catch { redis = null; }
}
cacheStart();
const cacheGet = async (key) => { try { const value = await redis?.get(key); return value ? JSON.parse(value) : null; } catch { return null; } };
const cacheSet = async (key, value) => { try { await redis?.set(key, JSON.stringify(value), { EX: 60 }); } catch {} };
const invalidate = async () => { try { const keys = await redis?.keys("catalog:*"); if (keys?.length) await redis.del(keys); } catch {} };

function rolesFor(user) { return user.accountType === "admin" ? ["admin"] : ["penitip", "penjastip"]; }
async function auth(req, res, next) {
  try {
    req.user = jwt.verify((req.headers.authorization || "").replace(/^Bearer\s+/i, ""), SECRET);
    const response = await fetch(`${ORDER_URL}/internal/users/${req.user.sub}/access`, { headers: { "x-service-token": SERVICE_TOKEN }, signal: AbortSignal.timeout(2000) });
    if (!response.ok) throw new Error();
    const current = (await response.json()).user;
    if (!current.roles.some((role) => (req.user.roles || []).includes(role))) throw new Error();
    next();
  } catch { res.status(401).json({ error: "akun tidak aktif atau token tidak valid" }); }
}
const allow = (...roles) => (req, res, next) => roles.some((role) => (req.user?.roles || []).includes(role)) ? next() : res.status(403).json({ error: "role tidak diizinkan" });
const internal = (req, res, next) => req.headers["x-service-token"] === SERVICE_TOKEN ? next() : res.status(401).json({ error: "akses internal ditolak" });
const photo = (row) => ({ ...row, foto_url: row.foto_path ? `/uploads/${row.foto_path}` : null });
const paging = (req) => { const page = Math.max(1, parseInt(req.query.page, 10) || 1); const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20)); return { page, limit, offset: (page - 1) * limit }; };
const cleanFile = (filename) => { if (filename) fs.rm(path.join(uploadDir, filename), { force: true }, () => {}); };

app.get("/health", async (_req, res) => {
  try { await ready; await pool.query("SELECT 1"); res.json({ status: "ok", service: "catalog", instance: os.hostname() }); }
  catch { res.status(503).json({ status: "error", service: "catalog" }); }
});

app.get("/v1/items", async (req, res) => {
  await ready;
  const ids = String(req.query.ids || "").split(",").map(Number).filter(Number.isInteger);
  const key = `catalog:items:${ids.join(",") || "all"}`;
  const cached = await cacheGet(key);
  if (cached) return res.json({ items: cached, stale: false, cached: true });
  const query = ids.length
    ? await pool.query(`SELECT p.*,s.nama AS toko_nama FROM products p JOIN stores s ON s.id=p.store_id WHERE p.aktif AND s.aktif AND p.id=ANY($1::bigint[]) ORDER BY p.id`, [ids])
    : await pool.query(`SELECT p.*,s.nama AS toko_nama FROM products p JOIN stores s ON s.id=p.store_id WHERE p.aktif AND s.aktif ORDER BY p.id`);
  const items = query.rows.map(photo); await cacheSet(key, items); res.json({ items, stale: false });
});
app.get("/v1/items/:id", async (req, res) => {
  await ready; const { rows } = await pool.query(`SELECT p.*,s.nama AS toko_nama FROM products p JOIN stores s ON s.id=p.store_id WHERE p.id=$1 AND p.aktif AND s.aktif`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "produk tidak ditemukan" }); res.json(photo(rows[0]));
});
app.get("/v1/toko", async (_req, res) => { await ready; const { rows } = await pool.query("SELECT * FROM stores WHERE aktif ORDER BY id"); res.json({ stores: rows }); });

app.post("/v1/stores", auth, allow("penjastip"), async (req, res) => {
  const { nama, alamat, kategori } = req.body; if (!nama || !alamat || !kategori) return res.status(400).json({ error: "nama, alamat, dan kategori wajib" });
  const { rows } = await pool.query("INSERT INTO stores(owner_id,nama,alamat,kategori) VALUES($1,$2,$3,$4) RETURNING *", [req.user.sub, nama.trim(), alamat.trim(), kategori.trim()]);
  await invalidate(); res.status(201).json(rows[0]);
});
app.get("/v1/stores/me", auth, allow("penjastip"), async (req, res) => { const { rows } = await pool.query("SELECT * FROM stores WHERE owner_id=$1 ORDER BY id DESC", [req.user.sub]); res.json({ stores: rows }); });

async function createProduct(req, res, ownerId) {
  const storeId = Number(req.body.tokoId); const harga = Number(req.body.harga); const stok = Number(req.body.stok);
  const store = await pool.query("SELECT * FROM stores WHERE id=$1 AND owner_id=$2 AND aktif", [storeId, ownerId]);
  if (!store.rows[0]) { cleanFile(req.file?.filename); return res.status(403).json({ error: "toko aktif bukan milik owner" }); }
  if (!req.body.nama || !req.body.kategori || !req.body.satuan || !Number.isInteger(harga) || harga < 0 || !Number.isInteger(stok) || stok < 0) { cleanFile(req.file?.filename); return res.status(400).json({ error: "data produk tidak valid" }); }
  const { rows } = await pool.query(`INSERT INTO products(store_id,owner_id,nama,kategori,harga,stok,satuan,foto_path) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [storeId, ownerId, req.body.nama.trim(), req.body.kategori.trim(), harga, stok, req.body.satuan.trim(), req.file?.filename || null]);
  await invalidate(); res.status(201).json(photo({ ...rows[0], toko_nama: store.rows[0].nama }));
}
app.post("/v1/products", auth, allow("penjastip"), upload.single("foto"), (req, res) => createProduct(req, res, Number(req.user.sub)));
app.get("/v1/products/me", auth, allow("penjastip"), async (req, res) => { const { rows } = await pool.query(`SELECT p.*,s.nama toko_nama FROM products p JOIN stores s ON s.id=p.store_id WHERE p.owner_id=$1 ORDER BY p.id DESC`, [req.user.sub]); res.json({ products: rows.map(photo) }); });
app.patch("/v1/products/:id", auth, allow("penjastip"), upload.single("foto"), async (req, res) => {
  const old = (await pool.query("SELECT * FROM products WHERE id=$1 AND owner_id=$2", [req.params.id, req.user.sub])).rows[0];
  if (!old) { cleanFile(req.file?.filename); return res.status(404).json({ error: "produk tidak ditemukan" }); }
  const values = { nama: req.body.nama ?? old.nama, kategori: req.body.kategori ?? old.kategori, harga: req.body.harga == null ? old.harga : Number(req.body.harga), stok: req.body.stok == null ? old.stok : Number(req.body.stok), satuan: req.body.satuan ?? old.satuan, foto: req.file?.filename || old.foto_path };
  const { rows } = await pool.query("UPDATE products SET nama=$1,kategori=$2,harga=$3,stok=$4,satuan=$5,foto_path=$6,updated_at=now() WHERE id=$7 RETURNING *", [values.nama, values.kategori, values.harga, values.stok, values.satuan, values.foto, old.id]);
  if (req.file && old.foto_path) cleanFile(old.foto_path); await invalidate(); res.json(photo(rows[0]));
});
app.delete("/v1/products/:id", auth, allow("penjastip"), async (req, res) => { const result = await pool.query("UPDATE products SET aktif=FALSE,updated_at=now() WHERE id=$1 AND owner_id=$2 AND aktif", [req.params.id, req.user.sub]); if (!result.rowCount) return res.status(404).json({ error: "produk tidak ditemukan" }); await invalidate(); res.status(204).end(); });

app.get("/internal/ownership", internal, async (req, res) => {
  const ownerId = Number(req.query.ownerId), storeId = Number(req.query.storeId), ids = String(req.query.productIds || "").split(",").map(Number).filter(Number.isInteger);
  const store = (await pool.query("SELECT * FROM stores WHERE id=$1 AND owner_id=$2 AND aktif", [storeId, ownerId])).rows[0];
  const products = ids.length ? (await pool.query(`SELECT p.*,s.nama toko_nama FROM products p JOIN stores s ON s.id=p.store_id WHERE p.id=ANY($1::bigint[]) AND p.owner_id=$2 AND p.store_id=$3 AND p.aktif`, [ids, ownerId, storeId])).rows : [];
  if (!store || products.length !== ids.length) return res.status(403).json({ error: "ownership katalog tidak valid" }); res.json({ store, products: products.map(photo) });
});
app.post("/internal/products/:id/reserve-stock", internal, async (req, res) => { const qty = Number(req.body.qty); const { rows } = await pool.query("UPDATE products SET stok=stok-$1,updated_at=now() WHERE id=$2 AND aktif AND stok >= $1 RETURNING *", [qty, req.params.id]); if (!rows[0]) return res.status(409).json({ error: "stok tidak cukup" }); await invalidate(); res.json(rows[0]); });

app.get("/v1/admin/stores", auth, allow("admin"), async (req, res) => { const { page, limit, offset } = paging(req); const q = `%${req.query.q || ""}%`; const data = await pool.query("SELECT * FROM stores WHERE nama ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3", [q, limit, offset]); const total = await pool.query("SELECT count(*)::int n FROM stores WHERE nama ILIKE $1", [q]); res.json({ stores: data.rows, pagination: { page, limit, total: total.rows[0].n } }); });
app.post("/v1/admin/stores", auth, allow("admin"), async (req, res) => { const { rows } = await pool.query("INSERT INTO stores(owner_id,nama,alamat,kategori) VALUES($1,$2,$3,$4) RETURNING *", [req.body.ownerId, req.body.nama, req.body.alamat, req.body.kategori]); await invalidate(); res.status(201).json(rows[0]); });
app.patch("/v1/admin/stores/:id", auth, allow("admin"), async (req, res) => { const old = (await pool.query("SELECT * FROM stores WHERE id=$1", [req.params.id])).rows[0]; if (!old) return res.status(404).json({ error: "toko tidak ditemukan" }); const { rows } = await pool.query("UPDATE stores SET owner_id=$1,nama=$2,alamat=$3,kategori=$4,aktif=$5,updated_at=now() WHERE id=$6 RETURNING *", [req.body.ownerId ?? old.owner_id, req.body.nama ?? old.nama, req.body.alamat ?? old.alamat, req.body.kategori ?? old.kategori, req.body.aktif ?? old.aktif, old.id]); await invalidate(); res.json(rows[0]); });
app.delete("/v1/admin/stores/:id", auth, allow("admin"), async (req, res) => { const client=await pool.connect(); try { await client.query("BEGIN"); await client.query("UPDATE stores SET aktif=FALSE,updated_at=now() WHERE id=$1", [req.params.id]); await client.query("UPDATE products SET aktif=FALSE,updated_at=now() WHERE store_id=$1", [req.params.id]); await client.query("COMMIT"); await invalidate(); res.status(204).end(); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } });
app.get("/v1/admin/products", auth, allow("admin"), async (req, res) => { const { page, limit, offset } = paging(req); const q = `%${req.query.q || ""}%`; const data = await pool.query(`SELECT p.*,s.nama toko_nama FROM products p JOIN stores s ON s.id=p.store_id WHERE p.nama ILIKE $1 ORDER BY p.id DESC LIMIT $2 OFFSET $3`, [q, limit, offset]); const total = await pool.query("SELECT count(*)::int n FROM products WHERE nama ILIKE $1", [q]); res.json({ products: data.rows.map(photo), pagination: { page, limit, total: total.rows[0].n } }); });
app.post("/v1/admin/products", auth, allow("admin"), upload.single("foto"), (req, res) => createProduct(req, res, Number(req.body.ownerId)));
app.delete("/v1/admin/products/:id", auth, allow("admin"), async (req, res) => { await pool.query("UPDATE products SET aktif=FALSE,updated_at=now() WHERE id=$1", [req.params.id]); await invalidate(); res.status(204).end(); });

app.use((error, _req, res, _next) => {
  if (error.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "foto maksimal 5 MB" });
  if (error.message === "INVALID_IMAGE") return res.status(400).json({ error: "foto harus JPG, PNG, atau WEBP" });
  console.error(JSON.stringify({ service: "catalog", level: "error", message: error.message })); res.status(500).json({ error: "kesalahan internal" });
});

if (require.main === module) ready.then(() => app.listen(3001, () => console.log(JSON.stringify({ service: "catalog", message: "listening", port: 3001 }))));
module.exports = { app, ready };
