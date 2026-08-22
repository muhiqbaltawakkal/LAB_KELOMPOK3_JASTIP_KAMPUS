const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const app = express();
app.use(express.json());

const SECRET = process.env.JWT_SECRET;
const ORDER_URL = process.env.ORDER_URL || "http://localhost:3002";
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;
if (!SECRET || SECRET.length < 32 || !SERVICE_TOKEN || SERVICE_TOKEN.length < 32) throw new Error("JWT_SECRET dan SERVICE_TOKEN minimal 32 karakter wajib diisi");
const dbPath = process.env.DB_PATH || path.join(__dirname, "catalog.db");
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
fs.mkdirSync(uploadDir, { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS toko (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id TEXT NOT NULL,
    nama TEXT NOT NULL,
    alamat TEXT NOT NULL,
    kategori TEXT NOT NULL,
    aktif INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_toko_owner ON toko(owner_id, aktif);
  CREATE TABLE IF NOT EXISTS barang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id TEXT NOT NULL,
    toko_id INTEGER NOT NULL REFERENCES toko(id) ON DELETE RESTRICT,
    nama TEXT NOT NULL,
    kategori TEXT NOT NULL,
    harga INTEGER NOT NULL CHECK (harga >= 0),
    stok INTEGER NOT NULL CHECK (stok >= 0),
    satuan TEXT NOT NULL,
    foto_path TEXT,
    aktif INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_barang_owner ON barang(owner_id, aktif);
  CREATE INDEX IF NOT EXISTS idx_barang_toko ON barang(toko_id, aktif);
`);

app.use((req, res, next) => {
  req.rid = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("x-request-id", req.rid);
  next();
});

async function auth(req, res, next) {
  try {
    req.user = jwt.verify((req.headers.authorization || "").replace(/^Bearer\s+/i, ""), SECRET);
    const check = await fetch(`${ORDER_URL}/internal/users/${req.user.sub}/access`, { headers: { "x-service-token": SERVICE_TOKEN }, signal: AbortSignal.timeout(2000) });
    if (!check.ok || (await check.json()).user.role !== req.user.role) return res.status(401).json({ error: "akun tidak aktif atau token kedaluwarsa" });
    next();
  } catch { res.status(401).json({ error: "token tidak valid" }); }
}
function penjastip(req, res, next) {
  if (req.user?.role !== "penjastip") return res.status(403).json({ error: "aksi hanya untuk penjastip" });
  next();
}
function admin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "aksi hanya untuk admin" });
  next();
}
function pageArgs(req) { const page = Math.max(1, parseInt(req.query.page, 10) || 1); const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20)); return { page, limit, offset: (page - 1) * limit }; }
async function activeOwner(id) {
  try { const r = await fetch(`${ORDER_URL}/internal/users/${id}/penjastip`, { headers: { "x-service-token": SERVICE_TOKEN }, signal: AbortSignal.timeout(2000) }); return r.ok; } catch { return false; }
}
async function storeHasActiveSession(id) {
  try { const r = await fetch(`${ORDER_URL}/internal/stores/${id}/active-session`, { headers: { "x-service-token": SERVICE_TOKEN }, signal: AbortSignal.timeout(2000) }); return r.ok && (await r.json()).active; } catch { throw new Error("order-service tidak tersedia"); }
}
function adminAudit(req, action, resourceType, resourceId, before, after) {
  fetch(`${ORDER_URL}/internal/admin-audit`, { method: "POST", headers: { "Content-Type": "application/json", "x-service-token": SERVICE_TOKEN }, body: JSON.stringify({ actorId: req.user.sub, action, resourceType, resourceId, before, after }) }).catch(() => null);
}
function imageUrl(req, fotoPath) {
  if (!fotoPath) return null;
  return `${req.protocol}://${req.get("host")}/uploads/${encodeURIComponent(fotoPath)}`;
}
function productView(req, row) { return { ...row, foto_url: imageUrl(req, row.foto_path) }; }
function validPositiveInt(value, allowZero = false) {
  const number = Number(value);
  return Number.isInteger(number) && (allowZero ? number >= 0 : number > 0) ? number : null;
}
function removeUpload(filename) {
  if (!filename) return;
  const target = path.resolve(uploadDir, filename);
  if (path.dirname(target) === path.resolve(uploadDir)) fs.rmSync(target, { force: true });
}

const allowedMime = new Map([
  ["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"],
]);
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${allowedMime.get(file.mimetype) || ""}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => allowedMime.has(file.mimetype) ? cb(null, true) : cb(new Error("format foto harus JPG, PNG, atau WEBP")),
});
function uploadOne(req, res, next) {
  upload.single("foto")(req, res, (err) => {
    if (!err) return next();
    res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({ error: err.message });
  });
}

app.use("/uploads", express.static(uploadDir, { fallthrough: false, maxAge: "1d" }));
app.get("/health", (_req, res) => res.json({ status: "ok", service: "catalog", instance: os.hostname(), pid: process.pid }));

app.post("/v1/stores", auth, penjastip, (req, res) => {
  const { nama, alamat, kategori } = req.body;
  if (![nama, alamat, kategori].every((x) => typeof x === "string" && x.trim())) return res.status(400).json({ error: "nama, alamat, dan kategori wajib diisi" });
  const result = db.prepare("INSERT INTO toko (owner_id,nama,alamat,kategori) VALUES (?,?,?,?)")
    .run(req.user.sub, nama.trim(), alamat.trim(), kategori.trim());
  res.status(201).json(db.prepare("SELECT * FROM toko WHERE id = ?").get(Number(result.lastInsertRowid)));
});

app.get("/v1/stores/me", auth, penjastip, (req, res) => {
  res.json({ stores: db.prepare("SELECT * FROM toko WHERE owner_id = ? AND aktif = 1 ORDER BY id DESC").all(req.user.sub) });
});

app.get("/v1/stores/:id/ownership", auth, (req, res) => {
  const store = db.prepare("SELECT id, owner_id, aktif FROM toko WHERE id = ?").get(Number(req.params.id));
  if (!store) return res.status(404).json({ error: "toko tidak ditemukan" });
  if (store.owner_id !== req.user.sub) return res.status(403).json({ error: "toko bukan milik Anda" });
  res.json({ ok: true, storeId: store.id });
});

app.post("/v1/products", auth, penjastip, uploadOne, (req, res) => {
  const tokoId = validPositiveInt(req.body.tokoId);
  const harga = validPositiveInt(req.body.harga, true);
  const stok = validPositiveInt(req.body.stok, true);
  const { nama, kategori, satuan } = req.body;
  const store = tokoId && db.prepare("SELECT * FROM toko WHERE id = ? AND owner_id = ? AND aktif = 1").get(tokoId, req.user.sub);
  if (!store || !nama?.trim() || !kategori?.trim() || !satuan?.trim() || harga === null || stok === null || !req.file) {
    removeUpload(req.file?.filename);
    return res.status(400).json({ error: "toko milik Anda, nama, kategori, harga, stok, satuan, dan foto wajib valid" });
  }
  const result = db.prepare(`INSERT INTO barang (owner_id,toko_id,nama,kategori,harga,stok,satuan,foto_path) VALUES (?,?,?,?,?,?,?,?)`)
    .run(req.user.sub, tokoId, nama.trim(), kategori.trim(), harga, stok, satuan.trim(), req.file.filename);
  res.status(201).json(productView(req, db.prepare("SELECT * FROM barang WHERE id = ?").get(Number(result.lastInsertRowid))));
});

app.get("/v1/products/me", auth, penjastip, (req, res) => {
  const rows = db.prepare(`SELECT b.*, t.nama AS toko_nama FROM barang b JOIN toko t ON t.id=b.toko_id WHERE b.owner_id=? ORDER BY b.id DESC`).all(req.user.sub);
  res.json({ products: rows.map((x) => productView(req, x)) });
});

app.patch("/v1/products/:id", auth, penjastip, uploadOne, (req, res) => {
  const id = Number(req.params.id);
  const old = db.prepare("SELECT * FROM barang WHERE id=? AND owner_id=?").get(id, req.user.sub);
  if (!old) { removeUpload(req.file?.filename); return res.status(404).json({ error: "produk tidak ditemukan" }); }
  const tokoId = req.body.tokoId === undefined ? old.toko_id : validPositiveInt(req.body.tokoId);
  const store = tokoId && db.prepare("SELECT id FROM toko WHERE id=? AND owner_id=? AND aktif=1").get(tokoId, req.user.sub);
  const harga = req.body.harga === undefined ? old.harga : validPositiveInt(req.body.harga, true);
  const stok = req.body.stok === undefined ? old.stok : validPositiveInt(req.body.stok, true);
  if (!store || harga === null || stok === null) { removeUpload(req.file?.filename); return res.status(400).json({ error: "data produk tidak valid" }); }
  const nextPhoto = req.file?.filename || old.foto_path;
  db.prepare(`UPDATE barang SET toko_id=?,nama=?,kategori=?,harga=?,stok=?,satuan=?,foto_path=?,updated_at=datetime('now') WHERE id=?`)
    .run(tokoId, req.body.nama?.trim() || old.nama, req.body.kategori?.trim() || old.kategori, harga, stok, req.body.satuan?.trim() || old.satuan, nextPhoto, id);
  if (req.file && old.foto_path !== nextPhoto) removeUpload(old.foto_path);
  res.json(productView(req, db.prepare("SELECT * FROM barang WHERE id=?").get(id)));
});

app.delete("/v1/products/:id", auth, penjastip, (req, res) => {
  const result = db.prepare("UPDATE barang SET aktif=0,updated_at=datetime('now') WHERE id=? AND owner_id=? AND aktif=1").run(Number(req.params.id), req.user.sub);
  if (!result.changes) return res.status(404).json({ error: "produk tidak ditemukan" });
  res.status(204).end();
});

app.get("/v1/admin/stores", auth, admin, (req, res) => {
  const { page, limit, offset } = pageArgs(req); const q = `%${String(req.query.q || "").trim()}%`;
  const active = req.query.aktif === undefined ? null : req.query.aktif === "1" ? 1 : 0;
  const total = db.prepare("SELECT COUNT(*) AS n FROM toko WHERE (nama LIKE ? OR alamat LIKE ?) AND (? IS NULL OR aktif=?)").get(q, q, active, active).n;
  const stores = db.prepare("SELECT * FROM toko WHERE (nama LIKE ? OR alamat LIKE ?) AND (? IS NULL OR aktif=?) ORDER BY id DESC LIMIT ? OFFSET ?").all(q, q, active, active, limit, offset);
  res.json({ stores, pagination: { page, limit, total } });
});

app.post("/v1/admin/stores", auth, admin, async (req, res) => {
  const { ownerId, nama, alamat, kategori } = req.body;
  if (!Number.isInteger(Number(ownerId)) || !nama?.trim() || !alamat?.trim() || !kategori?.trim()) return res.status(400).json({ error: "ownerId, nama, alamat, dan kategori wajib valid" });
  if (!(await activeOwner(ownerId))) return res.status(400).json({ error: "owner harus akun penjastip aktif" });
  const result = db.prepare("INSERT INTO toko (owner_id,nama,alamat,kategori) VALUES (?,?,?,?)").run(String(ownerId), nama.trim(), alamat.trim(), kategori.trim());
  const created = db.prepare("SELECT * FROM toko WHERE id=?").get(Number(result.lastInsertRowid)); adminAudit(req, "create", "store", created.id, null, created);
  res.status(201).json({ store: created });
});

app.patch("/v1/admin/stores/:id", auth, admin, async (req, res) => {
  const old = db.prepare("SELECT * FROM toko WHERE id=?").get(Number(req.params.id));
  if (!old) return res.status(404).json({ error: "toko tidak ditemukan" });
  const owner = String(req.body.ownerId ?? old.owner_id);
  if (!(await activeOwner(owner))) return res.status(400).json({ error: "owner harus akun penjastip aktif" });
  const nextActive = req.body.aktif === undefined ? old.aktif : req.body.aktif ? 1 : 0;
  if (!nextActive && old.aktif && await storeHasActiveSession(old.id)) return res.status(409).json({ error: "toko masih memiliki sesi aktif" });
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("UPDATE toko SET owner_id=?,nama=?,alamat=?,kategori=?,aktif=?,updated_at=datetime('now') WHERE id=?")
      .run(owner, req.body.nama?.trim() || old.nama, req.body.alamat?.trim() || old.alamat, req.body.kategori?.trim() || old.kategori, nextActive, old.id);
    if (owner !== old.owner_id) db.prepare("UPDATE barang SET owner_id=?,updated_at=datetime('now') WHERE toko_id=?").run(owner, old.id);
    db.exec("COMMIT");
  } catch (err) { db.exec("ROLLBACK"); throw err; }
  const changed = db.prepare("SELECT * FROM toko WHERE id=?").get(old.id); adminAudit(req, "update", "store", old.id, old, changed); res.json({ store: changed });
});

app.delete("/v1/admin/stores/:id", auth, admin, async (req, res) => {
  const old = db.prepare("SELECT * FROM toko WHERE id=? AND aktif=1").get(Number(req.params.id));
  if (!old) return res.status(404).json({ error: "toko aktif tidak ditemukan" });
  if (await storeHasActiveSession(old.id)) return res.status(409).json({ error: "toko masih memiliki sesi aktif" });
  db.exec("BEGIN IMMEDIATE");
  try { db.prepare("UPDATE toko SET aktif=0,updated_at=datetime('now') WHERE id=?").run(old.id); db.prepare("UPDATE barang SET aktif=0,updated_at=datetime('now') WHERE toko_id=?").run(old.id); db.exec("COMMIT"); }
  catch (err) { db.exec("ROLLBACK"); throw err; }
  adminAudit(req, "deactivate", "store", old.id, old, { ...old, aktif: 0 });
  res.status(204).end();
});

app.get("/v1/admin/products", auth, admin, (req, res) => {
  const { page, limit, offset } = pageArgs(req); const q = `%${String(req.query.q || "").trim()}%`;
  const total = db.prepare("SELECT COUNT(*) AS n FROM barang WHERE nama LIKE ?").get(q).n;
  const rows = db.prepare("SELECT b.*,t.nama AS toko_nama FROM barang b JOIN toko t ON t.id=b.toko_id WHERE b.nama LIKE ? ORDER BY b.id DESC LIMIT ? OFFSET ?").all(q, limit, offset);
  res.json({ products: rows.map((x) => productView(req, x)), pagination: { page, limit, total } });
});

app.post("/v1/admin/products", auth, admin, uploadOne, async (req, res) => {
  const tokoId = validPositiveInt(req.body.tokoId); const harga = validPositiveInt(req.body.harga, true); const stok = validPositiveInt(req.body.stok, true);
  const store = tokoId && db.prepare("SELECT * FROM toko WHERE id=? AND aktif=1").get(tokoId);
  if (!store || !(await activeOwner(store.owner_id)) || !req.body.nama?.trim() || !req.body.kategori?.trim() || !req.body.satuan?.trim() || harga === null || stok === null) { removeUpload(req.file?.filename); return res.status(400).json({ error: "toko aktif, data produk, dan owner penjastip wajib valid" }); }
  const result = db.prepare("INSERT INTO barang (owner_id,toko_id,nama,kategori,harga,stok,satuan,foto_path) VALUES (?,?,?,?,?,?,?,?)")
    .run(store.owner_id, tokoId, req.body.nama.trim(), req.body.kategori.trim(), harga, stok, req.body.satuan.trim(), req.file?.filename || null);
  const created = productView(req, db.prepare("SELECT * FROM barang WHERE id=?").get(Number(result.lastInsertRowid))); adminAudit(req, "create", "product", created.id, null, created); res.status(201).json({ product: created });
});

app.patch("/v1/admin/products/:id", auth, admin, uploadOne, (req, res) => {
  const old = db.prepare("SELECT * FROM barang WHERE id=?").get(Number(req.params.id));
  if (!old) { removeUpload(req.file?.filename); return res.status(404).json({ error: "produk tidak ditemukan" }); }
  const tokoId = req.body.tokoId === undefined ? old.toko_id : validPositiveInt(req.body.tokoId); const store = db.prepare("SELECT * FROM toko WHERE id=? AND aktif=1").get(tokoId);
  const harga = req.body.harga === undefined ? old.harga : validPositiveInt(req.body.harga, true); const stok = req.body.stok === undefined ? old.stok : validPositiveInt(req.body.stok, true);
  if (!store || harga === null || stok === null) { removeUpload(req.file?.filename); return res.status(400).json({ error: "data produk tidak valid" }); }
  const photo = req.file?.filename || old.foto_path;
  db.prepare("UPDATE barang SET owner_id=?,toko_id=?,nama=?,kategori=?,harga=?,stok=?,satuan=?,foto_path=?,aktif=?,updated_at=datetime('now') WHERE id=?")
    .run(store.owner_id, tokoId, req.body.nama?.trim() || old.nama, req.body.kategori?.trim() || old.kategori, harga, stok, req.body.satuan?.trim() || old.satuan, photo, req.body.aktif === undefined ? old.aktif : req.body.aktif ? 1 : 0, old.id);
  if (req.file && old.foto_path !== photo) removeUpload(old.foto_path);
  const changed = productView(req, db.prepare("SELECT * FROM barang WHERE id=?").get(old.id)); adminAudit(req, "update", "product", old.id, old, changed); res.json({ product: changed });
});

app.delete("/v1/admin/products/:id", auth, admin, (req, res) => {
  const result = db.prepare("UPDATE barang SET aktif=0,updated_at=datetime('now') WHERE id=? AND aktif=1").run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "produk aktif tidak ditemukan" });
  adminAudit(req, "deactivate", "product", req.params.id, { aktif: 1 }, { aktif: 0 });
  res.status(204).end();
});

app.get("/v1/items", (req, res) => {
  const ids = String(req.query.ids || "").split(",").map(Number).filter(Number.isInteger);
  const query = ids.length ? `SELECT b.*,t.nama AS toko_nama FROM barang b JOIN toko t ON t.id=b.toko_id WHERE b.aktif=1 AND b.id IN (${ids.map(() => "?").join(",")})` : "SELECT b.*,t.nama AS toko_nama FROM barang b JOIN toko t ON t.id=b.toko_id WHERE b.aktif=1";
  const rows = db.prepare(query).all(...ids);
  res.json({ items: rows.map((x) => productView(req, x)) });
});
app.get("/v1/items/:id", (req, res) => {
  const row = db.prepare("SELECT b.*,t.nama AS toko_nama FROM barang b JOIN toko t ON t.id=b.toko_id WHERE b.id=? AND b.aktif=1").get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: "barang tidak ditemukan" });
  res.json(productView(req, row));
});
app.get("/v1/toko", (_req, res) => res.json({ toko: db.prepare("SELECT * FROM toko WHERE aktif=1 ORDER BY id DESC").all() }));

app.post("/v1/items/:id/ambil", (req, res) => {
  const id = Number(req.params.id); const qty = validPositiveInt(req.body?.qty ?? 1);
  if (!qty) return res.status(400).json({ error: "qty wajib bilangan bulat minimal 1" });
  const result = db.prepare("UPDATE barang SET stok=stok-? WHERE id=? AND aktif=1 AND stok>=?").run(qty, id, qty);
  if (!result.changes) return res.status(409).json({ error: "stok tidak cukup atau produk tidak aktif" });
  const item = db.prepare("SELECT * FROM barang WHERE id=?").get(id);
  res.json({ ok: true, barangId: id, qty, stokSisa: item.stok });
});

app.use((err, _req, res, _next) => res.status(500).json({ error: "kesalahan internal", detail: err.message }));
if (require.main === module) app.listen(3001, () => console.log("catalog berjalan di :3001"));
module.exports = app;
