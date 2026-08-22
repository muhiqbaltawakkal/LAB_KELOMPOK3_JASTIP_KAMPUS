const express = require("express");
const { DatabaseSync } = require("node:sqlite");
const jwt = require("jsonwebtoken");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { promisify } = require("node:util");
const scrypt = promisify(crypto.scrypt);

const app = express();
app.use(express.json());

const CATALOG_URL = process.env.CATALOG_URL || "http://localhost:3001";
const SECRET = process.env.JWT_SECRET;
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;
if (!SECRET || SECRET.length < 32 || !SERVICE_TOKEN || SERVICE_TOKEN.length < 32) throw new Error("JWT_SECRET dan SERVICE_TOKEN minimal 32 karakter wajib diisi");

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
const db = new DatabaseSync(process.env.DB_PATH || path.join(__dirname, "order.db"));
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
  CREATE TABLE IF NOT EXISTS sesi_jastip (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pembuka TEXT NOT NULL,
    toko_id INTEGER NOT NULL,
    toko_nama TEXT NOT NULL,
    batas_waktu TEXT NOT NULL,
    kapasitas_maksimal INTEGER NOT NULL CHECK (kapasitas_maksimal > 0),
    kapasitas_terpakai INTEGER NOT NULL DEFAULT 0 CHECK (kapasitas_terpakai >= 0),
    status TEXT NOT NULL DEFAULT 'buka' CHECK (status IN ('buka','ditutup')),
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS titipan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sesi_id INTEGER NOT NULL,
    pemesan TEXT NOT NULL,
    barang_id INTEGER NOT NULL,
    qty INTEGER NOT NULL CHECK (qty > 0),
    nama_barang TEXT,
    harga_satuan INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    catatan TEXT,
    status TEXT NOT NULL DEFAULT 'menunggu_pembayaran',
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (sesi_id) REFERENCES sesi_jastip(id)
  );
  CREATE INDEX IF NOT EXISTS idx_titipan_sesi ON titipan(sesi_id);
  CREATE TABLE IF NOT EXISTS sesi_produk (
    sesi_id INTEGER NOT NULL REFERENCES sesi_jastip(id) ON DELETE CASCADE,
    barang_id INTEGER NOT NULL,
    PRIMARY KEY (sesi_id, barang_id)
  );
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    no_hp TEXT,
    kampus TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('penitip','penjastip')),
    created_at TEXT DEFAULT (datetime('now'))
  );
`);
// SQLite cannot alter CHECK constraints. Rebuild legacy users table once while
// preserving its rows, then add the account status used by authorization.
const usersSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get()?.sql || "";
if (!usersSql.includes("'admin'")) {
  db.exec(`
    BEGIN IMMEDIATE;
    ALTER TABLE users RENAME TO users_legacy;
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      no_hp TEXT,
      kampus TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('penitip','penjastip','admin')),
      aktif INTEGER NOT NULL DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
    INSERT INTO users (id,nama,email,no_hp,kampus,password_hash,role,created_at)
      SELECT id,nama,email,no_hp,kampus,password_hash,role,created_at FROM users_legacy;
    DROP TABLE users_legacy;
    COMMIT;
  `);
} else {
  try { db.exec("ALTER TABLE users ADD COLUMN aktif INTEGER NOT NULL DEFAULT 1"); } catch {}
}
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    before_json TEXT,
    after_json TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit(created_at DESC);
`);
for (const sql of [
  "ALTER TABLE titipan ADD COLUMN nama_barang TEXT",
  "ALTER TABLE titipan ADD COLUMN harga_satuan INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE titipan ADD COLUMN total INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE titipan ADD COLUMN catatan TEXT",
]) { try { db.exec(sql); } catch {} }

async function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

async function passwordMatches(password, stored) {
  const [salt, expectedHex] = String(stored).split(":");
  if (!salt || !expectedHex) return false;
  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

app.post("/v1/register", async (req, res) => {
  const { nama, email, password, noHp = null, kampus = null } = req.body;
  const role = req.body.role === "penjastip" ? "penjastip" : "penitip";
  if (!nama || !email || !password || password.length < 6) {
    return res.status(400).json({ error: "nama, email, dan password minimal 6 karakter wajib diisi" });
  }
  try {
    const passwordHash = await hashPassword(password);
    const result = db.prepare("INSERT INTO users (nama,email,no_hp,kampus,password_hash,role) VALUES (?,?,?,?,?,?)")
      .run(nama.trim(), email.trim().toLowerCase(), noHp, kampus, passwordHash, role);
    return res.status(201).json({ id: Number(result.lastInsertRowid), nama, email: email.trim().toLowerCase(), role });
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) return res.status(409).json({ error: "email sudah terdaftar" });
    throw err;
  }
});

app.post("/v1/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !user.aktif || !(await passwordMatches(req.body.password || "", user.password_hash))) {
    return res.status(401).json({ error: "email atau password salah" });
  }
  const token = jwt.sign({ sub: String(user.id), email: user.email, role: user.role, nama: user.nama }, SECRET, { expiresIn: "8h" });
  res.json({ token, user: { id: user.id, nama: user.nama, email: user.email, role: user.role, kampus: user.kampus } });
});

function butuhAuth(req, res, next) {
  const header = req.headers.authorization || "";
  try {
    req.user = jwt.verify(header.replace("Bearer ", ""), SECRET);
    const current = db.prepare("SELECT id,role,aktif FROM users WHERE id=?").get(Number(req.user.sub));
    if (!current || !current.aktif || current.role !== req.user.role) return res.status(401).json({ error: "akun tidak aktif atau token kedaluwarsa" });
    next();
  } catch {
    res.status(401).json({ error: "tidak sah, sertakan token" });
  }
}

function khususRole(role) {
  return (req, res, next) => req.user?.role === role
    ? next()
    : res.status(403).json({ error: `aksi ini hanya untuk ${role}` });
}

const adminOnly = khususRole("admin");
function internalOnly(req, res, next) {
  return req.headers["x-service-token"] === SERVICE_TOKEN ? next() : res.status(401).json({ error: "akses internal ditolak" });
}
function audit(actor, action, type, id, before, after) {
  db.prepare("INSERT INTO admin_audit (actor_id,action,resource_type,resource_id,before_json,after_json) VALUES (?,?,?,?,?,?)")
    .run(Number(actor), action, type, id == null ? null : String(id), before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null);
}
function pageArgs(req) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  return { page, limit, offset: (page - 1) * limit };
}
app.get("/v1/me", butuhAuth, (req, res) => {
  const user = db.prepare("SELECT id,nama,email,no_hp,kampus,role,aktif FROM users WHERE id=?").get(Number(req.user.sub));
  if (!user) return res.status(401).json({ error: "akun tidak ditemukan" });
  res.json({ user });
});

async function sessionsWithProducts(req, rows) {
  const ids = [...new Set(rows.flatMap((row) => db.prepare("SELECT barang_id FROM sesi_produk WHERE sesi_id=?").all(row.id).map((x) => x.barang_id)))];
  let products = [];
  if (ids.length) {
    const result = await panggilTahan(`${CATALOG_URL}/v1/items?ids=${ids.join(",")}`);
    products = result?.items || [];
  }
  return rows.map((row) => ({ ...row, products: products.filter((p) => db.prepare("SELECT 1 FROM sesi_produk WHERE sesi_id=? AND barang_id=?").get(row.id, p.id)) }));
}

app.get("/v1/sessions", async (req, res) => {
  const rows = db.prepare(`
    SELECT *, kapasitas_maksimal - kapasitas_terpakai AS kapasitas_tersisa
    FROM sesi_jastip
    WHERE status = 'buka' AND datetime(batas_waktu) > datetime('now')
    ORDER BY batas_waktu ASC
  `).all();
  res.json({ sessions: await sessionsWithProducts(req, rows) });
});

app.get("/v1/sessions/me", butuhAuth, khususRole("penjastip"), async (req, res) => {
  const rows = db.prepare(`SELECT *, kapasitas_maksimal-kapasitas_terpakai AS kapasitas_tersisa FROM sesi_jastip WHERE pembuka=? ORDER BY id DESC`).all(req.user.sub);
  res.json({ sessions: await sessionsWithProducts(req, rows) });
});

app.post("/v1/sessions", butuhAuth, khususRole("penjastip"), async (req, res) => {
  const tokoId = Number(req.body.storeId);
  const kapasitas = Number(req.body.kapasitas);
  const batasWaktu = req.body.batasWaktu;
  const productIds = [...new Set((req.body.productIds || []).map(Number))];
  if (!Number.isInteger(tokoId) || !Number.isInteger(kapasitas) || kapasitas < 1 || !batasWaktu || Number.isNaN(Date.parse(batasWaktu)) || !productIds.length || productIds.some((id) => !Number.isInteger(id))) {
    return res.status(400).json({ error: "storeId, productIds, kapasitas, dan batasWaktu yang valid wajib diisi" });
  }
  if (Date.parse(batasWaktu) <= Date.now()) return res.status(400).json({ error: "batasWaktu harus di masa depan" });
  const catalog = await panggilTahan(`${CATALOG_URL}/v1/items?ids=${productIds.join(",")}`);
  const products = catalog?.items || [];
  if (products.length !== productIds.length || products.some((p) => String(p.owner_id) !== String(req.user.sub) || Number(p.toko_id) !== tokoId)) {
    return res.status(403).json({ error: "toko dan seluruh produk harus aktif serta milik Anda" });
  }
  const storeName = products[0].toko_nama;
  try {
    db.exec("BEGIN IMMEDIATE");
    const result = db.prepare(`INSERT INTO sesi_jastip (pembuka,toko_id,toko_nama,batas_waktu,kapasitas_maksimal) VALUES (?,?,?,?,?)`)
      .run(req.user.sub, tokoId, storeName, batasWaktu, kapasitas);
    const sessionId = Number(result.lastInsertRowid);
    const insert = db.prepare("INSERT INTO sesi_produk (sesi_id,barang_id) VALUES (?,?)");
    productIds.forEach((id) => insert.run(sessionId, id));
    db.exec("COMMIT");
    const row = db.prepare("SELECT * FROM sesi_jastip WHERE id=?").get(sessionId);
    res.status(201).json({ ...row, products });
  } catch (err) { try { db.exec("ROLLBACK"); } catch {} throw err; }
});

app.post("/v1/sessions/:id/close", butuhAuth, khususRole("penjastip"), (req, res) => {
  const result = db.prepare("UPDATE sesi_jastip SET status = 'ditutup' WHERE id = ? AND pembuka = ?").run(Number(req.params.id), req.user.sub);
  if (!result.changes) return res.status(404).json({ error: "sesi tidak ditemukan atau bukan milik Anda" });
  res.json({ ok: true });
});

// Resource-contention endpoint: reserves one carrying-capacity slot atomically.
app.post("/v1/titipan", butuhAuth, khususRole("penitip"), async (req, res) => {
  const sesiId = Number(req.body.sesiId);
  const barangId = Number(req.body.barangId);
  const qty = Number(req.body.qty);
  const key = req.headers["idempotency-key"];
  if (!Number.isInteger(sesiId) || !Number.isInteger(barangId) || !Number.isInteger(qty) || qty < 1 || !key) {
    return res.status(400).json({ error: "sesiId, barangId, qty, dan header Idempotency-Key wajib valid" });
  }
  const existing = db.prepare("SELECT * FROM titipan WHERE idempotency_key = ?").get(key);
  if (existing) return res.status(200).json(existing);

  if (!db.prepare("SELECT 1 FROM sesi_produk WHERE sesi_id=? AND barang_id=?").get(sesiId, barangId)) {
    return res.status(409).json({ error: "produk tidak tersedia pada sesi ini" });
  }

  const item = await panggilTahan(`${CATALOG_URL}/v1/items/${barangId}`);
  if (!item || item._status === 404) return res.status(item?._status === 404 ? 404 : 503).json({ error: "barang tidak ditemukan atau katalog tidak tersedia" });
  const total = Number(item.harga) * qty + Number(req.body.biayaJasa || 0);

  try {
    db.exec("BEGIN IMMEDIATE");
    const reserved = db.prepare(`
      UPDATE sesi_jastip SET kapasitas_terpakai = kapasitas_terpakai + 1
      WHERE id = ? AND status = 'buka'
        AND datetime(batas_waktu) > datetime('now')
        AND kapasitas_terpakai < kapasitas_maksimal
    `).run(sesiId);
    if (!reserved.changes) {
      db.exec("ROLLBACK");
      return res.status(409).json({ error: "sesi ditutup, kedaluwarsa, atau kapasitas penuh" });
    }
    const result = db.prepare(`
      INSERT INTO titipan (sesi_id, pemesan, barang_id, qty, nama_barang, harga_satuan, total, catatan, idempotency_key)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run(sesiId, req.user.sub, barangId, qty, item.nama, item.harga, total, req.body.catatan || null, key);
    db.exec("COMMIT");
    return res.status(201).json({ id: Number(result.lastInsertRowid), sesiId, barangId, qty, namaBarang: item.nama, hargaSatuan: item.harga, total, status: "menunggu_pembayaran" });
  } catch (err) {
    try { db.exec("ROLLBACK"); } catch {}
    if (String(err.message).includes("UNIQUE")) {
      return res.status(200).json(db.prepare("SELECT * FROM titipan WHERE idempotency_key = ?").get(key));
    }
    throw err;
  }
});

app.get("/v1/titipan/me", butuhAuth, (req, res) => {
  res.json({ titipan: db.prepare("SELECT * FROM titipan WHERE pemesan = ? ORDER BY id DESC").all(req.user.sub) });
});

app.get("/internal/titipan/:id", internalOnly, (req, res) => {
  const row = db.prepare("SELECT * FROM titipan WHERE id = ?").get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: "titipan tidak ditemukan" });
  res.json(row);
});

app.patch("/internal/titipan/:id/status", internalOnly, (req, res) => {
  const allowed = ["menunggu_pembayaran", "dibayar", "dibatalkan", "selesai"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: "status tidak valid" });
  const result = db.prepare("UPDATE titipan SET status = ? WHERE id = ?").run(req.body.status, Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: "titipan tidak ditemukan" });
  res.json({ ok: true });
});

app.get("/internal/users/:id/penjastip", internalOnly, (req, res) => {
  const user = db.prepare("SELECT id,nama,email FROM users WHERE id=? AND role='penjastip' AND aktif=1").get(Number(req.params.id));
  if (!user) return res.status(404).json({ error: "penjastip aktif tidak ditemukan" });
  res.json({ user });
});
app.get("/internal/users/:id/access", internalOnly, (req, res) => {
  const user = db.prepare("SELECT id,role,aktif FROM users WHERE id=?").get(Number(req.params.id));
  if (!user || !user.aktif) return res.status(404).json({ error: "akun aktif tidak ditemukan" });
  res.json({ user });
});

app.get("/internal/stores/:id/active-session", internalOnly, (req, res) => {
  const found = db.prepare("SELECT id FROM sesi_jastip WHERE toko_id=? AND status='buka' AND datetime(batas_waktu)>datetime('now') LIMIT 1").get(Number(req.params.id));
  res.json({ active: Boolean(found), sessionId: found?.id || null });
});
app.post("/internal/admin-audit", internalOnly, (req, res) => {
  const { actorId, action, resourceType, resourceId, before = null, after = null } = req.body;
  if (!actorId || !action || !resourceType) return res.status(400).json({ error: "audit tidak valid" });
  audit(actorId, action, resourceType, resourceId, before, after);
  res.status(201).json({ ok: true });
});

app.get("/v1/admin/users", butuhAuth, adminOnly, (req, res) => {
  const { page, limit, offset } = pageArgs(req);
  const q = `%${String(req.query.q || "").trim()}%`;
  const role = ["penitip", "penjastip", "admin"].includes(req.query.role) ? req.query.role : null;
  const active = req.query.aktif === undefined ? null : req.query.aktif === "1" ? 1 : 0;
  const where = "WHERE (nama LIKE ? OR email LIKE ?) AND (? IS NULL OR role=?) AND (? IS NULL OR aktif=?)";
  const params = [q, q, role, role, active, active];
  const total = db.prepare(`SELECT COUNT(*) AS n FROM users ${where}`).get(...params).n;
  const users = db.prepare(`SELECT id,nama,email,no_hp,kampus,role,aktif,created_at FROM users ${where} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
  res.json({ users, pagination: { page, limit, total } });
});

app.get("/v1/admin/users/:id", butuhAuth, adminOnly, (req, res) => {
  const user = db.prepare("SELECT id,nama,email,no_hp,kampus,role,aktif,created_at FROM users WHERE id=?").get(Number(req.params.id));
  if (!user) return res.status(404).json({ error: "akun tidak ditemukan" });
  res.json({ user });
});

app.post("/v1/admin/users", butuhAuth, adminOnly, async (req, res) => {
  const { nama, email, password, noHp = null, kampus = null, role } = req.body;
  if (!nama?.trim() || !email?.trim() || typeof password !== "string" || password.length < 8 || !["penitip", "penjastip", "admin"].includes(role)) return res.status(400).json({ error: "nama, email, password minimal 8 karakter, dan role valid wajib diisi" });
  try {
    const result = db.prepare("INSERT INTO users (nama,email,no_hp,kampus,password_hash,role) VALUES (?,?,?,?,?,?)")
      .run(nama.trim(), email.trim().toLowerCase(), noHp, kampus, await hashPassword(password), role);
    const user = db.prepare("SELECT id,nama,email,no_hp,kampus,role,aktif,created_at FROM users WHERE id=?").get(Number(result.lastInsertRowid));
    audit(req.user.sub, "create", "user", user.id, null, user);
    res.status(201).json({ user });
  } catch (err) { if (String(err.message).includes("UNIQUE")) return res.status(409).json({ error: "email sudah terdaftar" }); throw err; }
});

app.patch("/v1/admin/users/:id", butuhAuth, adminOnly, async (req, res) => {
  const id = Number(req.params.id); const before = db.prepare("SELECT * FROM users WHERE id=?").get(id);
  if (!before) return res.status(404).json({ error: "akun tidak ditemukan" });
  const role = req.body.role ?? before.role; const aktif = req.body.aktif === undefined ? before.aktif : req.body.aktif ? 1 : 0;
  if (!["penitip", "penjastip", "admin"].includes(role)) return res.status(400).json({ error: "role tidak valid" });
  if (id === Number(req.user.sub) && !aktif) return res.status(409).json({ error: "admin tidak dapat menonaktifkan akun sendiri" });
  if (before.role === "admin" && before.aktif && (role !== "admin" || !aktif) && db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='admin' AND aktif=1").get().n <= 1) return res.status(409).json({ error: "admin aktif terakhir tidak dapat dinonaktifkan" });
  const hash = req.body.password ? await hashPassword(req.body.password) : before.password_hash;
  db.prepare("UPDATE users SET nama=?,email=?,no_hp=?,kampus=?,role=?,aktif=?,password_hash=? WHERE id=?")
    .run(req.body.nama?.trim() || before.nama, req.body.email?.trim().toLowerCase() || before.email, req.body.noHp ?? before.no_hp, req.body.kampus ?? before.kampus, role, aktif, hash, id);
  const after = db.prepare("SELECT id,nama,email,no_hp,kampus,role,aktif,created_at FROM users WHERE id=?").get(id);
  audit(req.user.sub, "update", "user", id, { ...before, password_hash: undefined }, after);
  res.json({ user: after });
});

app.delete("/v1/admin/users/:id", butuhAuth, adminOnly, (req, res, next) => {
  req.body = { ...req.body, aktif: false };
  next();
}, async (req, res) => {
  // Keep DELETE semantics explicit without duplicating the safety rules.
  const id = Number(req.params.id); const before = db.prepare("SELECT * FROM users WHERE id=?").get(id);
  if (!before) return res.status(404).json({ error: "akun tidak ditemukan" });
  if (id === Number(req.user.sub)) return res.status(409).json({ error: "admin tidak dapat menonaktifkan akun sendiri" });
  if (before.role === "admin" && before.aktif && db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='admin' AND aktif=1").get().n <= 1) return res.status(409).json({ error: "admin aktif terakhir tidak dapat dinonaktifkan" });
  db.prepare("UPDATE users SET aktif=0 WHERE id=?").run(id);
  audit(req.user.sub, "deactivate", "user", id, { aktif: before.aktif }, { aktif: 0 });
  res.status(204).end();
});

app.get("/v1/admin/sessions", butuhAuth, adminOnly, async (req, res) => {
  const { page, limit, offset } = pageArgs(req); const status = req.query.status || null;
  const total = db.prepare("SELECT COUNT(*) AS n FROM sesi_jastip WHERE (? IS NULL OR status=?)").get(status, status).n;
  const rows = db.prepare("SELECT *,kapasitas_maksimal-kapasitas_terpakai AS kapasitas_tersisa FROM sesi_jastip WHERE (? IS NULL OR status=?) ORDER BY id DESC LIMIT ? OFFSET ?").all(status, status, limit, offset);
  res.json({ sessions: await sessionsWithProducts(req, rows), pagination: { page, limit, total } });
});

app.patch("/v1/admin/sessions/:id", butuhAuth, adminOnly, (req, res) => {
  const before = db.prepare("SELECT * FROM sesi_jastip WHERE id=?").get(Number(req.params.id));
  if (!before) return res.status(404).json({ error: "sesi tidak ditemukan" });
  if (req.body.status !== "ditutup") return res.status(409).json({ error: "admin hanya dapat menutup sesi" });
  db.prepare("UPDATE sesi_jastip SET status='ditutup' WHERE id=?").run(before.id);
  audit(req.user.sub, "close", "session", before.id, { status: before.status }, { status: "ditutup" });
  res.json({ session: db.prepare("SELECT * FROM sesi_jastip WHERE id=?").get(before.id) });
});

app.get("/v1/admin/orders", butuhAuth, adminOnly, (req, res) => {
  const { page, limit, offset } = pageArgs(req); const status = req.query.status || null;
  const total = db.prepare("SELECT COUNT(*) AS n FROM titipan WHERE (? IS NULL OR status=?)").get(status, status).n;
  const orders = db.prepare("SELECT * FROM titipan WHERE (? IS NULL OR status=?) ORDER BY id DESC LIMIT ? OFFSET ?").all(status, status, limit, offset);
  res.json({ orders, pagination: { page, limit, total } });
});

const adminOrderTransitions = { menunggu_pembayaran: ["dibatalkan"], dibayar: ["dibatalkan", "selesai"], dibatalkan: [], selesai: [] };
app.patch("/v1/admin/orders/:id/status", butuhAuth, adminOnly, (req, res) => {
  const before = db.prepare("SELECT * FROM titipan WHERE id=?").get(Number(req.params.id));
  if (!before) return res.status(404).json({ error: "titipan tidak ditemukan" });
  if (!(adminOrderTransitions[before.status] || []).includes(req.body.status)) return res.status(409).json({ error: "transisi status tidak diizinkan", allowed: adminOrderTransitions[before.status] || [] });
  db.prepare("UPDATE titipan SET status=? WHERE id=?").run(req.body.status, before.id);
  audit(req.user.sub, "status", "order", before.id, { status: before.status }, { status: req.body.status });
  res.json({ order: db.prepare("SELECT * FROM titipan WHERE id=?").get(before.id) });
});

app.get("/v1/admin/audit", butuhAuth, adminOnly, (req, res) => {
  const { page, limit, offset } = pageArgs(req); const total = db.prepare("SELECT COUNT(*) AS n FROM admin_audit").get().n;
  res.json({ audit: db.prepare("SELECT * FROM admin_audit ORDER BY id DESC LIMIT ? OFFSET ?").all(limit, offset), pagination: { page, limit, total } });
});

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
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-request-id": req.rid },
        body: JSON.stringify({ qty }),
      }
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
