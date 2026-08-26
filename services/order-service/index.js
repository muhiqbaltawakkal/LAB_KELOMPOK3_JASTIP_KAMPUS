const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const os = require("node:os");
const { promisify } = require("node:util");
const { createClient } = require("redis");
const { pool, ready } = require("./db");

const scrypt = promisify(crypto.scrypt);
const SECRET = process.env.JWT_SECRET;
const SERVICE_TOKEN = process.env.SERVICE_TOKEN;
const CATALOG_URL = process.env.CATALOG_URL || "http://localhost:3001";
if (!SECRET || SECRET.length < 32 || !SERVICE_TOKEN || SERVICE_TOKEN.length < 32 || !process.env.DATABASE_URL) throw new Error("DATABASE_URL, JWT_SECRET, dan SERVICE_TOKEN wajib diisi");

const app = express();
app.use(express.json());
app.use((req, res, next) => { req.rid = req.headers["x-request-id"] || crypto.randomUUID(); res.setHeader("x-request-id", req.rid); next(); });
const log = (level, message, extra = {}) => console.log(JSON.stringify({ ts: new Date().toISOString(), service: "order", instance: os.hostname(), level, message, ...extra }));
const rolesFor = (accountType) => accountType === "admin" ? ["admin"] : ["penitip", "penjastip"];
const publicUser = (row) => ({ id: row.id, nama: row.nama, email: row.email, noHp: row.no_hp, kampus: row.kampus, accountType: row.account_type, role: row.account_type === "admin" ? "admin" : "penjastip", roles: rolesFor(row.account_type), aktif: row.aktif });
const pageArgs = (req) => { const page = Math.max(1, parseInt(req.query.page, 10) || 1); const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20)); return { page, limit, offset: (page - 1) * limit }; };

const SERVICE_SCOPE = process.env.SERVICE_SCOPE || "all";
const SCOPE_ROUTES = {
  auth:      [/^\/v1\/register$/, /^\/v1\/login$/, /^\/v1\/me$/],
  penitip:   [/^\/v1\/titipan(\/|$)/, /^\/v1\/sessions(\/|$)/],
  penjastip: [/^\/v1\/sessions(\/|$)/, /^\/v1\/penjastip(\/|$)/, /^\/v1\/offers(\/|$)/],
  admin:     [/^\/v1\/admin(\/|$)/],
  internal:  [/^\/internal(\/|$)/],
};

// Tiap container hanya melayani endpoint milik jenis user-nya (pola bulkhead).
app.use((req, res, next) => {
  if (SERVICE_SCOPE === "all" || req.path === "/health") return next();
  const allowed = SCOPE_ROUTES[SERVICE_SCOPE] || [];
  if (allowed.some((pattern) => pattern.test(req.path))) return next();
  log("warn", "endpoint di luar scope container", { rid: req.rid, path: req.path, scope: SERVICE_SCOPE });
  res.status(404).json({ error: "endpoint tidak dilayani container ini", scope: SERVICE_SCOPE });
});

let redis;
async function startRedis() {
  try { redis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" }); redis.on("error", () => {}); await redis.connect(); }
  catch { redis = null; log("warn", "redis tidak tersedia"); }
}
startRedis();

async function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) { const derived = await scrypt(password, salt, 64); return `${salt}:${derived.toString("hex")}`; }
async function passwordMatches(password, stored) { const [salt, expectedHex] = String(stored).split(":"); if (!salt || !expectedHex) return false; const actual = await scrypt(password, salt, 64); const expected = Buffer.from(expectedHex, "hex"); return actual.length === expected.length && crypto.timingSafeEqual(actual, expected); }
async function auth(req, res, next) {
  try {
    const token = jwt.verify((req.headers.authorization || "").replace(/^Bearer\s+/i, ""), SECRET);
    const { rows } = await pool.query("SELECT * FROM users WHERE id=$1 AND aktif", [token.sub]);
    if (!rows[0]) throw new Error(); req.user = { ...token, roles: rolesFor(rows[0].account_type), accountType: rows[0].account_type }; next();
  } catch { res.status(401).json({ error: "akun tidak aktif atau token tidak valid" }); }
}
const allow = (...roles) => (req, res, next) => roles.some((role) => req.user?.roles.includes(role)) ? next() : res.status(403).json({ error: "role tidak diizinkan" });
const internal = (req, res, next) => req.headers["x-service-token"] === SERVICE_TOKEN ? next() : res.status(401).json({ error: "akses internal ditolak" });
async function jsonFetch(url, options = {}, retries = 1) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try { const response = await fetch(url, { ...options, signal: AbortSignal.timeout(2000) }); const body = await response.json().catch(() => ({})); return { ok: response.ok, status: response.status, body }; }
    catch (error) { if (attempt === retries) return { ok: false, status: 503, body: { error: "service tidak tersedia" } }; }
  }
}
async function rateLimit(req, res, next) {
  if (!redis) return next();
  try { const key = `rate:titipan:${req.user.sub}:${Math.floor(Date.now() / 60000)}`; const count = await redis.incr(key); if (count === 1) await redis.expire(key, 60); if (count > 120) { res.setHeader("Retry-After", "60"); return res.status(429).json({ error: "batas laju terlampaui" }); } }
  catch {} next();
}
async function addOutbox(client, topic, payload) { const id = crypto.randomUUID(); await client.query("INSERT INTO outbox_events(id,topic,payload) VALUES($1,$2,$3)", [id, topic, JSON.stringify({ eventId: id, ...payload })]); return id; }
async function publishOutbox() {
  if (!redis) return;
  const { rows } = await pool.query("SELECT * FROM outbox_events WHERE published_at IS NULL ORDER BY created_at LIMIT 100");
  for (const event of rows) { try { await redis.publish(event.topic, JSON.stringify(event.payload)); await pool.query("UPDATE outbox_events SET published_at=now() WHERE id=$1", [event.id]); } catch { break; } }
}
setInterval(() => publishOutbox().catch(() => {}), 1000).unref();

async function expireReservations() {
  await ready;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`WITH expired AS (
      UPDATE titipan SET status='kedaluwarsa',capacity_released_at=now(),updated_at=now()
      WHERE capacity_released_at IS NULL AND reservation_expires_at<=now() AND status IN ('menunggu_tawaran','tawaran_ditolak','menunggu_pembayaran')
      RETURNING session_id,qty
    ), totals AS (SELECT session_id,sum(qty)::int qty FROM expired GROUP BY session_id)
    UPDATE sessions s SET kapasitas_terpakai=GREATEST(0,s.kapasitas_terpakai-t.qty) FROM totals t WHERE s.id=t.session_id`);
    await client.query("UPDATE offers SET status='expired',responded_at=now() WHERE status='pending' AND titipan_id IN (SELECT id FROM titipan WHERE status='kedaluwarsa')");
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
}
setInterval(() => expireReservations().catch((error) => log("error", "expiry gagal", { error: error.message })), 60000).unref();

app.post("/v1/register", async (req, res) => {
  await ready; const { nama, email, password, noHp = null, kampus = null } = req.body;
  if (!nama || !email || !password || password.length < 8) return res.status(400).json({ error: "nama, email, dan password minimal 8 karakter wajib" });
  try { const { rows } = await pool.query("INSERT INTO users(nama,email,no_hp,kampus,password_hash) VALUES($1,$2,$3,$4,$5) RETURNING *", [nama.trim(), email.trim().toLowerCase(), noHp, kampus, await hashPassword(password)]); res.status(201).json(publicUser(rows[0])); }
  catch (error) { if (error.code === "23505") return res.status(409).json({ error: "email sudah terdaftar" }); throw error; }
});
app.post("/v1/login", async (req, res) => { await ready; const { rows } = await pool.query("SELECT * FROM users WHERE email=$1", [String(req.body.email || "").trim().toLowerCase()]); const user = rows[0]; if (!user || !user.aktif || !(await passwordMatches(req.body.password || "", user.password_hash))) return res.status(401).json({ error: "email atau password salah" }); const roles = rolesFor(user.account_type); const token = jwt.sign({ sub: String(user.id), email: user.email, nama: user.nama, roles, accountType: user.account_type }, SECRET, { expiresIn: "8h" }); res.json({ token, user: publicUser(user) }); });
app.get("/v1/me", auth, async (req, res) => { const { rows } = await pool.query("SELECT * FROM users WHERE id=$1", [req.user.sub]); res.json({ user: publicUser(rows[0]) }); });

async function attachProducts(rows) {
  const ids = [...new Set(rows.flatMap((row) => row.product_ids || []))];

  if (!ids.length) {
    return rows.map((row) => ({ ...row, products: [] }));
  }

  const result = await jsonFetch(
    `${CATALOG_URL}/v1/items?ids=${ids.join(",")}`
  );

  if (!result.ok) {
    return rows.map((row) => ({
      ...row,
      products: [],
      catalogUnavailable: true
    }));
  }

  return rows.map((row) => ({
    ...row,
    products: result.body.items.filter((p) =>
      row.product_ids.map(Number).includes(Number(p.id))
    )
  }));
}
const sessionSelect = `SELECT s.*,COALESCE(array_agg(sp.product_id) FILTER(WHERE sp.product_id IS NOT NULL),'{}') product_ids,(s.kapasitas_maksimal-s.kapasitas_terpakai) kapasitas_tersisa FROM sessions s LEFT JOIN session_products sp ON sp.session_id=s.id`;
app.get("/v1/sessions", async (req, res) => { await expireReservations(); const { page, limit, offset } = pageArgs(req); const { rows } = await pool.query(`${sessionSelect} WHERE s.status='buka' AND s.batas_waktu>now() GROUP BY s.id ORDER BY s.batas_waktu LIMIT $1 OFFSET $2`, [limit, offset]); const total = await pool.query("SELECT count(*)::int n FROM sessions WHERE status='buka' AND batas_waktu>now()"); res.json({ sessions: await attachProducts(rows), pagination: { page, limit, total: total.rows[0].n } }); });
app.get("/v1/sessions/me", auth, allow("penjastip"), async (req, res) => { const { rows } = await pool.query(`${sessionSelect} WHERE s.owner_id=$1 GROUP BY s.id ORDER BY s.id DESC`, [req.user.sub]); res.json({ sessions: await attachProducts(rows) }); });
app.get("/v1/sessions/:id", async (req, res) => { await expireReservations(); const { rows } = await pool.query(`${sessionSelect} WHERE s.id=$1 GROUP BY s.id`, [req.params.id]); if (!rows[0]) return res.status(404).json({ error: "sesi tidak ditemukan" }); res.json((await attachProducts(rows))[0]); });
app.post("/v1/sessions", auth, allow("penjastip"), async (req, res) => {
  const storeId = Number(req.body.storeId), capacity = Number(req.body.kapasitas), fee = Number(req.body.biayaJasaPerUnit), deadline = new Date(req.body.batasWaktu), productIds = [...new Set((req.body.productIds || []).map(Number))];
  if (!Number.isInteger(storeId) || !Number.isInteger(capacity) || capacity < 1 || !Number.isInteger(fee) || fee < 0 || Number.isNaN(deadline.valueOf()) || deadline <= new Date() || !productIds.length) return res.status(400).json({ error: "data sesi tidak valid" });
  const ownership = await jsonFetch(`${CATALOG_URL}/internal/ownership?ownerId=${req.user.sub}&storeId=${storeId}&productIds=${productIds.join(",")}`, { headers: { "x-service-token": SERVICE_TOKEN } });
  if (!ownership.ok) return res.status(ownership.status === 503 ? 503 : 403).json({ error: ownership.body.error || "ownership katalog tidak valid" });
  const client = await pool.connect(); try { await client.query("BEGIN"); const inserted = await client.query("INSERT INTO sessions(owner_id,store_id,store_name,batas_waktu,kapasitas_maksimal,biaya_jasa_per_unit) VALUES($1,$2,$3,$4,$5,$6) RETURNING *", [req.user.sub, storeId, ownership.body.store.nama, deadline, capacity, fee]); for (const id of productIds) await client.query("INSERT INTO session_products(session_id,product_id) VALUES($1,$2)", [inserted.rows[0].id, id]); await client.query("COMMIT"); res.status(201).json({ ...inserted.rows[0], products: ownership.body.products }); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
});
app.post("/v1/sessions/:id/close", auth, allow("penjastip"), async (req, res) => { const result = await pool.query("UPDATE sessions SET status='ditutup' WHERE id=$1 AND owner_id=$2 AND status='buka'", [req.params.id, req.user.sub]); if (!result.rowCount) return res.status(404).json({ error: "sesi tidak ditemukan" }); res.json({ ok: true }); });

app.post("/v1/titipan", auth, allow("penitip"), rateLimit, async (req, res) => {
  await expireReservations(); const sessionId = Number(req.body.sesiId), productId = Number(req.body.barangId), qty = Number(req.body.qty), mode = req.body.mode === "tawar" ? "tawar" : "langsung", offered = Number(req.body.tawaranJasaPerUnit); const key = req.headers["idempotency-key"];
  if (!key || !Number.isInteger(sessionId) || !Number.isInteger(productId) || !Number.isInteger(qty) || qty < 1 || (mode === "tawar" && (!Number.isInteger(offered) || offered < 0))) return res.status(400).json({ error: "payload titipan atau Idempotency-Key tidak valid" });
  const existing = await pool.query("SELECT * FROM titipan WHERE idempotency_key=$1", [key]); if (existing.rows[0]) return res.json(existing.rows[0]);
  const productMember = await pool.query("SELECT 1 FROM session_products WHERE session_id=$1 AND product_id=$2", [sessionId, productId]); if (!productMember.rowCount) return res.status(409).json({ error: "produk tidak tersedia pada sesi" });
  const product = await jsonFetch(`${CATALOG_URL}/v1/items/${productId}`); if (!product.ok) return res.status(product.status === 404 ? 404 : 503).json({ error: "katalog tidak tersedia" });
  const client = await pool.connect(); try {
    await client.query("BEGIN");
    const reserved = await client.query(`UPDATE sessions SET kapasitas_terpakai=kapasitas_terpakai+$1 WHERE id=$2 AND status='buka' AND batas_waktu>now() AND kapasitas_terpakai+$1<=kapasitas_maksimal RETURNING *`, [qty, sessionId]);
    if (!reserved.rows[0]) { await client.query("ROLLBACK"); return res.status(409).json({ error: "sesi tutup, kedaluwarsa, atau kapasitas tidak cukup" }); }
    const session = reserved.rows[0]; const expiry = new Date(Math.min(Date.now() + 30 * 60 * 1000, new Date(session.batas_waktu).valueOf())); const agreedFee = mode === "langsung" ? session.biaya_jasa_per_unit : null; const total = agreedFee == null ? null : (product.body.harga + agreedFee) * qty; const status = mode === "tawar" ? "menunggu_tawaran" : "menunggu_pembayaran";
    const inserted = await client.query(`INSERT INTO titipan(session_id,customer_id,product_id,qty,product_name,unit_price,variant,note,mode,base_service_fee,agreed_service_fee,total,status,reservation_expires_at,idempotency_key) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`, [sessionId, req.user.sub, productId, qty, product.body.nama, product.body.harga, req.body.varian || null, req.body.catatan || null, mode, session.biaya_jasa_per_unit, agreedFee, total, status, expiry, key]);
    let offer = null; if (mode === "tawar") offer = (await client.query("INSERT INTO offers(titipan_id,proposer_id,amount_per_unit,round) VALUES($1,$2,$3,1) RETURNING *", [inserted.rows[0].id, req.user.sub, offered])).rows[0];
    await addOutbox(client, "titipan.dibuat", { titipanId: inserted.rows[0].id, sessionId, customerId: Number(req.user.sub), qty, status }); await client.query("COMMIT"); res.status(201).json({ ...inserted.rows[0], offer });
  } catch (error) { await client.query("ROLLBACK"); if (error.code === "23505") return res.json((await pool.query("SELECT * FROM titipan WHERE idempotency_key=$1", [key])).rows[0]); throw error; } finally { client.release(); }
});

app.get("/v1/titipan/me", auth, async (req, res) => { await expireReservations(); const { rows } = await pool.query(`SELECT t.*,s.store_name,(SELECT row_to_json(o) FROM offers o WHERE o.titipan_id=t.id ORDER BY o.round DESC LIMIT 1) latest_offer FROM titipan t JOIN sessions s ON s.id=t.session_id WHERE t.customer_id=$1 ORDER BY t.id DESC`, [req.user.sub]); res.json({ titipan: rows }); });
app.get("/v1/penjastip/titipan", auth, allow("penjastip"), async (req, res) => { await expireReservations(); const { rows } = await pool.query(`SELECT t.*,s.store_name,u.nama customer_name,u.email customer_email,(SELECT row_to_json(o) FROM offers o WHERE o.titipan_id=t.id ORDER BY o.round DESC LIMIT 1) latest_offer FROM titipan t JOIN sessions s ON s.id=t.session_id JOIN users u ON u.id=t.customer_id WHERE s.owner_id=$1 ORDER BY t.id DESC`, [req.user.sub]); res.json({ titipan: rows }); });
app.post("/v1/titipan/:id/offers", auth, allow("penitip"), async (req, res) => { await expireReservations(); const amount = Number(req.body.tawaranJasaPerUnit); if (!Number.isInteger(amount) || amount < 0) return res.status(400).json({ error: "tawaran tidak valid" }); const client = await pool.connect(); try { await client.query("BEGIN"); const locked = (await client.query("SELECT * FROM titipan WHERE id=$1 AND customer_id=$2 FOR UPDATE", [req.params.id, req.user.sub])).rows[0]; if (!locked || locked.status !== "tawaran_ditolak" || new Date(locked.reservation_expires_at) <= new Date()) { await client.query("ROLLBACK"); return res.status(409).json({ error: "titipan tidak dapat direvisi" }); } const round = (await client.query("SELECT COALESCE(max(round),0)+1 round FROM offers WHERE titipan_id=$1", [locked.id])).rows[0].round; const offer = (await client.query("INSERT INTO offers(titipan_id,proposer_id,amount_per_unit,round) VALUES($1,$2,$3,$4) RETURNING *", [locked.id, req.user.sub, amount, round])).rows[0]; await client.query("UPDATE titipan SET status='menunggu_tawaran',updated_at=now() WHERE id=$1", [locked.id]); await client.query("COMMIT"); res.status(201).json(offer); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } });
  app.patch("/v1/offers/:id", auth, allow("penjastip"), async (req, res) => { const decision = req.body.decision; if (!["accepted","rejected"].includes(decision)) return res.status(400).json({ error: "decision harus accepted atau rejected" }); const client = await pool.connect(); try { await client.query("BEGIN"); const { rows } = await client.query(`SELECT o.*,t.qty,t.unit_price,t.reservation_expires_at,t.status titipan_status,s.owner_id FROM offers o JOIN titipan t ON t.id=o.titipan_id JOIN sessions s ON s.id=t.session_id WHERE o.id=$1 FOR UPDATE`, [req.params.id]); const offer = rows[0]; if (!offer || Number(offer.owner_id) !== Number(req.user.sub) || offer.status !== "pending" || offer.titipan_status !== "menunggu_tawaran" || new Date(offer.reservation_expires_at) <= new Date()) { await client.query("ROLLBACK"); return res.status(409).json({ error: "tawaran tidak dapat diproses" }); } await client.query("UPDATE offers SET status=$1,responded_at=now() WHERE id=$2", [decision, offer.id]); if (decision === "accepted") await client.query("UPDATE titipan SET agreed_service_fee=$1,total=($2::int+$1::int)*qty,status='menunggu_pembayaran',updated_at=now() WHERE id=$3", [offer.amount_per_unit, offer.unit_price, offer.titipan_id]); else await client.query("UPDATE titipan SET status='tawaran_ditolak',updated_at=now() WHERE id=$1", [offer.titipan_id]); await client.query("COMMIT"); res.json({ ...offer, status: decision }); } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } });

async function cancelTitipan(id, actorId, admin = false) { const client = await pool.connect(); try { await client.query("BEGIN"); const { rows } = await client.query(`SELECT t.*,s.owner_id FROM titipan t JOIN sessions s ON s.id=t.session_id WHERE t.id=$1 FOR UPDATE`, [id]); const item = rows[0]; if (!item || (!admin && Number(item.customer_id) !== Number(actorId)) || !["menunggu_tawaran","tawaran_ditolak","menunggu_pembayaran"].includes(item.status)) { await client.query("ROLLBACK"); return null; } await client.query("UPDATE titipan SET status='dibatalkan',capacity_released_at=COALESCE(capacity_released_at,now()),updated_at=now() WHERE id=$1", [id]); if (!item.capacity_released_at) await client.query("UPDATE sessions SET kapasitas_terpakai=GREATEST(0,kapasitas_terpakai-$1) WHERE id=$2", [item.qty, item.session_id]); await client.query("UPDATE offers SET status='expired',responded_at=now() WHERE titipan_id=$1 AND status='pending'", [id]); await client.query("COMMIT"); return { ...item, status: "dibatalkan" }; } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); } }
app.post("/v1/titipan/:id/cancel", auth, allow("penitip"), async (req, res) => { const result = await cancelTitipan(req.params.id, req.user.sub); if (!result) return res.status(409).json({ error: "titipan tidak dapat dibatalkan" }); res.json(result); });

app.get("/internal/titipan/:id", internal, async (req, res) => { await expireReservations(); const { rows } = await pool.query(`SELECT t.*,s.owner_id session_owner_id FROM titipan t JOIN sessions s ON s.id=t.session_id WHERE t.id=$1`, [req.params.id]); if (!rows[0]) return res.status(404).json({ error: "titipan tidak ditemukan" }); res.json(rows[0]); });
app.patch("/internal/titipan/:id/status", internal, async (req, res) => { const allowed = { menunggu_pembayaran: ["dibayar","dibatalkan"], dibayar: ["selesai","dibatalkan"] }; const current = (await pool.query("SELECT * FROM titipan WHERE id=$1", [req.params.id])).rows[0]; if (!current) return res.status(404).json({ error: "titipan tidak ditemukan" }); if (!(allowed[current.status] || []).includes(req.body.status)) return res.status(409).json({ error: "transisi titipan tidak valid" }); const { rows } = await pool.query("UPDATE titipan SET status=$1,updated_at=now() WHERE id=$2 RETURNING *", [req.body.status, current.id]); res.json(rows[0]); });
app.get("/internal/users/:id/access", internal, async (req, res) => { const { rows } = await pool.query("SELECT * FROM users WHERE id=$1 AND aktif", [req.params.id]); if (!rows[0]) return res.status(404).json({ error: "akun aktif tidak ditemukan" }); res.json({ user: publicUser(rows[0]) }); });
app.get("/internal/users/:id/penjastip", internal, async (req, res) => { const { rows } = await pool.query("SELECT * FROM users WHERE id=$1 AND aktif AND account_type='user'", [req.params.id]); if (!rows[0]) return res.status(404).json({ error: "pengguna aktif tidak ditemukan" }); res.json({ user: publicUser(rows[0]) }); });
app.post("/internal/admin-audit", internal, async (req, res) => { await pool.query("INSERT INTO admin_audit(actor_id,action,resource_type,resource_id,before_json,after_json) VALUES($1,$2,$3,$4,$5,$6)", [req.body.actorId, req.body.action, req.body.resourceType, req.body.resourceId == null ? null : String(req.body.resourceId), req.body.before || null, req.body.after || null]); res.status(201).json({ ok: true }); });

app.get("/v1/admin/users", auth, allow("admin"), async (req, res) => { const { page, limit, offset } = pageArgs(req); const q = `%${req.query.q || ""}%`; const data = await pool.query("SELECT * FROM users WHERE nama ILIKE $1 OR email ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3", [q, limit, offset]); const total = await pool.query("SELECT count(*)::int n FROM users WHERE nama ILIKE $1 OR email ILIKE $1", [q]); res.json({ users: data.rows.map(publicUser), pagination: { page, limit, total: total.rows[0].n } }); });
app.post("/v1/admin/users", auth, allow("admin"), async (req, res) => { if (!req.body.nama || !req.body.email || !req.body.password || req.body.password.length < 8) return res.status(400).json({ error: "data akun tidak valid" }); const type = req.body.accountType === "admin" ? "admin" : "user"; const { rows } = await pool.query("INSERT INTO users(nama,email,password_hash,account_type,no_hp,kampus) VALUES($1,$2,$3,$4,$5,$6) RETURNING *", [req.body.nama, req.body.email.toLowerCase(), await hashPassword(req.body.password), type, req.body.noHp || null, req.body.kampus || null]); res.status(201).json(publicUser(rows[0])); });
app.patch("/v1/admin/users/:id", auth, allow("admin"), async (req, res) => { const old = (await pool.query("SELECT * FROM users WHERE id=$1", [req.params.id])).rows[0]; if (!old) return res.status(404).json({ error: "akun tidak ditemukan" }); if (Number(old.id) === Number(req.user.sub) && req.body.aktif === false) return res.status(409).json({ error: "admin tidak dapat menonaktifkan diri" }); const hash = req.body.password ? await hashPassword(req.body.password) : old.password_hash; const { rows } = await pool.query("UPDATE users SET nama=$1,email=$2,no_hp=$3,kampus=$4,account_type=$5,aktif=$6,password_hash=$7,updated_at=now() WHERE id=$8 RETURNING *", [req.body.nama ?? old.nama, req.body.email?.toLowerCase() ?? old.email, req.body.noHp ?? old.no_hp, req.body.kampus ?? old.kampus, req.body.accountType ?? old.account_type, req.body.aktif ?? old.aktif, hash, old.id]); res.json(publicUser(rows[0])); });
app.delete("/v1/admin/users/:id", auth, allow("admin"), async (req, res) => { if (Number(req.params.id) === Number(req.user.sub)) return res.status(409).json({ error: "admin tidak dapat menonaktifkan diri" }); const target = (await pool.query("SELECT * FROM users WHERE id=$1", [req.params.id])).rows[0]; if (!target) return res.status(404).json({ error: "akun tidak ditemukan" }); if (target.account_type === "admin") { const count = (await pool.query("SELECT count(*)::int n FROM users WHERE account_type='admin' AND aktif")).rows[0].n; if (count <= 1) return res.status(409).json({ error: "admin aktif terakhir tidak dapat dinonaktifkan" }); } await pool.query("UPDATE users SET aktif=FALSE,updated_at=now() WHERE id=$1", [target.id]); res.status(204).end(); });
app.get("/v1/admin/sessions", auth, allow("admin"), async (req, res) => { const { page, limit, offset } = pageArgs(req); const { rows } = await pool.query("SELECT *,(kapasitas_maksimal-kapasitas_terpakai) kapasitas_tersisa FROM sessions ORDER BY id DESC LIMIT $1 OFFSET $2", [limit, offset]); const total = (await pool.query("SELECT count(*)::int n FROM sessions")).rows[0].n; res.json({ sessions: rows, pagination: { page, limit, total } }); });
app.patch("/v1/admin/sessions/:id", auth, allow("admin"), async (req, res) => { if (!["ditutup","dibatalkan"].includes(req.body.status)) return res.status(400).json({ error: "status sesi tidak valid" }); const { rows } = await pool.query("UPDATE sessions SET status=$1 WHERE id=$2 RETURNING *", [req.body.status, req.params.id]); if (!rows[0]) return res.status(404).json({ error: "sesi tidak ditemukan" }); res.json(rows[0]); });
app.get("/v1/admin/orders", auth, allow("admin"), async (req, res) => { const { page, limit, offset } = pageArgs(req); const data = await pool.query("SELECT t.*,s.store_name,s.owner_id session_owner_id FROM titipan t JOIN sessions s ON s.id=t.session_id ORDER BY t.id DESC LIMIT $1 OFFSET $2", [limit, offset]); const total = (await pool.query("SELECT count(*)::int n FROM titipan")).rows[0].n; res.json({ orders: data.rows, pagination: { page, limit, total } }); });
app.get("/v1/admin/offers", auth, allow("admin"), async (req, res) => { const { rows } = await pool.query("SELECT * FROM offers ORDER BY id DESC LIMIT 100"); res.json({ offers: rows }); });
app.get("/v1/admin/audit", auth, allow("admin"), async (req, res) => { const { rows } = await pool.query("SELECT * FROM admin_audit ORDER BY id DESC LIMIT 100"); res.json({ audit: rows }); });

app.get("/health", async (_req, res) => { try { await ready; await pool.query("SELECT 1"); res.json({ status: "ok", service: "order", instance: os.hostname() }); } catch { res.status(503).json({ status: "error", service: "order" }); } });
app.use((error, req, res, _next) => { log("error", "request gagal", { rid: req.rid, error: error.message }); res.status(500).json({ error: "kesalahan internal" }); });

if (require.main === module) ready.then(() => app.listen(3002, () => log("info", "listening", { port: 3002 })));
module.exports = { app, ready, expireReservations };
